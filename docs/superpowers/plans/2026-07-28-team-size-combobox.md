# Team size combobox Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the browser-default team-size select in the contact form with a styled, keyboard-accessible combobox that preserves the existing form choices and value.

**Architecture:** Add a focused `TeamSizeCombobox` component beside the existing contact form in `src/app/App.tsx`. It owns open state, highlighted option state, outside-click handling, and keyboard navigation; the form receives the current selection through a hidden `teamSize` input. Keep all styling inline with the existing Tailwind class conventions and do not refactor unrelated contact fields.

**Tech Stack:** React 18, TypeScript, Tailwind CSS v4 utility classes, Node test runner, Vite.

---

### Task 1: Add a failing source regression test

**Files:**
- Create: `C:\Users\wyau7\Documents\orvex-website\tests\team-size-combobox.test.mjs`

- [ ] **Step 1: Write the failing test**

```js
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

test('contact form uses an accessible custom team-size combobox', async () => {
  const source = await readFile(new URL('../src/app/App.tsx', import.meta.url), 'utf8');

  assert.match(source, /function TeamSizeCombobox\(/);
  assert.match(source, /role="combobox"/);
  assert.match(source, /role="listbox"/);
  assert.match(source, /name="teamSize"/);
  assert.match(source, /1–5/);
  assert.match(source, /6–20/);
  assert.match(source, /21–100/);
  assert.match(source, /100\+/);
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `node --test tests/team-size-combobox.test.mjs`

Expected: FAIL because `TeamSizeCombobox`, listbox semantics, and the hidden `teamSize` field do not yet exist in `src/app/App.tsx`.

### Task 2: Implement the inline combobox

**Files:**
- Modify: `C:\Users\wyau7\Documents\orvex-website\src\app\App.tsx` near the contact form’s `Contact` component.

- [ ] **Step 1: Add the component state and option model**

Add this component before `Contact`:

```tsx
const TEAM_SIZE_OPTIONS = ['1–5', '6–20', '21–100', '100+'] as const;

function TeamSizeCombobox() {
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState('');
  const [activeIndex, setActiveIndex] = useState(0);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;

    const handlePointerDown = (event: PointerEvent) => {
      if (!wrapperRef.current?.contains(event.target as Node)) setOpen(false);
    };

    document.addEventListener('pointerdown', handlePointerDown);
    return () => document.removeEventListener('pointerdown', handlePointerDown);
  }, [open]);

  const selectOption = (option: (typeof TEAM_SIZE_OPTIONS)[number]) => {
    setValue(option);
    setOpen(false);
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLButtonElement>) => {
    if (event.key === 'Escape') {
      setOpen(false);
      return;
    }

    if (!open && ['Enter', ' ', 'ArrowDown'].includes(event.key)) {
      event.preventDefault();
      setOpen(true);
      return;
    }

    if (!open) return;

    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault();
      setActiveIndex((index) =>
        event.key === 'ArrowDown'
          ? (index + 1) % TEAM_SIZE_OPTIONS.length
          : (index - 1 + TEAM_SIZE_OPTIONS.length) % TEAM_SIZE_OPTIONS.length,
      );
    } else if (event.key === 'Home' || event.key === 'End') {
      event.preventDefault();
      setActiveIndex(event.key === 'Home' ? 0 : TEAM_SIZE_OPTIONS.length - 1);
    } else if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      selectOption(TEAM_SIZE_OPTIONS[activeIndex]);
    }
  };
```

- [ ] **Step 2: Render the styled trigger and listbox**

Continue the component with a wrapper, hidden form field, combobox trigger, and option rows:

```tsx
  return (
    <div ref={wrapperRef} className="relative mt-2">
      <input type="hidden" name="teamSize" value={value} />
      <button
        type="button"
        role="combobox"
        aria-expanded={open}
        aria-controls="team-size-options"
        aria-haspopup="listbox"
        aria-label="Team Size"
        onClick={() => setOpen((isOpen) => !isOpen)}
        onKeyDown={handleKeyDown}
        className={`flex w-full items-center justify-between border bg-white/60 px-4 py-3.5 text-left text-[14px] transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black ${
          open ? 'border-black/35' : 'border-black/10 hover:border-black/30'
        }`}
      >
        <span className={value ? 'text-black/75' : 'text-black/35'}>
          {value || 'Select team size'}
        </span>
        <ChevronDown
          size={15}
          strokeWidth={1.5}
          className={`shrink-0 text-black/50 transition-transform ${open ? 'rotate-180' : ''}`}
          aria-hidden="true"
        />
      </button>
      {open && (
        <div
          id="team-size-options"
          role="listbox"
          aria-label="Team size options"
          className="absolute inset-x-0 top-full z-20 mt-2 border border-black/10 bg-white p-1 shadow-[0_12px_30px_rgba(0,0,0,0.08)]"
        >
          {TEAM_SIZE_OPTIONS.map((option, index) => {
            const selected = option === value;
            const active = index === activeIndex;
            return (
              <button
                key={option}
                type="button"
                role="option"
                aria-selected={selected}
                onMouseEnter={() => setActiveIndex(index)}
                onClick={() => selectOption(option)}
                className={`flex w-full items-center justify-between px-3 py-3 text-left text-[13px] transition-colors ${
                  active ? 'bg-black text-white' : 'text-black/65 hover:bg-black/5 hover:text-black'
                }`}
              >
                {option}
                {selected && <Check size={13} strokeWidth={2.5} aria-hidden="true" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 3: Replace the native select in `Contact`**

Keep the existing `Team Size` label and render the component immediately below it:

```tsx
<label className="block">
  <span className="font-mono text-[9px] tracking-[0.25em] uppercase text-black/30">
    Team Size
  </span>
  <TeamSizeCombobox />
</label>
```

### Task 3: Run focused verification

**Files:**
- Verify: `C:\Users\wyau7\Documents\orvex-website\src\app\App.tsx`
- Verify: `C:\Users\wyau7\Documents\orvex-website\tests\team-size-combobox.test.mjs`

- [ ] **Step 1: Run the focused source regression test**

Run: `node --test tests/team-size-combobox.test.mjs`

Expected: PASS.

- [ ] **Step 2: Run TypeScript and production build checks**

Run: `npm run typecheck`

Expected: exit code 0 with no TypeScript errors.

Run: `npm run build`

Expected: exit code 0 and Vite writes the production bundle to `dist`.

- [ ] **Step 3: Validate the rendered flow on the real Vite page**

Start the app with `npm run dev -- --host 127.0.0.1 --port 5176`, open `http://127.0.0.1:5176/`, scroll to `#contact`, and verify:

1. The closed field shows `Select team size` with the custom bordered trigger and chevron.
2. Clicking the trigger opens four styled options without a browser-default select panel.
3. Clicking `6–20` closes the menu and updates the trigger text.
4. Reopening and pressing ArrowDown/Enter changes the value, and Escape closes without changing it.
5. The contact section remains readable at a mobile-sized viewport.

- [ ] **Step 4: Confirm the patch is narrow**

Run: `git diff --check` and `git status --short`.

Expected: no whitespace errors; only the intended test and `App.tsx` changes are present in addition to pre-existing user edits and the committed design/plan documents. Do not stage or revert unrelated dirty files.
