# Product Capability Strip Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the hero strip explain JOHN CRM's product capabilities with five readable markers instead of generic growth metrics.

**Architecture:** Keep the existing hero strip component, reveal animation, and responsive layout. Replace the data driving the four numeric KPIs with five static capability-and-label pairs, then use a five-column wide layout and more legible supporting-label typography.

**Tech Stack:** React 18, TypeScript, Tailwind CSS, Node's built-in test runner, Vite.

---

## File structure

- `src/app/App.tsx` — owns the `HERO_STATS`, `HeroStat`, and hero-strip layout that will change.
- `tests/hero-capability-strip.test.mjs` — source-level regression coverage for the approved copy, layout, and readable label styling.

### Task 1: Add the capability-strip regression test

**Files:**
- Create: `tests/hero-capability-strip.test.mjs`
- Modify: none

- [ ] **Step 1: Write the failing test**

```js
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const appSource = await readFile(new URL('../src/app/App.tsx', import.meta.url), 'utf8');
const statsSource = appSource.slice(
  appSource.indexOf('const HERO_STATS'),
  appSource.indexOf('function Hero()', appSource.indexOf('const HERO_STATS')),
);

test('hero capability strip presents the five approved product capabilities', () => {
  ['< 0 min', 'Avg Response', 'WhatsApp', 'Support', 'Custom API', 'Endpoints', 'Automate', 'Meetings', 'Embed Anywhere', 'Website & platform ready'].forEach((copy) => {
    assert.ok(statsSource.includes(copy), `expected hero strip to include ${copy}`);
  });
});

test('hero capability strip uses five wide columns and readable support labels', () => {
  assert.ok(appSource.includes('lg:grid-cols-5'));
  assert.ok(statsSource.includes('text-xs tracking-[0.12em] uppercase text-black/55 lg:text-sm'));
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `node --test tests/hero-capability-strip.test.mjs`

Expected: FAIL because the existing strip has four generic numeric metrics and uses `text-[9px]` support labels.

### Task 2: Render the product capabilities with readable labels

**Files:**
- Modify: `src/app/App.tsx` — replace the `HERO_STATS` type/data and simplify `HeroStat`; update the wide-grid column count and support-label classes.
- Test: `tests/hero-capability-strip.test.mjs`

- [ ] **Step 1: Implement the minimal component change**

Replace the numeric stat data and counter rendering with this static capability data and markup:

```tsx
const HERO_STATS = [
  { value: '< 0 min', label: 'Avg Response' },
  { value: 'WhatsApp', label: 'Support' },
  { value: 'Custom API', label: 'Endpoints' },
  { value: 'Automate', label: 'Meetings' },
  { value: 'Embed Anywhere', label: 'Website & platform ready' },
];

function HeroStat({ stat }: { stat: (typeof HERO_STATS)[number] }) {
  return (
    <div>
      <div className="font-display text-[clamp(1.75rem,2.35vw,3rem)] font-black leading-none">
        {stat.value}
      </div>
      <div className="mt-2 font-mono text-xs tracking-[0.12em] uppercase text-black/55 lg:text-sm">
        {stat.label}
      </div>
    </div>
  );
}
```

Update the strip's wide layout from `lg:grid-cols-4` to `lg:grid-cols-5`, and render each stat as `<HeroStat key={s.label} stat={s} />`. Remove the now-unused `useCountUp` helper and `active` prop.

- [ ] **Step 2: Run the focused regression test**

Run: `node --test tests/hero-capability-strip.test.mjs`

Expected: PASS with both capability-copy and readability/layout assertions succeeding.

- [ ] **Step 3: Run the complete source-level test suite**

Run: `node --test tests/*.test.mjs`

Expected: PASS with the existing landing-page tests and the new capability-strip test succeeding.

- [ ] **Step 4: Validate types and production build**

Run: `npm run typecheck; npm run build`

Expected: both commands exit 0 and Vite outputs a production bundle.

- [ ] **Step 5: Review the rendered hero**

Run: `npm run dev -- --host 127.0.0.1`

Open the local page, dismiss the one-time loader if shown, and inspect the hero strip at a desktop width and a narrow mobile width. Confirm all five markers are readable, the fifth marker fits, and the strip wraps cleanly on mobile.

- [ ] **Step 6: Commit only the focused source and test change**

```bash
git add src/app/App.tsx tests/hero-capability-strip.test.mjs
git commit -m "feat: explain product capabilities in hero strip"
```
