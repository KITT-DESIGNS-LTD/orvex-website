# ASCII Portrait — Cursor Bulge Effect

## Phase 2 — Per-character DOM implementation (replaces WebGL)

User correction: the portrait must stay real, selectable DOM text — not a rasterised
canvas. Replacing the shader implementation with the spec's per-character alternative
(one span per glyph, CSS transforms, same motion model). See `tasks/lessons.md`.

- [x] `src/lib/useAsciiTextBulge.ts` — glyph-span builder + px-space lens loop with
      bbox iteration, no-op frame skip, frame-stamp clearing; `prefersReducedMotion` moves here
- [x] `src/app/App.tsx` — HeroMockup renders `{children}`, canvas deleted, color unconditional
- [x] Delete `src/lib/asciiBulgeRenderer.ts` + `src/lib/useAsciiBulge.ts`
- [x] Rewrite `tests/hero-salesman-image.test.mjs` (both tests assert stale implementations)
- [x] Verify: typecheck, build, `node --test`, Playwright checklist

### Phase 2 review

**Files:** `src/lib/useAsciiTextBulge.ts` (new, ~270 lines — WebGL lib files deleted),
`src/app/App.tsx` (HeroMockup renders hook-built children; no canvas),
`tests/hero-salesman-image.test.mjs` (rewritten). Bundle shrank ~3.5 kB vs the WebGL build.

**Build/tests:** typecheck, `vite build`, and `node --test` (18/18, incl. the 2 rewritten)
all pass. Note: `node --test tests/` fails on Windows — use bare `node --test`.

**Browser verification** (Playwright, headless Edge) — all pass:

| Check | Result |
| --- | --- |
| 4,848 glyph spans; `pre.textContent` exactly equals the source ASCII (copy fidelity) | pass |
| Span rendering pixel-identical to the plain string (no inline-block baseline shift) | pass |
| Hover: 336 spans transformed (predicted ~350); glyphs magnify + displace, smooth falloff | pass |
| Lens follows the cursor; pointer-out decays to pixel-identical rest with all `style.transform` cleared | pass |
| rAF fully suspended when idle; focus blooms lens at centre (336 spans) | pass |
| Reduced-motion emulation: zero transforms on hover | pass |
| Console: only the pre-existing `/favicon.ico` 404 | pass |

**Verification gotcha (for future sessions):** any test step that rewrites the pre's
`innerHTML`/`textContent` detaches the span elements the hook captured at mount —
run destructive DOM swaps only after all interaction checks, or reload between.

## Phase 1 — WebGL shader implementation (superseded)

Implementing `ascii-bulge-effect-spec.md`: replace the hero portrait's hover scramble with a
shader-based fisheye lens that follows the cursor. Approved decisions: scramble fully removed;
raw WebGL with zero new dependencies.

Full plan: `C:\Users\admin\.claude\plans\parsed-mapping-ladybug.md`

## Tasks

- [x] `src/lib/asciiBulgeRenderer.ts` — framework-free GL engine (context WebGL2→1 fallback,
      NPOT texture strategy, premultiplied-alpha pipeline, line-by-line rasterisation with
      CSS-accurate baseline math, GLSL 100 quad + cubic-falloff displacement shader,
      StrictMode-safe dispose without loseContext)
- [x] `src/lib/useAsciiBulge.ts` — React hook (gates: reduced-motion / hover:none / no-GL;
      data-attribute tunables; ref-based lerps with idle RAF suspension; pointer + focus
      listeners; debounced re-raster on resize/fonts.ready; IntersectionObserver;
      context-loss handling; new home of `prefersReducedMotion`)
- [x] `src/app/App.tsx` — delete scramble constants/state/overlay, wire hook into HeroMockup,
      conditional `text-transparent`, aria-description update, canvas overlay sibling
- [x] Verify: `npm run typecheck`, `npm run build`, dev-server checklist vs acceptance criteria

## Review

**Files changed:** `src/lib/asciiBulgeRenderer.ts` (new, ~250 lines), `src/lib/useAsciiBulge.ts`
(new, ~200 lines), `src/app/App.tsx` (scramble removed, HeroMockup now ~40 lines of JSX).
No new dependencies.

**Build:** `npm run typecheck` and `npm run build` both clean.

**Behavioral verification** — Playwright (headless Edge) against the dev server, all pass:

| Check | Result |
| --- | --- |
| WebGL canvas active, pre `text-transparent`, buffer matches CSS size 1:1 | pass |
| Hover changes pixels (lens blooms); screenshots show genuine row-curving warp, no hard rim | pass |
| Lens follows the cursor to a new position | pass |
| Pointer-out decays to a frame **pixel-identical** to idle | pass |
| `requestAnimationFrame` fully suspended when idle (zero calls over 600ms) | pass |
| Keyboard focus blooms the lens at centre | pass |
| `prefers-reduced-motion` reload → canvas hidden, plain coloured pre, no GL | pass |
| Console errors | only a pre-existing `/favicon.ico` 404 (index.html has no icon link) |

**Deviations from spec (deliberate):**
- Pointer-out decay lerp is 0.15 (spec's 0.10 decays in ~470ms, over its own ≤400ms
  acceptance criterion; 0.15 lands ~300ms).
- WebGL1 fallback path uses plain LINEAR filtering (NPOT textures forbid mipmaps in
  WebGL1; safe because the lens only magnifies). WebGL2 gets full mipmaps per spec.
- Scramble hover effect removed entirely (user-approved decision).

**Tunables:** `data-radius` / `data-strength` on the wrapper div in `HeroMockup`
(currently 0.18 / 0.45), lerp constants at the top of `useAsciiBulge.ts`.
