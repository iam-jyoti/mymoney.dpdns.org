# InvestCalc (mymoney.dpdns.org)

This repository contains the InvestCalc static website (financial calculators).

## Ad slots
The project now uses only three configured AdSense slots. They are intentionally documented here and also in `index.html` top comments.

- headerHero (bottom banner)
	- Slot ID: `5690961949`
	- Location: `index.html` — bottom full-width banner just before the footer
	- Notes: moved from top to bottom to keep the header area clean

- contentInline (in-content/inline)
	- Slot ID: `5314529758`
	- Location: `index.html` — inside the SIP calculator panel (placeholder `.content-inline-ad.lazy-ad`)
	- Notes: lazy-loaded via IntersectionObserver; the ad <ins> is injected when near viewport

- sidebarVertical (sticky sidebar)
	- Slot ID: `1751716931`
	- Location: `index.html` — right column sidebar placeholder (`#sidebar-vertical-ad`, `.adsense-sidebar.lazy-ad`)
	- Notes: lazy-loaded and uses CSS `position: sticky` to remain visible while scrolling

## What was removed
The following previously present ad slots were intentionally removed to keep only the three requested slots:

- `6683866723` (removed)
- `7820584923` (removed)

## Lazy loading and fallback
- `js/main.js` contains an IntersectionObserver-based lazy-loader which injects the ad markup into elements with class `lazy-ad` and a `data-ad-slot` attribute.
- If `adsbygoogle` is not present (e.g., blocked or not included), a small fallback function `ensureAdsLoader()` will attempt to append the AdSense loader script dynamically to the `head` and resolve when loaded.

## Local testing
1. Run a static server from the project root (PowerShell):
```powershell
python -m http.server 8000
# or
npx http-server -p 8000
```
2. Open `http://localhost:8000/` in a browser.
3. Use DevTools > Elements to confirm placeholders (`.lazy-ad`) exist and get populated when scrolled into view.
4. Confirm header is clean, sidebar ad remains sticky, and bottom banner is present.

## Notes
- Ad serving on `localhost` may be restricted by AdSense. The injected <ins> will appear but real ads may not be served until deployed on a domain allowed by your AdSense account.
- If you'd like additional placements or lazy-loading tweaks (e.g., only on mobile/desktop), I can implement those quickly.

---
Generated: October 19, 2025
