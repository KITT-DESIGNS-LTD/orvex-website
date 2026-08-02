import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { exec } from 'node:child_process';
import { promisify } from 'node:util';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

const execAsync = promisify(exec);

test('production build emits a GitHub Pages fallback for deep links', async () => {
  await execAsync('npm run build', {
    cwd: fileURLToPath(new URL('..', import.meta.url)),
    windowsHide: true,
  });

  const indexHtml = await readFile(new URL('../dist/index.html', import.meta.url), 'utf8');
  const fallbackHtml = await readFile(new URL('../dist/404.html', import.meta.url), 'utf8');

  assert.equal(fallbackHtml, indexHtml, '404.html should bootstrap the same SPA as index.html');
});
