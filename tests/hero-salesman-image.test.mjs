import assert from 'node:assert/strict';
import { access, readFile } from 'node:fs/promises';
import test from 'node:test';

test('hero renders the supplied ASCII salesman art in its right column', async () => {
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
  assert.match(heroVisual, /<pre[\s\S]*?role="img"/);
  assert.match(heroVisual, /aria-label="ASCII art salesman holding a briefcase"/);
  assert.match(heroVisual, /\{heroAscii\}/);
  assert.match(heroVisual, /whitespace-pre/);
  assert.doesNotMatch(heroVisual, /heroSalesman/);
});
