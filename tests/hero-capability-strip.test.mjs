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
    'Automate',
    'Appointments',
    'Custom API',
    'Endpoints',
    'Google Integrations',
    'Calendar & Meets',
    'Embed Anywhere',
    'WEBSITE & APP READY',
  ].forEach((copy) => {
    assert.ok(statsSource.includes(copy), `expected hero strip to include ${copy}`);
  });
});

test('hero capability strip replaces WhatsApp support and meeting automation with the requested services', () => {
  assert.match(statsSource, /\{ value: 'Automate', label: 'Appointments' \}/);
  assert.match(statsSource, /\{ value: 'Google Integrations', label: 'Calendar & Meets' \}/);
  assert.doesNotMatch(statsSource, /\{ value: 'WhatsApp', label: 'Support' \}/);
  assert.doesNotMatch(statsSource, /\{ value: 'Automate', label: 'Meetings' \}/);
});

test('hero capability strip leads with Embed Anywhere and uses the requested readiness label', () => {
  const valuesInOrder = [...statsSource.matchAll(/\{ value: '([^']+)', label: '([^']+)' \}/g)].map(
    ([, value, label]) => ({ value, label }),
  );

  assert.equal(valuesInOrder[0]?.value, 'Embed Anywhere');
  assert.equal(valuesInOrder[0]?.label, 'WEBSITE & APP READY');
});

test('hero capability strip uses five wide columns and readable support labels', () => {
  assert.ok(appSource.includes('lg:grid-cols-5'));
  assert.ok(
    statsSource.includes('text-xs tracking-[0.12em] uppercase text-black/55 lg:text-sm'),
  );
});
