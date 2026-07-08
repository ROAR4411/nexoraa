# Cadence — Premium AI SaaS Landing Page

A production-ready, dependency-free landing page template (HTML5 + CSS3 + vanilla JS) for an AI agent / automation SaaS product. Dark mode by default, with a persisted light mode toggle.

## Quick start

No build step. Open `index.html` in a browser, or serve the folder locally:

```bash
npx serve .
# or
python3 -m http.server 8080
```

Note: `index.html` loads Google Fonts (Fraunces, Inter, IBM Plex Mono) from a CDN, so an internet connection is needed for the intended typography. Everything else — icons, illustrations, logo — is self-contained inline/SVG with zero image dependencies.

## Structure

```
├── index.html            All markup, one file, heavily commented by section
├── css/
│   └── style.css         Design tokens + every component, numbered table of contents at the top
├── js/
│   └── script.js         19 small independent modules (theme, reveal, forms, etc.)
├── assets/
│   ├── icons/             favicon.svg, logo-mark.svg
│   └── images/             blog-*.svg, og-image.svg
└── README.md
```

## What's included

- 16 sections: announcement bar, navbar, hero, trusted logos, features grid, interactive product showcase, dashboard preview, workflow timeline, stats, pricing, testimonials, FAQ, blog, CTA, contact, footer.
- Dark mode by default, light mode toggle, theme persisted via `localStorage` and applied pre-paint (no flash).
- Scroll progress bar, back-to-top, sticky CTA, cookie banner, newsletter form, animated counters, typing effect, mouse glow, floating background shapes, scroll-reveal animations.
- Accessible: semantic landmarks, skip link, visible focus states, `aria-*` wired at runtime for the FAQ and tabs, `prefers-reduced-motion` respected everywhere, a shared live region for toast-style announcements (copy confirmation, form errors).
- Form validation (contact + newsletter) with inline error messages — no backend included; wire up your own endpoint (see below).

## Wiring up the forms

Both forms currently simulate a submission client-side. To connect a real backend:

1. In `js/script.js`, find `initContactForm()` / `initNewsletterForm()`.
2. Replace the block after validation passes with a `fetch()` call to your endpoint (Formspree, a serverless function, your own API, etc.).
3. Keep the existing success/error UI calls (`success.hidden = false`, `announce(...)`) so the UX stays consistent.

## Browser support

Built on standard CSS (custom properties, grid, `color-mix()` with a plain-color fallback) and vanilla ES2017+ JS (`IntersectionObserver`, `Clipboard API` with an `execCommand` fallback). Tested against the latest two versions of Chrome, Safari, Firefox, and Edge.

## License / usage

Replace all placeholder copy (company name "Cadence," testimonials, team emails, address) before shipping to production. Fonts are loaded under Google Fonts' open-source licenses; verify terms for any marketplace redistribution.

See `CUSTOMIZATION.md` for a guided walkthrough of the design tokens.
