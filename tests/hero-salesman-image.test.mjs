import assert from 'node:assert/strict';
import { access, readFile } from 'node:fs/promises';
import test from 'node:test';

test('hero renders the supplied salesman illustration in its right column', async () => {
  const assetUrl = new URL('../src/assets/john-salesman.png', import.meta.url);
  const assetExists = await access(assetUrl).then(
    () => true,
    () => false,
  );
  const source = await readFile(new URL('../src/app/App.tsx', import.meta.url), 'utf8');
  const heroVisual = source.slice(
    source.indexOf('function HeroMockup()'),
    source.indexOf('const HERO_STATS'),
  );

  assert.equal(assetExists, true, 'expected the supplied salesman image asset');
  assert.match(source, /import heroSalesman from '\.\.\/assets\/john-salesman\.png';/);
  assert.match(heroVisual, /src=\{heroSalesman\}/);
  assert.match(heroVisual, /alt="John CRM salesman holding a briefcase"/);
  assert.match(heroVisual, /lg:h-\[clamp\(30rem,42vw,34rem\)\]/);
  assert.doesNotMatch(heroVisual, /src=\{shotDashboard\}/);
});
