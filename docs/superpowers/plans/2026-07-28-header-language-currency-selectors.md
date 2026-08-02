# Header Language and Currency Selectors Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add accessible language and currency dropdowns to the top-right header controls and mobile menu.

**Architecture:** Keep the change within `src/app/App.tsx` by introducing one reusable `HeaderSelector` that receives an id, aria label, options, value, and selection callback. `Nav` owns both selected values; layout classes keep the desktop action group at `lg` and expose the mobile menu below that breakpoint.

**Tech Stack:** React 18, TypeScript, Tailwind CSS 4, Lucide React, Node's built-in test runner, Vite.

---

### Task 1: Lock the requested header controls with a focused regression test

**Files:**
- Create: `tests/header-selectors.test.mjs`
- Test: `tests/header-selectors.test.mjs`

- [x] **Step 1: Write the failing test**

```js
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

test('header exposes accessible language and currency dropdown controls', async () => {
  const source = await readFile(new URL('../src/app/App.tsx', import.meta.url), 'utf8');

  assert.match(source, /function HeaderSelector\(/);
  assert.match(source, /aria-label="Language"/);
  assert.match(source, /aria-label="Currency"/);
  assert.match(source, /const LANGUAGE_OPTIONS = \['EN', 'CN', 'ES', 'JP'\] as const;/);
  assert.match(source, /const CURRENCY_OPTIONS = \['USD', 'CNY', 'HKD', 'EUR'\] as const;/);
  assert.match(source, /role="menu"/);
  assert.match(source, /role="menuitemradio"/);
});
```

- [x] **Step 2: Run test to verify it fails**

Run: `node --test tests/header-selectors.test.mjs`

Expected: FAIL because `HeaderSelector` and the requested controls are not present.

- [x] **Step 3: Write minimal implementation**

Add `LANGUAGE_OPTIONS`, `CURRENCY_OPTIONS`, and an inline `HeaderSelector` component above `Nav`. It uses a button trigger, black-and-white `menuitemradio` options, outside-click and keyboard handling, and returns the selected option to `Nav`. In `Nav`, render the two selector instances ahead of the existing desktop links and include their option groups in the mobile menu. Use the existing `ChevronDown` icon and `font-mono` utility-label classes.

- [x] **Step 4: Run test to verify it passes**

Run: `node --test tests/header-selectors.test.mjs`

Expected: PASS with one test.

### Task 2: Verify the real responsive header behavior

**Files:**
- Modify: `src/app/App.tsx`
- Test: `tests/header-selectors.test.mjs`

- [x] **Step 1: Run static checks**

Run: `npm run typecheck && npm run build`

Expected: Both commands exit 0 with a Vite production build.

- [x] **Step 2: Verify the desktop interaction**

Run the Vite app and open its local URL. After bypassing the loading screen, select `CN` from Language and `CNY` from Currency. Each trigger must update to the selected value, the menu must close, and clicking outside must close an open menu.

- [x] **Step 3: Verify the compact layout**

At a mobile-sized viewport, open the header menu. Confirm both selector groups are visible before the existing header actions, options are selectable, and no content clips or overlaps.

### Task 3: Center the selector menus and translate the English/Chinese experience

**Files:**
- Modify: `src/app/App.tsx:178-470`
- Modify: `tests/header-selectors.test.mjs`

- [x] **Step 1: Write the failing regression test**

```js
test('header centers native-language menus and supplies Chinese page copy', async () => {
  const source = await readFile(new URL('../src/app/App.tsx', import.meta.url), 'utf8');

  assert.match(source, /code: 'EN', label: 'English'/);
  assert.match(source, /code: 'CN', label: '简体中文'/);
  assert.match(source, /left-1\/2 -translate-x-1\/2/);
  assert.match(source, /永不休眠的/);
  assert.match(source, /document\.documentElement\.lang/);
});
```

- [x] **Step 2: Run the test and confirm it fails**

Run: `node --test tests/header-selectors.test.mjs`

Expected: FAIL because the current menus right-align, list language codes without native labels, and do not supply Chinese copy.

- [x] **Step 3: Implement the smallest translated surface**

```tsx
const LANGUAGE_OPTIONS = [
  { code: 'EN', label: 'English' },
  { code: 'CN', label: '简体中文' },
] as const;

const SITE_COPY = {
  EN: { /* header and hero English strings */ },
  CN: { /* matching Simplified Chinese header and hero strings */ },
} as const;
```

Move selected language state to `App`, set `document.documentElement.lang`, pass the selected copy to `Nav` and `Hero`, center the shared menu with `left-1/2 -translate-x-1/2`, and render each language option as `EN — English` or `CN — 简体中文`.

- [x] **Step 4: Run the focused test and confirm it passes**

Run: `node --test tests/header-selectors.test.mjs`

Expected: PASS with both the selector and translation tests.

- [x] **Step 5: Verify the rendered switch**

Run: `npm run typecheck && npm run build && node --test tests/*.test.mjs`

Then use the local Vite page at desktop and 390px mobile widths. Select `CN`, confirm Chinese header and hero copy plus centered menus, switch back to `EN`, and verify no console errors.

### Task 4: Keep selected header currency and Pricing synchronized

**Files:**
- Modify: `src/app/App.tsx`
- Modify: `tests/header-selectors.test.mjs`
- Modify: `tests/pricing.test.mjs`
- Create: `tests/pricing-currency.test.mjs`

- [x] **Step 1: Write the failing currency-pricing regression test**

Assert that `AUD` is available, `App` owns currency state and passes it to `Nav` and `Pricing`, and the price book includes explicit symbols plus rounded AUD prices (`A$529`/`A$449` for Starter and `A$729`/`A$599` for Growth).

- [x] **Step 2: Run the regression test and confirm it fails**

Run: `node --test tests/pricing-currency.test.mjs`

Expected: FAIL because currency selection is local to `Nav`, `AUD` is unavailable, and Pricing renders hard-coded dollar values.

- [x] **Step 3: Centralize currency state and pricing data**

Move the selected currency to `App`, pass it to `Nav` and `Pricing`, and render plan values through one `CURRENCY_PRICING` record with a currency-specific symbol. Preserve USD price points and leave Custom as the Enterprise contact-sales plan.

- [x] **Step 4: Run focused checks**

Run: `node --test tests/pricing-currency.test.mjs tests/pricing.test.mjs tests/header-selectors.test.mjs && npm run typecheck`

Expected: PASS with the top currency selection controlling Pricing and all price symbols rendered from the shared book.

- [x] **Step 5: Verify the live currency-selection flow**

Run: `npm run build && node --test tests/*.test.mjs`, then select `AUD` from the desktop header at the local Vite page and confirm Starter and Growth render as `A$449` and `A$599` in annual mode. Switch to monthly and confirm `A$529` and `A$729`, then confirm there are no console errors.
