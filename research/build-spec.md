# TPS Pro site overhaul — build spec (read fully before editing)

Repo: /Users/miguelmedina/Desktop/tpspro-website (static HTML on GitHub Pages, live at https://totalpropertysolution.net).
Branch `site-overhaul` is checked out. **Do not commit, push, or switch branches.** Only edit the files assigned to you.

Context reports (read the parts relevant to your pages):
- research/site-audit.md — per-page problems to fix
- research/market-seo-research.md — buyer keywords, competitor gaps, which page should own which search

## 1. The template (non-negotiable)
`index.html` is the canonical template. Every page you touch must use, copied **verbatim** from index.html:
- the `<head>` skeleton: charset, viewport, Google Fonts preconnect + stylesheet link, `assets/fresh.css?v=20260928c`, the GA4 gtag snippet (G-0KM9JRJL2D), favicon + apple-touch-icon.
- the `.topbar`, `.header` (brand, nav, call block), `.footer`, `.sticky-cta` blocks, and `<script src="assets/fresh.js?v=20260928c" defer></script>` before `</body>`.
- Only per-page differences allowed in chrome: add `aria-current="page"` to the matching nav link. Do NOT copy the `.season` strip (homepage only) and do NOT copy the jarvis:season markers.
- Wrap page content in `<main id="main">…</main>`.

Available CSS components (assets/fresh.css) — use these, do not invent new CSS or inline large style blocks:
`.hero-split` (+ `.copy`, `.media`, `.badge-stat`, `.rating`), `.hero` (photo bg variant with `.bg`), `.proof` (4-stat strip),
`.section` / `.section.tint` / `.section.on-pine`, `.section-head` (+`.center`), `.kicker`, `.lede`,
`.doors`/`.door` (+`.flag`), `.svc-grid`/`.svc`, `.gallery`/`.shot`/`.cap`, `.feature` (+`.pics`, `.copy`, `.mini`),
`.steps`/`.step` (auto-numbered), `.case` (+`.bd`, `dl/dt/dd`), `.docs`/`.doc`, `.check-list`, `.faq-list` (details/summary),
`.logos`/`.logo-cell`/`.wordmark`, `.areas`, `.quote-band` + `.qform`, `.crumbs`, `.btn .btn-sun .btn-outline .btn-outline-light .btn-lg`.
Headings h1/h2 render uppercase condensed automatically.

Standard page shape (service/city pages): crumbs → hero (`.hero-split` with a real photo, or `.hero` with bg) → proof or trust points →
what's included (`.svc-grid` or `.check-list`) → how it works (`.steps`) → photos (`.gallery`) → related services + areas links →
FAQ (`.faq-list`) → quote band (form) → footer → sticky CTA.

## 2. Facts — the ONLY claims allowed
- Company: Total Property Solutions Pro LLC ("TPS Pro"), Albany, NY & the Capital Region. Serving since **2019**.
- Phone (518) 948-7156 (`tel:+15189487156`). Email bookings@totalpropertysolution.net. Open 24/7. Bonded & insured. COI and W-9 provided before day one.
- Google: **4.6★, 30 reviews**. Link: https://www.google.com/search?q=Total+Property+Solutions+Pro+Albany+NY+reviews
- Student turnovers: **800+ units in a single turn**; **5,000+ units turned to date**; full-service one-stop: deep clean, repair everything, paint & patch walls/ceilings/doors, common areas & hallways; "one experienced crew instead of a dozen inexperienced vendors". Turn season May–August; peak windows book early (as early as February).
- Services: student & rental turnovers, make-ready, commercial cleaning/janitorial, office cleaning, post-construction & renovation cleaning, floor care (strip/wax/scrub/extraction/refinish), property & facility maintenance, Airbnb turnovers, renovations & construction (buildouts, drywall, paint, flooring), property management (commercial & residential), real-estate turnover tickets.
- Clients (all confirmed real): Rosenblum Companies, PeakMade Real Estate, Beacon Communities, College Suites, Auden Albany, Amicus Properties, WJW Management, Block 75, The Coda & Mayflower (Syracuse student housing), DMG Investments, Belmont Management, Morrison Management, Golub Corporation, AECOM, Cushman & Wakefield, FedEx, UPS, CSX, Sonoco, Curaleaf, FirstLight Fiber, Activision Blizzard, Hudson Common, The Plaza. Schools: SUNY, Albany City School District, East Greenbush CSD. Student housing around UAlbany, RPI, Skidmore, Union College, Hudson Valley CC.
- Crews also work outside the Capital Region (NYC, Westchester, NJ, Florida) — true, but keep it secondary; Capital Region is the focus.

**Forbidden:** invented statistics, response-time guarantees in minutes, prices/dollar figures (the business is quote-based — remove existing prices), insurance coverage amounts, certifications, awards, years-of-experience numbers other than "since 2019", named testimonials or review quotes (the "Jessica M./Daniel R./Sarah K." testimonials are unsourced — delete them everywhere and use the Google rating block instead), "200+ units per season" or "100–200 units" (wrong), "since 2022" (wrong), College of Saint Rose (closed 2024), lorem ipsum, visible placeholders. If a fact you want isn't listed, write around it.

## 3. SEO rules
- `<title>`: keyword-first, `Primary Service City, NY | TPS Pro`, 45–62 chars, unique sitewide.
- `<meta name="description">`: 140–160 chars, unique, plain sentence(s), includes a benefit + CTA or phone. No mid-sentence splices.
- `<link rel="canonical" href="https://totalpropertysolution.net/<file>.html">` (absolute, this domain only).
- `<meta name="robots" content="index, follow, max-image-preview:large">` — except paid landing pages (`*-lp.html`) and `thank-you.html`: `noindex, follow`.
- og:type/url/site_name/title/description/image + twitter:card/title/description/image (image = absolute URL of the page's hero photo).
- Exactly one `<h1>`. Logical h2/h3.
- JSON-LD (one `<script type="application/ld+json">` with `@graph`):
  - `Service` (name, serviceType, description, areaServed, `provider: {"@id":"https://totalpropertysolution.net/#business"}`, url) for service pages; `WebPage`/`AboutPage`/`ContactPage`/`CollectionPage` as fitting.
  - `BreadcrumbList` matching the visible `.crumbs`.
  - `FAQPage` ONLY if the page shows a visible FAQ, and every Question/Answer text must match the visible text exactly (same questions, same answers, same order).
  - Do NOT add aggregateRating/Review markup. Do NOT redefine the LocalBusiness entity (homepage owns it) — reference it by @id.
  - Business name everywhere: "Total Property Solutions Pro LLC", alternateName "TPS Pro".
- Images: only files that exist in `images/` or `images/work/` (check with ls). Always set real `width`/`height` (use `sips -g pixelWidth -g pixelHeight`), descriptive `alt`, `loading="lazy"` except the hero image.
- Internal links: every service page links to 2–4 related services, 2+ city pages, and quote.html. Link to the new pages where relevant: `vendor-onboarding.html`, `industries.html`, `general-contractors.html`, `hoa-condo-cleaning.html`, `medical-office-cleaning.html`, campus pages (`student-turnover-ualbany.html`, `student-turnover-rpi-troy.html`, `student-turnover-skidmore.html`, `student-turnover-union-college.html`). TPS Pro does NOT serve Siena/Loudonville — never mention it).
- Depth: service and city pages ≥ 1,000 words of genuinely useful, specific copy (scope checklists, what's included, process, who it's for, local specifics, FAQ). No filler, no keyword stuffing, no repeated boilerplate across pages. Preserve existing unique local content and blog article bodies — restyle and correct them, don't discard them.

## 4. Forms
Every form: `<form class="qform lead-form" id="<unique>" data-subject="New quote request — <page name>" novalidate>` — no `action`, no `mailto`, no formsubmit/netlify attributes. Fields with `name` + `<label for>`: name, phone (required), email, property_type (select), details (textarea). Include the honeypot exactly:
`<input type="text" name="website" tabindex="-1" autocomplete="off" aria-hidden="true" style="position:absolute;left:-9999px">`.
Never put crcp183@gmail.com anywhere in any page or schema.

## 5. Voice
Confident, plain, B2B. Speak to property managers, facility managers, student-housing operators, GCs, procurement. Short sentences. Specific over generic. "One crew. One contract." is the positioning.

## 6. Self-check before you finish (run it)
```bash
cd /Users/miguelmedina/Desktop/tpspro-website && python3 research/check_pages.py <your files...>
```
Fix everything it reports. Then report: files changed/created, word counts, anything you could not do.
