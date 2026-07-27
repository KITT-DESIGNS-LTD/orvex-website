import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

test('hero does not render the trusted companies strip', async () => {
  const source = await readFile(new URL('../src/app/App.tsx', import.meta.url), 'utf8');

  assert.doesNotMatch(source, /Trusted by growing companies/);
  assert.doesNotMatch(source, /const TRUST_COMPANIES/);
});
