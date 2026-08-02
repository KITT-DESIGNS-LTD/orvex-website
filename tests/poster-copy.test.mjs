import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const appSource = await readFile(new URL('../src/app/App.tsx', import.meta.url), 'utf8');
const posterSource = appSource.slice(
  appSource.indexOf('function Poster()'),
  appSource.indexOf('/* --------------------------------- showcase', appSource.indexOf('function Poster()')),
);
const posterCopy = posterSource.replace(/\s+/g, ' ');

test('poster supporting copy positions automation as human-feeling customer service', () => {
  assert.match(posterCopy, /Smarter Service\. More Human\./);
  assert.match(
    posterCopy,
    /Automated customer service that still feels human\. AI handles routine conversations while your team stays close to every customer\./,
  );
  assert.match(posterCopy, /text-\[15px\].*text-white\/50/);
});
