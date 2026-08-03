import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const source = await readFile(new URL('../src/app/App.tsx', import.meta.url), 'utf8');
const termsNavSource = source.slice(
  source.indexOf('const TERMS_NAV'),
  source.indexOf('function TermsOfServicePage'),
);
const termsPageSource = source.slice(
  source.indexOf('function TermsOfServicePage'),
  source.indexOf('/* ----------------------------------- app'),
);

test('the router serves a dedicated terms of service page', () => {
  assert.match(source, /function TermsOfServicePage\(\)/);
  assert.match(source, /path === '\/terms-of-service'/);
  assert.match(source, /<TermsOfServicePage \/>/);
  assert.match(source, /\{ label: 'Terms', ariaLabel: 'Terms of Service', href: '\/terms-of-service' \}/);
  assert.match(termsPageSource, /document\.title = 'Terms of Service — JOHN CRM'/);
});

test('every terms table-of-contents entry anchors a rendered section', () => {
  const navIds = [...termsNavSource.matchAll(/\['([a-z0-9-]+)',/g)].map(([, id]) => id);
  const sectionIds = [...termsPageSource.matchAll(/<LegalSection id="([a-z0-9-]+)"/g)].map(([, id]) => id);

  assert.equal(navIds.length, 16, 'expected all sixteen terms sections in the table of contents');
  assert.deepEqual(sectionIds, navIds, 'section ids must match the table of contents, in order');
});

test('terms cross-references resolve to real anchors and to the privacy policy', () => {
  ['#fees', '#acceptable-use', '#customer-content'].forEach((anchor) => {
    assert.ok(termsPageSource.includes(`href="${anchor}"`), `expected an in-page link to ${anchor}`);
  });
  assert.match(termsPageSource, /href="\/privacy-policy"/);
});

test('the terms page ships finished copy, not the draft template', () => {
  ['[Company Legal Name]', '[Registered address]', '[Date]', 'yourdomain', 'Status: DRAFT'].forEach(
    (placeholder) => {
      assert.ok(
        !termsPageSource.includes(placeholder),
        `unfilled placeholder left in page: ${placeholder}`,
      );
    },
  );
  assert.doesNotMatch(
    termsPageSource,
    /[Ââ]/,
    'mojibake from the source markdown must be repaired',
  );
  assert.match(termsPageSource, /KITT DESIGNS LTD/);
  assert.match(termsPageSource, /Last updated: 4 August 2026/);
});

test('both legal pages share one section primitive and one contact block', () => {
  assert.match(source, /function LegalSection\(\{/);
  assert.match(source, /const LEGAL_CONTACT_EMAIL = 'biz\.johncrm@gmail\.com';/);
  assert.doesNotMatch(source, /PrivacySection/, 'the section primitive is shared, not privacy-scoped');
  assert.doesNotMatch(source, /PRIVACY_CONTACT_EMAIL|PRIVACY_ADDRESS/);
  assert.equal(
    (source.match(/<LegalSection id="/g) ?? []).length,
    30,
    'expected 14 privacy sections and 16 terms sections',
  );
});

test('the landing page is a component so the router stays hook-free', () => {
  const router = source.slice(source.indexOf('export default function App()'));

  assert.match(source, /function LandingPage\(\)/);
  assert.match(router, /<LandingPage \/>/);
  assert.doesNotMatch(router, /useState|useEffect|useCallback/, 'hooks must live in LandingPage');
});
