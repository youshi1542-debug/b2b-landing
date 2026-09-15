# VR ARENA GAMES — B2B landing page

Single-page B2B site for selling free-roam VR products on the international market.
Static HTML/CSS/JS — no build step, no dependencies. Open `index.html` and it works.

Built on the **Graphite Mono** design system — see [`DESIGN-SYSTEM.md`](DESIGN-SYSTEM.md).
That file is the source of truth for tokens, typography, motion and block rhythm; this one
covers the page itself.

## The three products

| Section | Product | Pitch |
|---|---|---|
| `#franchise` | Franchise | Maximum support and a proven brand — turnkey arena business |
| `#platform` | Software Platform / White Label | Your own brand on our technology and games |
| `#payg` | Pay-as-you-go | Per-minute rates for games from VR ARENA GAMES |

## Page structure

Blocks follow the rhythm in the design system: one idea per screen, a bracketed label on
every section, and never two dense blocks in a row.

1. **Hero** — particle sphere, `Open a VR arena. Anywhere.`, live status pill, venue-type
   marquee with a stat pill layered on top
2. **Models** — three cards, one accent, numbered `[ 01 · Franchise ]`
3. **Side by side** — the comparison table, on an **inverted white background**; this block
   is the act break that splits the page
4. **Franchise** — six feature blocks, spec rows, five launch steps
5. **White Label** — six feature blocks plus an operator-console mock
6. **Pay-as-you-go** — three per-minute rate tiers
7. **Statement** — `Every model ships with the same games.` Sparse block between two dense ones
8. **Games** — eight cards
9. **Arena formats** — Lite / Pro / Flagship
10. **Ask us** — the scatter block: a question field with real operator questions floating in
    the side bands of the viewport
11. **The numbers** — interactive, model-aware ROI calculator
12. **Questions** — FAQ accordion
13. **Talk to us** — two contact cards and the enquiry form
14. **Closing statement** — the sphere reassembles behind it
15. Footer

## Files

```
index.html
assets/css/styles.css     # all tokens live in :root at the top
assets/js/main.js
assets/img/               # empty — drop real photos/renders here
DESIGN-SYSTEM.md
```

## How the distinctive pieces work

**Particle sphere** (`main.js`, the `sphere()` block). One fixed canvas for the whole
document. Points sit on a Fibonacci sphere; three scroll-driven weights decide the state —
tight and high in the hero, dispersed through the middle of the page, reassembled behind the
closing statement. 1400 points on desktop, 500 on mobile, paused when the tab loses focus,
replaced by a static frame under `prefers-reduced-motion`.

Note: the canvas sits behind section backgrounds, so particles are visible over the
transparent dark sections only. The inverted white section paints over them and carries its
own dot texture instead.

**Inverted section.** `data-invert` on the section; the scroll handler toggles two classes on
`<body>` — `is-light` when the section covers the viewport centre (edge chrome) and
`is-light-top` when it covers the header line (nav pill). The section itself overrides the
colour tokens, so nothing inside needs light-specific classes.

**Scatter block.** Absolutely positioned items in the side bands, kept clear of the centre
column. Items fade in one by one with a random delay and drift a few pixels. Hidden entirely
below 1280px — cramming them into a narrow viewport turns to mush.

**Live counters.** They count up once when scrolled into view and then stop. They do *not*
tick upward on their own: a number that invents growth in front of the visitor is a dark
pattern. Wire them to real data or leave them static.

## What to replace before going live

- **Numbers.** Hero status (128 arenas / 28 countries), stat pill, franchise specs, prices
  ($45,000 / $9,900 / $0.09–0.15 per player-minute), payback figures, the question counter
  in the Ask block.
- **Game titles.** The eight cards are examples with generated names and CSS artwork.
  Replace names, copy and tags; for real key art, put an `<img>` inside `.game-art`.
- **Contact details.** `partners@vr-arena.games` and `+1 000 000 00 00`.
- **Scatter questions.** They should be real questions you actually get, with real counts.
- **Legal links** in the footer point to `#`.

## Wiring up the forms

Neither form sends anything yet.

The **Ask** field hands its text to the contact form's message box and scrolls the visitor
down — no backend needed for that to be useful. The **contact form** validates in the browser
and then stops. In `main.js`, find the comment `No backend is wired up yet` and POST to your
CRM endpoint:

```js
await fetch('https://your-endpoint.example/leads', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(Object.fromEntries(new FormData(form)))
});
```

## Tuning the ROI calculator

Fee rules live in one object in `main.js`:

```js
var MODELS = {
  franchise:  { label: 'Royalty 5%',    type: 'percent', value: 0.05 },
  whitelabel: { label: 'Platform fee',  type: 'flat',    value: 0 },
  payg:       { label: 'Usage per min', type: 'minutes', value: 0.11 }
};
```

`percent` takes a share of gross revenue, `minutes` charges per player-minute, `flat`
subtracts a fixed amount.

## Theming

Every colour, size and duration is a custom property in `:root` at the top of `styles.css`.
Changing `--accent` re-skins the whole page — which is also how you'd produce a white-label
version of this landing page for a partner.

Note on `--text-on-accent`: it is dark on purpose. White on the pink accent measures 3.5:1,
which fails AA for small text, so pills and buttons set dark text over the accent.

## Technical notes

- One typeface throughout: JetBrains Mono, loaded from Google Fonts with a monospace
  fallback stack, so the page still renders correctly offline or if the CDN is blocked.
- Responsive from 320px up; verified with no horizontal overflow at 320 / 390 / 768 / 1100 /
  1280 / 1440.
- Accessibility: skip link, `aria-expanded` on the burger, visible focus rings, `aria-live`
  on the calculator and form status, semantic landmarks, bracket characters in section
  labels generated via `::before`/`::after` so they stay out of selected text.
- Respects `prefers-reduced-motion`: reveals, drift, marquee, typewriter, the pulsing status
  dot and the sphere's rotation all stop.
- Works without JS: `.reveal` elements are shown immediately when `IntersectionObserver` is
  unavailable.

## Deploying

Static site — any host works:

```bash
python3 -m http.server 8000   # then open http://localhost:8000
```

For GitHub Pages, serve the repository root from the branch settings.
