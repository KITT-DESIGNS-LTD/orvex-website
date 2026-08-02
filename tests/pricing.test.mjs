import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

test('keeps the USD starter and growth prices in the shared price book', async () => {
  const source = await readFile(new URL('../src/app/App.tsx', import.meta.url), 'utf8');

  assert.match(
    source,
    /USD: \{[\s\S]*?starter: \{ monthly: 349, annual: 299 \}/,
    'Starter should cost $299/month annually and $349/month monthly',
  );
  assert.match(
    source,
    /USD: \{[\s\S]*?growth: \{ monthly: 479, annual: 399 \}/,
    'Growth should cost $399/month annually and $479/month monthly',
  );
});
