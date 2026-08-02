import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

test('uses the wider 85rem desktop container across the site', async () => {
  const source = await readFile(new URL('../src/app/App.tsx', import.meta.url), 'utf8');

  assert.equal(
    (source.match(/max-w-\[85rem\]/g) ?? []).length,
    8,
    'expected the header, page sections, showcase, and footer to share the 85rem container',
  );
  assert.doesNotMatch(source, /max-w-7xl/);
});
