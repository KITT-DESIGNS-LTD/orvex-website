import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

test('shows the requested starter and growth prices for each billing cycle', async () => {
  const source = await readFile(new URL('../src/app/App.tsx', import.meta.url), 'utf8');

  assert.match(
    source,
    /name: 'Starter',[\s\S]*?monthly: 349,[\s\S]*?annual: 299,/,
    'Starter should cost $299/month annually and $349/month monthly',
  );
  assert.match(
    source,
    /name: 'Growth',[\s\S]*?monthly: 479,[\s\S]*?annual: 399,/,
    'Growth should cost $399/month annually and $479/month monthly',
  );
});
