import { createElement, useEffect, useMemo, useRef, type ReactNode } from 'react';

export const prefersReducedMotion = () =>
  typeof window !== 'undefined' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const DEFAULT_RADIUS = 0.18;
const DEFAULT_STRENGTH = 0.45;
const MOUSE_LERP = 0.08;
const STRENGTH_LERP_IN = 0.06;
// 0.10 per the spec decays in ~470ms; 0.15 lands within the ~400ms target.
const STRENGTH_LERP_OUT = 0.15;
const IDLE_EPSILON = 0.001;
const RESIZE_DEBOUNCE_MS = 150;

interface GlyphGrid {
  children: ReactNode[];
  rows: number;
  cols: number;
  /** rows × cols cell lookup; value = glyph index, -1 = whitespace cell. */
  cellToGlyph: Int32Array;
  glyphCount: number;
}

/**
 * Split the ASCII block into one <span> per visible glyph, leaving runs of
 * whitespace (spaces, \n, \r) as plain text nodes so the pre's textContent —
 * and therefore selection/copy — stays character-identical to the source.
 */
function buildGlyphGrid(text: string): GlyphGrid {
  const lines = text.split('\n').map((line) => line.replace(/\r$/, ''));
  const rows = lines.length;
  const cols = Math.max(...lines.map((line) => line.length));
  const cellToGlyph = new Int32Array(rows * cols).fill(-1);

  const children: ReactNode[] = [];
  let run = '';
  let row = 0;
  let col = 0;
  let glyphCount = 0;
  for (const ch of text) {
    if (ch === ' ' || ch === '\n' || ch === '\r') {
      run += ch;
    } else {
      if (run) {
        children.push(run);
        run = '';
      }
      cellToGlyph[row * cols + col] = glyphCount++;
      children.push(
        createElement('span', { key: children.length, className: 'inline-block' }, ch),
      );
    }
    if (ch === '\n') {
      row++;
      col = 0;
    } else {
      col++;
    }
  }
  if (run) children.push(run);

  return { children, rows, cols, cellToGlyph, glyphCount };
}

/**
 * Cursor-following "lens bulge" over an ASCII-art <pre>, applied per character:
 * glyphs near the cursor scale up and displace outward via CSS transforms, so
 * the portrait remains real, selectable DOM text throughout.
 *
 * Attach `containerRef` to the positioned wrapper (with optional data-radius /
 * data-strength tunables), `preRef` to the <pre>, and render `children` inside
 * it. Under reduced motion or on touch devices no listeners attach and the
 * text renders statically.
 */
