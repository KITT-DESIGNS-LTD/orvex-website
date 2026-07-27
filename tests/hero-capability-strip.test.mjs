import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const appSource = await readFile(new URL('../src/app/App.tsx', import.meta.url), 'utf8');
const statsSource = appSource.slice(
  appSource.indexOf('const HERO_STATS'),
  appSource.indexOf('function Hero()', appSource.indexOf('const HERO_STATS')),
);

test('hero capability strip presents the five approved product capabilities', () => {
  [
    '< 0 min',
    'Avg Response',
    'WhatsApp',
    'Support',
    'Custom API',
    'Endpoints',
    'Automate',
    'Meetings',
    'Embed Anywhere',
    'Website & platform ready',
  ].forEach((copy) => {
    assert.ok(statsSource.includes(copy), `expected hero strip to include ${copy}`);
  });
});

test('hero capability strip uses five wide columns and readable support labels', () => {
  assert.ok(appSource.includes('lg:grid-cols-5'));
  assert.ok(
    statsSource.includes('text-[11px] tracking-[0.14em] uppercase text-black/45 lg:text-xs'),
  );
});
