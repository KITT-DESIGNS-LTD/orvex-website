import assert from 'node:assert/strict';
import { access, readFile } from 'node:fs/promises';
import test from 'node:test';

test('hero renders a larger blue ASCII salesman without the dot-field background', async () => {
  const assetUrl = new URL('../src/assets/hero-ascii.txt', import.meta.url);
  const assetExists = await access(assetUrl).then(
    () => true,
    () => false,
  );
  const asciiArt = assetExists ? await readFile(assetUrl, 'utf8') : '';
  const source = await readFile(new URL('../src/app/App.tsx', import.meta.url), 'utf8');
  const heroVisual = source.slice(
    source.indexOf('function HeroMockup()'),
    source.indexOf('const HERO_STATS'),
  );

  assert.equal(assetExists, true, 'expected the supplied ASCII art asset');
  assert.ok(asciiArt.includes('\n'), 'expected multiline ASCII art');
  assert.match(asciiArt, /[@#%]/, 'expected detailed ASCII characters');
  assert.match(source, /import heroAscii from '\.\.\/assets\/hero-ascii\.txt\?raw';/);
  assert.match(
    source,
    /const heroAsciiWithoutBackgroundDots = heroAscii\.replaceAll\('\.', ' '\);/,
  );
  assert.match(heroVisual, /<pre[\s\S]*?role="img"/);
  assert.match(heroVisual, /aria-label="ASCII art salesman holding a briefcase"/);
  assert.match(
    heroVisual,
    /useAsciiTextBulge\(\s*heroAsciiWithoutBackgroundDots,?\s*\)/,
    'expected the hook to receive the ASCII source',
  );
  assert.match(heroVisual, /\{children\}/, 'expected the pre to render the hook-built glyph spans');
  assert.match(heroVisual, /whitespace-pre/);
  assert.match(heroVisual, /text-\[#2A88AA\]/);
  assert.match(heroVisual, /lg:text-\[clamp\(7px,0\.75vw,10px\)\]/);
  assert.match(heroVisual, /-translate-y-10/);
  assert.match(heroVisual, /lg:-translate-y-14/);
  assert.doesNotMatch(
    heroVisual,
    /\{heroAsciiWithoutBackgroundDots\}\s*<\/pre>/,
    'the pre must render per-glyph spans, not the raw string',
  );
  assert.doesNotMatch(heroVisual, /<canvas/, 'the portrait must stay DOM text, not a canvas');
  assert.doesNotMatch(heroVisual, /heroSalesman/);
});

test('hero ASCII art magnifies under the cursor as a per-character text lens', async () => {
  const source = await readFile(new URL('../src/app/App.tsx', import.meta.url), 'utf8');
  const heroVisual = source.slice(
    source.indexOf('function HeroMockup()'),
    source.indexOf('const HERO_STATS'),
  );
  const hook = await readFile(
    new URL('../src/lib/useAsciiTextBulge.ts', import.meta.url),
    'utf8',
  );
  const webglFilesGone = await Promise.all(
    ['../src/lib/asciiBulgeRenderer.ts', '../src/lib/useAsciiBulge.ts'].map((p) =>
      access(new URL(p, import.meta.url)).then(
        () => false,
        () => true,
      ),
    ),
  );

  assert.match(
    source,
    /import \{ prefersReducedMotion, useAsciiTextBulge \} from '\.\.\/lib\/useAsciiTextBulge';/,
  );
  assert.match(heroVisual, /data-radius="0\.18"/);
  assert.match(heroVisual, /data-strength="0\.45"/);
  assert.match(heroVisual, /cursor-crosshair/);
  assert.match(heroVisual, /tabIndex=\{0\}/);

  // The lens mechanics: per-glyph spans, cubic falloff, eased motion, gates.
  assert.match(hook, /className: 'inline-block'/, 'expected one inline-block span per glyph');
  assert.match(hook, /mask \* mask \* mask/, 'expected the cubic falloff from the spec');
  assert.match(hook, /const MOUSE_LERP = 0\.08;/);
  assert.match(hook, /const STRENGTH_LERP_IN = 0\.06;/);
  assert.match(hook, /prefers-reduced-motion/, 'expected the reduced-motion gate');
  assert.match(hook, /hover: hover/, 'expected the touch-device gate');
  assert.match(hook, /style\.transform = ''/, 'expected transforms to clear on decay');

  // Scramble-era and WebGL-era implementations must be fully gone.
  assert.doesNotMatch(source, /HERO_ASCII_HOVER_GLYPHS/);
  assert.doesNotMatch(source, /HERO_ASCII_SCRAMBLE_RADIUS/);
  assert.doesNotMatch(source, /createHeroAsciiHoverFrame/);
  assert.doesNotMatch(source, /useAsciiBulge\b/);
  assert.ok(
    webglFilesGone.every(Boolean),
    'the superseded WebGL implementation files must be deleted',
  );
});
