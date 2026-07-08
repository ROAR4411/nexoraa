# Customization guide

Everything visual is driven by CSS custom properties at the top of `css/style.css`, under `:root` (dark, default) and `html[data-theme="light"]` (light mode overrides). Change a token once, and it updates everywhere.

## 1. Rebrand the palette

```css
:root{
  --brass:#C9A15A;   /* primary accent — CTAs, links, active states */
  --violet:#7C6CFF;  /* secondary accent — pairs with brass in gradients */
  --void:#0B0C10;    /* page background, dark mode */
  --surface:#15171D; /* card / panel background, dark mode */
}
```

Swap `--brass` and `--violet` for your own two-color accent system. `--grad-signature` (used on the hero headline, primary buttons, avatars) is built from both, so it updates automatically.

## 2. Typography

Three roles, set once:

```css
--font-display:'Fraunces', Georgia, serif;   /* headings */
--font-body:'Inter', sans-serif;              /* paragraphs, UI */
--font-mono:'IBM Plex Mono', monospace;       /* eyebrows, labels, data */
```

To swap a typeface, update the Google Fonts `<link>` in `index.html`'s `<head>` and the matching variable above.

## 3. Spacing

An 8-ish px scale from `--sp-1` (8px) to `--sp-7` (136px). Section vertical rhythm uses `--sp-6`; component internal padding mostly uses `--sp-3`/`--sp-4`. Adjust the scale once to retune the whole page's density.

## 4. Copy

All copy lives directly in `index.html`. Search for the section by its HTML comment banner (e.g. `<!-- ================= 5. FEATURES GRID ================= -->`) to find it quickly.

## 5. Logos / trusted-by

`.wordmark` spans under the "Trusted by" section are plain text — replace with your customers' real SVG logotypes for production use (grayscale-on-hover treatment is already in the CSS).

## 6. Pricing

Each `.price-card` has `data-monthly` / `data-yearly` attributes on its `.price-value` — set your real numbers there. The toggle logic in `script.js` (`initPricingToggle`) reads these automatically; no other JS changes needed.

## 7. Sections you can safely remove

Every section is a self-contained `<section>` with its own CSS block (see the numbered table of contents at the top of `style.css`). Deleting a section from `index.html` won't break layout elsewhere — just remove the matching nav link in the navbar if you drop a section it points to.

## 8. Reduced motion & accessibility

All animation (typing effect, counters, reveal-on-scroll, mouse glow) automatically short-circuits to its final state when the visitor has `prefers-reduced-motion: reduce` set — no configuration needed, but keep this in mind if you add new animated components.
