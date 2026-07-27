import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

test('hero heading uses the lighter extra-bold weight', async () => {
  const source = await readFile(new URL('../src/app/App.tsx', import.meta.url), 'utf8');

  assert.match(
    source,
    /className="font-display font-extrabold uppercase leading-\[0\.88\] tracking-tight"/,
  );
});
