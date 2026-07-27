import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const appSource = await readFile(new URL('../src/app/App.tsx', import.meta.url), 'utf8');
const themeSource = await readFile(new URL('../src/styles/theme.css', import.meta.url), 'utf8');
const navSource = appSource.slice(
  appSource.indexOf('function Nav()'),
  appSource.indexOf('/* ----------------------------- hero + dashboard'),
);

test('header offers contact sales, a free trial, and external login', () => {
  assert.match(navSource, />\s*Contact Sales\s*</);
  assert.match(navSource, />\s*Try for Free\s*</);
  assert.match(navSource, /href="https:\/\/app\.orvex\.live\/g\/login"/);
  assert.match(navSource, />\s*Login\s*</);
});

test('desktop header places login before the far-right free trial action', () => {
  const desktopActions = navSource.slice(
    navSource.indexOf('<div className="hidden items-center gap-6 md:flex">'),
    navSource.indexOf('<button'),
  );

  assert.match(
    desktopActions,
    /Contact Sales\s*<\/a>\s*<a\s+href="https:\/\/app\.orvex\.live\/g\/login"[\s\S]*?>\s*Login\s*<\/a>\s*<a\s+href="#pricing"[\s\S]*?>\s*Try for Free\s*<\/a>/,
  );
});

test('desktop header navigation uses a more legible 11px label size', () => {
  const desktopHeader = navSource.slice(
    navSource.indexOf('<nav className="hidden items-center gap-10 md:flex">'),
    navSource.indexOf('<button'),
  );

  const desktopLabelClasses = desktopHeader.match(/className="([^"]*)"/g) ?? [];
  assert.ok(
    desktopLabelClasses.filter((className) => className.includes('text-[11px]')).length >= 3,
    'expected primary navigation and desktop actions to use 11px labels',
  );
});

test('uses Inter for the shared utility-label font instead of JetBrains Mono', () => {
  assert.match(themeSource, /--font-mono:\s*"Inter", ui-sans-serif, system-ui, sans-serif;/);
  assert.doesNotMatch(themeSource, /--font-mono:\s*"JetBrains Mono"/);
  assert.match(themeSource, /\.font-mono\s*\{\s*font-weight:\s*500;\s*\}/);
});

test('hero omits the AI-powered CRM and sales automation label', () => {
  assert.doesNotMatch(appSource, /AI-Powered CRM &amp; Sales Automation/);
});

test('hero presents the AI agent platform message', () => {
  const copyStart = appSource.indexOf('#1 AI Agent Platform');
  const copyEnd = appSource.indexOf('</p>', copyStart);
  const renderedCopy = appSource.slice(copyStart, copyEnd).replace(/\s+/g, ' ').trim();

  assert.equal(
    renderedCopy,
    '#1 AI Agent Platform for Automating messages. Manage your site, WhatsApp, WeChat, email and more in one place.',
  );
  assert.doesNotMatch(appSource, /Every customer conversation in one inbox/);
});

test('uses the JOHN CRM SVG in every site logo placement', () => {
  assert.match(appSource, /import johnCrmLogo from '\.\.\/assets\/johncrm\.svg';/);

  const logoSections = [
    appSource.slice(appSource.indexOf('function LoadingScreen'), appSource.indexOf('/* ----------------------------------- nav')),
    appSource.slice(appSource.indexOf('function Nav()'), appSource.indexOf('/* ----------------------------- hero + dashboard')),
    appSource.slice(appSource.indexOf('function Footer()'), appSource.indexOf('/* ----------------------------------- app')),
  ];

  logoSections.forEach((section) => assert.match(section, /src=\{johnCrmLogo\}/));
});
