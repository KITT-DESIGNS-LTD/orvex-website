import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

test('header exposes accessible language and currency dropdown controls', async () => {
  const source = await readFile(new URL('../src/app/App.tsx', import.meta.url), 'utf8');

  assert.match(source, /function HeaderSelector(?:<[^>]+>)?\(/);
  assert.match(source, /aria-label=\{ariaLabel\}/);
  assert.match(source, /ariaLabel=\{copy\.selectors\.language\}/);
  assert.match(source, /ariaLabel=\{copy\.selectors\.currency\}/);
  assert.match(source, /code: 'EN', label: 'English'/);
  assert.match(source, /code: 'CN', label: '简体中文'/);
  ['USD', 'CNY', 'HKD', 'EUR', 'AUD'].forEach((currency) => {
    assert.match(source, new RegExp(`code: '${currency}', label: '${currency}'`));
  });
  assert.match(source, /role="menu"/);
  assert.match(source, /role="menuitemradio"/);
});

test('header centers native-language menus and supplies Chinese page copy', async () => {
  const source = await readFile(new URL('../src/app/App.tsx', import.meta.url), 'utf8');

  assert.match(source, /left-1\/2 -translate-x-1\/2/);
  assert.match(source, /永不休眠的/);
  assert.match(source, /document\.documentElement\.lang/);
});
