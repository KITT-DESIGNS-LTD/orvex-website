import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const appSource = await readFile(new URL('../src/app/App.tsx', import.meta.url), 'utf8');
const pricingSource = appSource.slice(
  appSource.indexOf('const PLANS'),
  appSource.indexOf('function Pricing'),
);

test('enterprise pricing card uses Custom as its label and Enterprise as its large value', () => {
  assert.match(pricingSource, /name: 'Custom',[\s\S]*?blurb:/);
  assert.doesNotMatch(pricingSource, /name: 'Custom',[\s\S]*?priceKey:/);
  assert.match(
    appSource,
    /font-display text-6xl font-black uppercase leading-none">Enterprise<\/span>/,
  );
  assert.doesNotMatch(
    appSource,
    /font-display text-6xl font-black uppercase leading-none">Custom<\/span>/,
  );
});
