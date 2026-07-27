import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const publicBrandFiles = [
  '../index.html',
  '../src/app/App.tsx',
  '../package.json',
  '../package-lock.json',
];
const legacyBrand = new RegExp(['or', 'vex'].join(''), 'i');

test('public brand files use JOHN CRM without the legacy brand', async () => {
  await Promise.all(
    publicBrandFiles.map(async (path) => {
      const source = await readFile(new URL(path, import.meta.url), 'utf8');
      assert.doesNotMatch(source, legacyBrand, `${path} should not contain the legacy brand`);
    }),
  );
});
