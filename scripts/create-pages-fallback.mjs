import { copyFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const projectRoot = resolve(fileURLToPath(new URL('..', import.meta.url)));
const distDirectory = resolve(projectRoot, 'dist');

await copyFile(
  resolve(distDirectory, 'index.html'),
  resolve(distDirectory, '404.html'),
);
