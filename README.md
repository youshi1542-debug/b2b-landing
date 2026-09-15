# VR ARENA GAMES — B2B landing page

Single-page B2B site for selling free-roam VR products on the international market.
Static HTML/CSS/JS — no build step, no dependencies. Open `index.html` and it works.

## The three products

| Section | Product | Pitch |
|---|---|---|
| `#franchise` | Franchise | Maximum support and a proven brand — turnkey arena business |
| `#platform` | Software Platform / White Label | Your own brand on our technology and games |
| `#payg` | Pay-as-you-go | Per-minute rates for games from VR ARENA GAMES |

## Page structure

1. Sticky header with anchor nav + mobile burger menu
2. Hero — headline, animated stat counters, industry marquee
3. **Models** — three product cards + full comparison table
4. **Franchise** — what's included, specs panel, 5-step launch path
5. **White Label** — feature grid + animated operator-dashboard mock
6. **Pay-as-you-go** — three per-minute rate tiers
7. **Games** — 8 game cards (CSS/SVG artwork, no image files)
8. **Arena formats** — Lite / Pro / Flagship
9. **ROI calculator** — interactive, model-aware revenue estimate
10. **Why partners stay** — proof numbers + testimonial
11. **FAQ** — native `<details>` accordion
12. **Contact** — form with client-side validation
13. Footer

## Files

```
index.html
assets/css/styles.css
assets/js/main.js
assets/img/            # empty — drop real photos/renders here
```

## What you need to replace before going live

Everything below is placeholder content written for this layout — swap it for your real data.

- **Numbers.** Hero stats (120+ arenas, 28 countries), franchise specs panel, prices
  ($45,000 / $9,900 / $0.09–0.15 per player-minute), uptime and payback figures.
- **Game titles.** The 8 cards under `#games` are examples with generated names and
  CSS artwork. Replace names, descriptions, tags — and if you add real key art, put an
  `<img>` inside `.game-art` in place of `.game-glyph`.
- **Contact details.** `partners@vr-arena.games` and `+1 000 000 00 00` in the
  contact section and footer.
- **Testimonial** in `#why` — currently anonymised placeholder text.
- **Legal links** in the footer point to `#`.

## Wiring up the contact form

The form is validated in the browser and then stops — nothing is sent anywhere.
In `assets/js/main.js`, find the comment `No backend is wired up yet` and POST to your
CRM / form endpoint there, e.g.:

```js
await fetch('https://your-endpoint.example/leads', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(Object.fromEntries(new FormData(form)))
});
```

## Tuning the ROI calculator

Fee rules live in one object near the top of the calculator block in `main.js`:

```js
var MODELS = {
  franchise:  { label: 'Royalty (5% of revenue)', type: 'percent', value: 0.05 },
  whitelabel: { label: 'Platform fee',            type: 'flat',    value: 0 },
  payg:       { label: 'Usage fee (per minute)',  type: 'minutes', value: 0.11 }
};
```

`percent` takes a share of gross revenue, `minutes` charges per player-minute,
`flat` subtracts a fixed amount. Change the numbers there and the section updates itself.

## Theming

All colours, spacing and fonts are CSS custom properties in `:root` at the top of
`styles.css` (`--cyan`, `--magenta`, `--lime`, `--bg`, `--radius`, `--ff`…).
Changing those four colour variables re-skins the whole page — which is also how you'd
produce a white-label version of this landing page for a partner.

## Technical notes

- Responsive from 320px up; no horizontal scroll at any width.
- Accessibility: skip link, `aria-expanded` on the burger, visible focus rings,
  `aria-live` on calculator and form status, semantic landmarks.
- Respects `prefers-reduced-motion` — counters, marquee, drifting dots and reveals all stop.
- Fonts load from Google Fonts with a system-font fallback stack, so the page still
  renders correctly offline or if the CDN is blocked.
- Verified in headless Chromium at 1440px and 390px: no console errors, no layout overflow.

## Deploying

It's a static site — any host works:

```bash
# local preview
python3 -m http.server 8000
# then open http://localhost:8000
```

For GitHub Pages, serve the repository root from the branch settings.