export function useAsciiTextBulge(text: string) {
  const containerRef = useRef<HTMLDivElement>(null);
  const preRef = useRef<HTMLPreElement>(null);
  const grid = useMemo(() => buildGlyphGrid(text), [text]);

  useEffect(() => {
    const container = containerRef.current;
    const pre = preRef.current;
    if (!container || !pre) return;
    if (prefersReducedMotion()) return;
    if (!window.matchMedia('(hover: hover)').matches) return;

    const { rows, cols, cellToGlyph, glyphCount } = grid;
    // Spans appear in document order = glyph emission order.
    const spans = Array.from(pre.getElementsByTagName('span'));
    if (spans.length !== glyphCount) return;

    const radiusFactor = parseFloat(container.dataset.radius ?? '') || DEFAULT_RADIUS;
    const maxStrength = parseFloat(container.dataset.strength ?? '') || DEFAULT_STRENGTH;

    let disposed = false;
    let rafId: number | null = null;
    let pointerInside = false;
    let intersecting = true;
    // Geometry, cached outside the frame loop (which does DOM writes only).
    let rect: DOMRect | null = null;
    let charW = 0;
    let lineH = 0;
    let radiusPx = 0;
    // Lens state, in pre-local px.
    const mouse = { x: 0, y: 0 };
    const target = { x: 0, y: 0 };
    let strength = 0;
    // Per-frame bookkeeping: which glyphs currently carry a transform, and a
    // frame stamp so glyphs the lens left get cleared even on fast jumps.
    let active: number[] = [];
    const lastFrame = new Int32Array(glyphCount).fill(-1);
    let frame = 0;
    // Quantised (mouse, strength) of the last written frame; when neither has
    // visibly changed the frame is a no-op and no DOM writes happen at all.
    let prevQx = NaN;
    let prevQy = NaN;
    let prevQs = NaN;

    const measure = () => {
      const next = pre.getBoundingClientRect();
      if (next.width < 1 || next.height < 1) return;
      rect = next;
      charW = rect.width / cols;
      lineH = rect.height / rows;
      radiusPx = radiusFactor * Math.min(rect.width, rect.height);
      if (mouse.x === 0 && mouse.y === 0) {
        mouse.x = rect.width / 2;
        mouse.y = rect.height / 2;
      }
      prevQx = NaN; // force a rewrite: cached transforms use stale geometry
    };

    const clearAll = () => {
      for (const gi of active) spans[gi].style.transform = '';
      active = [];
      prevQx = NaN;
    };

    const tick = () => {
      rafId = null;
      frame++;
      mouse.x += (target.x - mouse.x) * MOUSE_LERP;
      mouse.y += (target.y - mouse.y) * MOUSE_LERP;
      const goal = pointerInside ? maxStrength : 0;
      strength += (goal - strength) * (pointerInside ? STRENGTH_LERP_IN : STRENGTH_LERP_OUT);
      if (!pointerInside && strength < IDLE_EPSILON) strength = 0;

      if (strength === 0 && !pointerInside) {
        // Fully decayed: restore every glyph and suspend the loop — no frame
        // budget spent on a static image.
        clearAll();
        return;
      }

      const qx = Math.round(mouse.x * 10);
      const qy = Math.round(mouse.y * 10);
      const qs = Math.round(strength * 1000);
      if (qx !== prevQx || qy !== prevQy || qs !== prevQs) {
        prevQx = qx;
        prevQy = qy;
        prevQs = qs;
        const next: number[] = [];
        // Only cells inside the lens bounding box are visited.
        const r0 = Math.max(0, Math.floor((mouse.y - radiusPx) / lineH));
        const r1 = Math.min(rows - 1, Math.ceil((mouse.y + radiusPx) / lineH));
        const c0 = Math.max(0, Math.floor((mouse.x - radiusPx) / charW));
        const c1 = Math.min(cols - 1, Math.ceil((mouse.x + radiusPx) / charW));
        for (let row = r0; row <= r1; row++) {
          const base = row * cols;
          const cy = (row + 0.5) * lineH;
          for (let col = c0; col <= c1; col++) {
            const gi = cellToGlyph[base + col];
            if (gi < 0) continue;
            const dx = (col + 0.5) * charW - mouse.x;
            const dy = cy - mouse.y;
            const r = Math.hypot(dx, dy);
            if (r >= radiusPx) continue;
            const t = r / radiusPx;
            // Cubic falloff over smoothstep: zero slope at the rim, so the
            // distortion reads as a lens rather than a dent with a boundary.
            const mask = 1 - t * t * (3 - 2 * t);
            const amount = strength * mask * mask * mask;
            if (amount < 0.001) continue;
            lastFrame[gi] = frame;
            next.push(gi);
            spans[gi].style.transform = `translate(${(dx * amount).toFixed(2)}px, ${(
              dy * amount
            ).toFixed(2)}px) scale(${(1 + amount).toFixed(3)})`;
          }
        }
        for (const gi of active) {
          if (lastFrame[gi] !== frame) spans[gi].style.transform = '';
        }
        active = next;
      }

      if (pointerInside || strength > 0) rafId = requestAnimationFrame(tick);
      else clearAll();
    };

    const startLoop = () => {
      if (rafId === null && intersecting && !disposed) {
        rafId = requestAnimationFrame(tick);
      }
    };

    const stopLoop = () => {
      if (rafId !== null) {
        cancelAnimationFrame(rafId);
        rafId = null;
      }
    };

    /* ----- pointer / keyboard ----- */

    const onPointerEnter = (e: PointerEvent) => {
      if (!rect) measure();
      if (!rect) return;
      rect = pre.getBoundingClientRect();
      target.x = e.clientX - rect.left;
      target.y = e.clientY - rect.top;
      pointerInside = true;
      startLoop();
    };
    const onPointerMove = (e: PointerEvent) => {
      if (!rect) return;
      target.x = e.clientX - rect.left;
      target.y = e.clientY - rect.top;
    };
    const onPointerLeave = () => {
      pointerInside = false;
    };

    // Keyboard affordance: focusing the artwork blooms the lens at centre.
    const onFocus = () => {
      if (!rect) measure();
      if (!rect) return;
      target.x = rect.width / 2;
      target.y = rect.height / 2;
      pointerInside = true;
      startLoop();
    };
    const onBlur = () => {
      pointerInside = false;
    };

    container.addEventListener('pointerenter', onPointerEnter);
    container.addEventListener('pointermove', onPointerMove);
    container.addEventListener('pointerleave', onPointerLeave);
    pre.addEventListener('focus', onFocus);
    pre.addEventListener('blur', onBlur);

    /* ----- re-measure triggers (never inside the frame loop) ----- */

    measure();
    let debounceId: number | undefined;
    const scheduleMeasure = () => {
      window.clearTimeout(debounceId);
      debounceId = window.setTimeout(measure, RESIZE_DEBOUNCE_MS);
    };
    // ResizeObserver catches the CSS-clamp font-size changes; a late font
    // load changes glyph advances, so re-measure then too.
    const resizeObserver = new ResizeObserver(scheduleMeasure);
    resizeObserver.observe(pre);
    window.addEventListener('resize', scheduleMeasure);
    document.fonts.ready.then(() => {
      if (!disposed) measure();
    });

    const intersectionObserver = new IntersectionObserver(([entry]) => {
      intersecting = entry.isIntersecting;
      if (!intersecting) {
        stopLoop();
      } else if (pointerInside || strength > 0) {
        startLoop();
      }
    });
    intersectionObserver.observe(container);

    return () => {
      disposed = true;
      stopLoop();
      window.clearTimeout(debounceId);
      container.removeEventListener('pointerenter', onPointerEnter);
      container.removeEventListener('pointermove', onPointerMove);
      container.removeEventListener('pointerleave', onPointerLeave);
      pre.removeEventListener('focus', onFocus);
      pre.removeEventListener('blur', onBlur);
      resizeObserver.disconnect();
      intersectionObserver.disconnect();
      clearAll();
    };
  }, [grid]);

  return { containerRef, preRef, children: grid.children };
}
