import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const source = await readFile(new URL('../src/app/App.tsx', import.meta.url), 'utf8');

test('the header currency selection drives the pricing currency', () => {
  assert.match(source, /code: 'AUD', label: 'AUD'/);
  assert.match(source, /const \[currency, setCurrency\] = useState<CurrencyCode>\('USD'\);/);
  assert.match(source, /<Nav[\s\S]*?currency=\{currency\}[\s\S]*?onCurrencyChange=\{setCurrency\}/);
  assert.match(source, /<Pricing currency=\{currency\} \/>/);
  assert.match(source, /function Pricing\(\{ currency \}: \{ currency: CurrencyCode \}\)/);
});

test('pricing has explicit symbols and a rounded AUD price book', () => {
  assert.match(source, /const CURRENCY_PRICING[\s\S]*?USD: \{[\s\S]*?symbol: '\$'/);
  assert.match(source, /AUD: \{[\s\S]*?symbol: 'A\$'/);
  assert.match(
    source,
    /AUD: \{[\s\S]*?starter: \{ monthly: 529, annual: 449 \}[\s\S]*?growth: \{ monthly: 729, annual: 599 \}/,
  );
  assert.match(source, /const formattedPrice = formatCurrencyPrice\(currency, price\);/);
  assert.match(source, /\{formattedPrice\}/);
});
