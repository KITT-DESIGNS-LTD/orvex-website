# Team size combobox

## Goal

Replace the browser-default team-size `<select>` in the “Let’s Talk Revenue” contact form with a deliberately styled, accessible control that matches the site’s monochrome editorial UI.

## Design

The field keeps the existing `Team Size` label and four choices: `1–5`, `6–20`, `21–100`, and `100+`. Its closed state is a full-width bordered trigger with the current value or `Select team size`, generous vertical padding, and a custom chevron. The open state is an absolutely positioned white listbox below the trigger with a light border, compact option rows, and black hover/active styling. The menu is layered above the remaining form fields without changing the form’s layout.

The control is implemented inline in `App.tsx` as a small reusable `TeamSizeCombobox` component. It uses a hidden form input so the selected value remains available to the existing form submit flow, supports pointer selection, Escape to close, and Arrow/Home/End keyboard navigation, and exposes combobox/listbox semantics for assistive technology. Clicking outside closes the menu.

## Scope and verification

Only the contact form’s team-size field changes. No global theme or unrelated form fields are refactored. Verification will cover TypeScript/build success, source-level preservation of all four choices, the rendered closed/open states, keyboard selection, and a mobile-sized layout check on the real Vite page.
