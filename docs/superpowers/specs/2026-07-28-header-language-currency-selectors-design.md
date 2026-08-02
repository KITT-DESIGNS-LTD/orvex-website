# Header language and currency selectors

## Goal

Add language and currency controls to the header's desktop top-right action area without changing the site's sharp, monochrome editorial visual system.

## Design

Two compact utility controls appear before `Contact Sales`: a language selector defaulting to `EN` with `EN` and `CN`, and a currency selector defaulting to `USD` with `USD`, `CNY`, `HKD`, `EUR`, and `AUD`. Each trigger uses the header's existing Inter utility-label treatment, muted black text, a small Lucide chevron, and no rounded container. On interaction, a white, thinly bordered menu opens beneath its trigger; keyboard focus, hover, and the selected option use the same black-and-white contrast used by the existing contact-form combobox.

The selectors are implemented as a small inline `HeaderSelector` component in `src/app/App.tsx`. Each maintains local state, closes on outside pointer interaction or Escape, supports Arrow/Home/End plus Enter/Space selection, restores focus after selection, and exposes button/menu semantics. At widths below `lg`, the desktop navigation/action area is replaced by the existing menu, which presents both selector groups before the current sales, login, and trial actions.

### Translation extension

The language selector is now limited to languages with implemented page copy: `EN — English` and `CN — 简体中文`. Its menu, and the currency menu, are horizontally centered beneath their trigger rather than right-aligned. Selecting Chinese changes the header navigation, sales actions, selector labels, and the full first-screen hero copy and metrics to Simplified Chinese; English restores the original wording. The document language changes between `en` and `zh-CN` with the selected copy.

### Pricing currency extension

The selected header currency is owned by `App` and passed to `Pricing`, so both desktop and mobile selectors update the same plan prices. A single currency price book supplies explicit currency symbols: `$`, `¥`, `HK$`, `€`, and `A$`. AUD uses rounded price points close to the USD tier value: Starter is `A$529` monthly or `A$449` annually; Growth is `A$729` monthly or `A$599` annually. Enterprise remains a contact-sales plan.

## Scope and verification

Only `src/app/App.tsx` and a focused source-level regression test change. The existing links, logo, and visual theme remain untouched. Verification covers centered menu placement, native language labels, translated copy, accessible semantics, TypeScript/build success, and the actual Vite page at desktop and mobile widths with open/select/close interactions.
