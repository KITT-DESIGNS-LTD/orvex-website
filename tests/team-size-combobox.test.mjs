import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

test('contact form uses an accessible custom team-size combobox', async () => {
  const source = await readFile(new URL('../src/app/App.tsx', import.meta.url), 'utf8');

  assert.match(source, /function TeamSizeCombobox\(/);
  assert.match(source, /role="combobox"/);
  assert.match(source, /role="listbox"/);
  assert.match(source, /name="teamSize"/);
  assert.match(source, /1–5/);
  assert.match(source, /6–20/);
  assert.match(source, /21–100/);
  assert.match(source, /100\+/);
});
