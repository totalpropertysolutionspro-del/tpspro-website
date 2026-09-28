# TPS Pro website: technical SEO, content accuracy and professionalism audit

- **Site:** https://totalpropertysolution.net (GitHub Pages, custom domain via CNAME)
- **Source audited:** `/Users/miguelmedina/Desktop/tpspro-website`, working tree as of 2026-09-27. This includes the uncommitted FAQ edits in `commercial-cleaning-albany-ny.html`, `post-construction-cleaning.html`, `property-management.html`, `renovations-construction.html` and `student-turnover-cleaning.html`.
- **Scope:** all 44 `.html` pages, `assets/fresh.css`, `assets/fresh.js`, `sitemap.xml`, `robots.txt`, `CNAME`, plus a few live HTTP checks.
- **Method:** Python parser over every page (head tags, headings, JSON-LD parse, links, images, forms, labels), link graph and sitemap diff, 5-word-shingle similarity for duplicate content, WCAG contrast math on the CSS tokens, and grep sweeps for stats, names, emails and legacy strings. The audit was read-only. No site file was edited.
- **Source of truth:** Total Property Solutions Pro LLC ("TPS Pro"), Albany NY and the Capital Region, (518) 948-7156, bookings@totalpropertysolution.net, open 24/7, bonded and insured, serving since 2019, Google 4.6★ from 30 reviews. Student turns: 800+ units in a single turn, 5,000+ turned to date, full service, one crew.

---

## Prioritized fix list

**P0** = hurts trust, leads or legal exposure now · **P1** = SEO impact · **P2** = polish

### P0: fix first

| # | Issue | Evidence | Exact files / fix |
|---|---|---|---|
| P0-1 | **Unsourced "client reviews" that look fabricated.** Three 5-star quotes attributed to "Jessica M. / Property Manager, Commercial Office", "Daniel R. / Regional Manager, Multi-Family" and "Sarah K. / Facilities Director, Retail". They have no source, no date and no link, and the same three appear word for word on two pages. The FTC's 2024 rule on fake reviews and testimonials (16 CFR 465) makes fake or unverifiable testimonials a legal risk as well as a trust risk. | `index.html` lines 304–318; `about.html` lines 164–178 | Replace both blocks with real Google reviews (quoted verbatim, reviewer name exactly as shown on Google) plus a "4.6★ · 30 Google reviews" badge that links to the Google Business Profile. If real reviews can't be sourced yet, delete the section. |
| P0-2 | **Star ratings on things that aren't reviews.** `quote.html` shows four "★★★★★" cards that are really value statements ("Always reachable", "One contract"…). A visitor reads them as reviews. | `quote.html` lines 180–212 | Remove the `<div class="stars">` from these 4 cards, or swap in icons. |
| P0-3 | **Wrong student-turn stat, "200+ units per season".** It contradicts the real figures (800+ units in a single turn, 5,000+ to date), and those real figures appear on other pages of the same site. | `index.html:248`, `about.html:148` ("200+ Student units turned per season"); `student-housing-lp.html:89` ("200+ Units turned per peak season", a paid-traffic LP); `blog-choose-commercial-cleaning-company-albany.html:244` and `blog-commercial-cleaning-cost-albany.html:207` ("100 to 200+ … turnovers per peak season") | Change the stat tiles to "800+ units in a single turn" and/or "5,000+ units turned". Rewrite the two blog sentences to match. (`blog-how-often-commercial-cleaning.html:291` uses "100 to 200+ units" as a generic market statement. Reword it too, so the number doesn't read as TPS's own.) |
| P0-4 | **Wrong founding year on a paid landing page:** "Since 2022" (×3) vs. "since 2019" everywhere else. | `commercial-cleaning-lp.html` lines 48, 146, 175 | Change to 2019. |
| P0-5 | **Lead forms don't actually submit anywhere.** All 33 forms use `action="mailto:crcp183@gmail.com"`. `fresh.js` blocks the POST and opens the visitor's own email app (`LEAD_ENDPOINT` is `null`, and the Cloudflare Worker in `worker/` is not wired in). No lead is saved unless the visitor has a desktop mail client set up **and** presses Send. Webmail users on a desktop, and anyone who closes the draft, are lost silently. `thank-you.html` is never reached, so there's no reliable conversion signal (the `generate_lead` event fires before the email is sent). GitHub Pages can't process POSTs. | every page with a form (all except blog posts and `thank-you.html`); `assets/fresh.js` lines 8–9, 83–110 | Deploy the Worker (`worker/README.md`) or another form backend, set `window.TPS_LEAD_ENDPOINT` in `assets/fresh.js`, and redirect to `thank-you.html` on success. Keep mailto only as a fallback. Test on iPhone Safari, Android Chrome and desktop Chrome with Gmail webmail. |
| P0-6 | **Personal Gmail shown publicly as the business contact.** When a form "fails", visitors see a red error box telling them to email `crcp183@gmail.com`. That box shows every time, even when the email app opened fine, because `openMail()` always calls `showNote(form,false)`. The Gmail address is also in the `mailto:` action of 33 forms, in `student-turnover-cleaning.html:40` as the schema `"email"` (every other page says bookings@), and in `worker/README.md` / `worker/wrangler.toml`, which GitHub Pages serves publicly (`/worker/README.md` returned HTTP 200). | `assets/fresh.js` lines 8, 64–66, 105–106; all 33 form pages; `student-turnover-cleaning.html:40`; `worker/*` | Use `bookings@totalpropertysolution.net` everywhere (LEAD_EMAIL, form actions, schema). Rewrite the fallback note as a neutral message, not a red error. Stop publishing `worker/`, `jarvis/` and `netlify.toml` (see P1-10). |
| P0-7 | **Garbled meta descriptions show up in Google results.** Several drafts were pasted into one tag, joined by leftover `'s` fragments, e.g. `…a cleaner space today.'s one-contract partner…`. Google will truncate these mid-sentence and show the broken text. | `index.html:7` (310 chars), `about.html:7` (755), `services.html:7` (432), `faq.html:7` (261) | Rewrite each as one 140–155 character sentence (suggestions in Appendix A). Also remove the unsupported "top-rated" claim from `index.html`. Say "4.6★ on Google" instead. |
| P0-8 | **Claims to verify before they're challenged.** (a) A client wall of 23 named brands, including FedEx, UPS, CSX, Activision Blizzard, AECOM, Golub, Cushman & Wakefield, Curaleaf and Sonoco, plus "Fortune 500 facilities". The HTML comment says these were "verified in Square/job records". Confirm each was a **direct** client and not work done as a subcontractor under a GC or facility manager. If it was, say "work performed at …" or remove the name. Displaying brand names implies an endorsement. (b) "Serving SUNY, Albany City School District & East Greenbush CSD". (c) `faq.html` says "crews also available in NYC, Westchester County, New Jersey, and Florida". That contradicts the Capital Region positioning everywhere else and invites out-of-area calls. | `index.html` lines 261–292; `about.html:119`; `faq.html` line 26 (schema) and line 129 (visible) | Owner confirms each item, then edit or remove. |

### P1: SEO impact

| # | Issue | Evidence | Exact files / fix |
|---|---|---|---|
| P1-1 | **Canonical tag points to a different, dead domain.** The canonical and `og:url` point to `https://tpsprollc.com/property-manager-cleaning-albany-ny/`, and the schema `url`/`image` use tpsprollc.com too. That domain doesn't resolve. Google is being told this page's real home is elsewhere, so it will likely drop the page from the index. | `property-manager-cleaning-albany-ny.html` lines 9, 11, 32–33 | Canonical and og:url → `https://totalpropertysolution.net/property-manager-cleaning-albany-ny.html`. Schema image → `/assets/tps-logo-transparent.png`. Name → "Total Property Solutions Pro LLC". |
| P1-2 | **FAQ schema doesn't match the page's visible FAQ.** Google's FAQPage rules require the marked-up Q&A to be visible on the page. On these pages the schema questions are written differently from the visible `<h3>` questions (or have no visible counterpart), and some carry different facts. On `airbnb-cleaning.html` the schema includes pricing of $65–$90 / $90–$140 / $140–$200+, while the visible FAQ has different questions. | Schema questions found verbatim on the page: `airbnb-cleaning` 0/5, `facility-maintenance` 0/5, `floor-care` 0/5, `renovation-cleaning` 1/5, `property-maintenance` 4/5, `blog-choose-commercial-cleaning-company-albany` 0/4, `blog-student-housing-turnover-cleaning-albany` 0/3, `blog-student-turnover-cost` 0/3, `blog-commercial-cleaning-cost-albany` 1/3, `blog-make-ready-cleaning-guide` 1/3, `blog-post-construction-cleaning-what-to-expect` 2/3, `blog-how-often-commercial-cleaning` 3/5 | Regenerate each FAQPage block from the visible Q&A text, word for word. The 5 newly edited pages, plus `faq.html`, `commercial-cleaning-albany-ny`, `janitorial-services`, `office-cleaning` and `property-manager-cleaning-albany-ny`, already match, so use them as the template. There's no duplicate FAQPage on any page: every page has at most one. |
| P1-3 | **Orphan blog post.** `blog-student-housing-turnover-cleaning-albany.html` has zero internal links pointing to it and is missing from `sitemap.xml`. It's also the best supporting article for the main money page. | Link graph; `blog.html` | Add it to `blog.html`, link to it from `student-turnover-cleaning.html` and `blog-student-turnover-cost.html`, and add it to the sitemap. |
| P1-4 | **Sitemap lastmod values are stale or missing.** Only 13 of 39 entries have `<lastmod>`, and they're all 2026-07-12 or older. Meanwhile `index.html` changes monthly (the seasonal strip) and the 5 FAQ pages are being edited now. `changefreq`/`priority` are ignored by Google. | `sitemap.xml` | Add accurate `<lastmod>` to every URL (ideally generated from git dates in the JARVIS workflow), drop changefreq/priority, and add the orphan post. The noindex pages are correctly left out. |
| P1-5 | **The same business shows up as several different entities in structured data.** Names: "Total Property Solutions Pro LLC" (24 pages), "TPS Pro LLC" (13), "TPS Pro", and "TPS Pro LLC — Property Manager Cleaning Services". `@id`: `…/#business` (index only) vs `https://totalpropertysolution.net` (17 pages). Telephone appears in 3 formats. The schema has **no `sameAs`** (Google Business Profile, Facebook, etc.), and there's **no link to the Google Business Profile anywhere on the site**. Blog and LP pages set the LocalBusiness `url` to the page URL instead of the homepage. | `index.html` plus every page's JSON-LD | Use a single `@id` `https://totalpropertysolution.net/#business` and define it fully once (homepage, with `sameAs` → GBP URL, Facebook, etc.). Other pages reference it with `"provider":{"@id":".../#business"}`. Name: "Total Property Solutions Pro LLC", alternateName "TPS Pro". Telephone: `+15189487156`. Blog `author`/`publisher` should point to the same @id. |
| P1-6 | **aggregateRating:** none on the site. That's correct, and it should stay that way: self-served LocalBusiness ratings aren't eligible for review stars and can trigger a manual action. Show the real 4.6★/30 as visible text with a link to Google instead (P0-1). | none | Don't add aggregateRating. |
| P1-7 | **Several pages compete for "commercial cleaning Albany NY".** `index.html`, `albany-ny.html` ("Commercial Cleaning Albany NY") and `commercial-cleaning-albany-ny.html` ("Commercial Cleaning in Albany, NY") target the same query. Their body copy is distinct (1% overlap), so the conflict is in the targeting, not in duplicate text. | titles/H1s | Retarget `albany-ny.html` to "Cleaning & Property Services in Albany, NY \| TPS Pro" as the location hub, and make `commercial-cleaning-albany-ny.html` the only commercial-cleaning page. Cross-link the two. |
| P1-8 | **Titles don't follow one pattern.** The homepage title has no brand. Some titles end in "\| TPS Pro LLC", some have no brand, and "Albany NY" vs "Albany, NY" varies. | see table (Pattern column) | Standardize on `Service + City, NY \| TPS Pro` (Appendix A has a rewrite for every nonconforming title). |
| P1-9 | **Thin city pages and hub pages.** The 9 city pages have 356–498 words of unique body text each (522–651 including the template). There's no local FAQ, no local proof (jobs, clients, photos with captions) and no map. Other thin indexable pages: `real-estate-turnovers.html` (418), `services.html` (439), `contact.html` (245), `blog.html` (495). | word counts | Add 300–500 words per city page: 3–4 local FAQs (with matching FAQPage schema), 1–2 named local jobs or clients with photos, neighborhoods served, and response times. Put the most effort into Albany, Troy, Schenectady and Saratoga Springs. |
| P1-10 | **Internal files are publicly served.** GitHub Pages publishes the whole repo: `/jarvis/report.md`, `/jarvis/tasks.json`, `/worker/README.md`, `/worker/wrangler.toml` and `/netlify.toml` all return HTTP 200. `style.css`/`main.js` are legacy files, also served and unused. There's also no custom `404.html` (GitHub's default 404 page is shown). | live HTTP checks | Add a `_config.yml` with `exclude: [jarvis, worker, research, netlify.toml, .netlify, style.css, main.js]` (GitHub Pages runs Jekyll by default). Or move the site into `/docs`, or publish via an Actions artifact. Add a branded `404.html` with nav and phone. |
| P1-11 | **Heavy images with no dimensions set.** The 26 photos in `images/work/` are 105–355 KB JPEGs at 1200×1600 / 1600×1200, but they display at about 400 px wide in cards. 10 files are over 300 KB, 9 of them in use (e.g. `roof-pressure-washing.jpg` 347 KB, `kitchen-maintenance.jpg` 336 KB, `floor-buffing-commercial.jpg` 334 KB). Almost every content `<img>` lacks `width`/`height`, which causes layout shift (CLS). The homepage loads about **3.2 MB** of local assets (14 images, the hero, CSS and JS) plus about 130 KB of gtag. Hero backgrounds on inner pages are CSS `background-image` with no preload, which slows the largest paint (LCP). | `images/work/*`; every page | Export 800 px and 1600 px WebP versions (target under 120 KB), use `srcset`/`sizes`, and add `width`/`height` to every `<img>`. Add `<link rel="preload" as="image">` for each page's hero, or switch the hero to an `<img fetchpriority="high">`. |
| P1-12 | **Wrong or inconsistent facts in content.** (a) The College of Saint Rose closed in 2024, but posts still list it as a current turnover driver. (b) Student-turn pricing is inconsistent: "$150–$350/unit" in one post, "$100–$250/unit" in another. (c) Airbnb pricing: "$80–$175/unit" in `blog-commercial-cleaning-saratoga.html:146` vs $65–$200+ tiers on `airbnb-cleaning.html:135`. (d) Small-office janitorial: "$150–$400/mo" (`faq.html`) vs "$200–$400" vs "$200–$600". (e) Booking lead time: "as early as February", "February or March" and "March or April" on different pages. | (a) `blog-student-housing-turnover-cleaning-albany.html` lines 48, 140; `blog-make-ready-cleaning-guide.html:253` · (b) `blog-commercial-cleaning-cost-albany.html` vs `blog-student-turnover-cost.html:47` · (e) `student-turnover-cleaning.html`, `blog-student-turnover-cost.html:63`, `blog-student-housing-turnover-cleaning-albany.html:48` | Remove Saint Rose. Pick one price band per service (or say "from $X, quoted per walkthrough") and one booking window, then apply them everywhere, including inside the JSON-LD answers. |

### P2: polish

| # | Issue | Files / fix |
|---|---|---|
| P2-1 | `og:url` is extensionless (e.g. `/albany-ny`) while the canonical is `/albany-ny.html`. Schema `url`/breadcrumb `item` values are also extensionless on 18 pages. GitHub Pages serves both, so each page has two URLs. | Make og:url, schema URLs and breadcrumbs exactly equal to the canonical. Files: all 9 city pages, `blog.html`, `faq.html`, `blog-commercial-cleaning-saratoga.html`, `blog-property-manager-cleaning-guide.html`, `blog-student-turnover-cost.html`, `student-turnover-cleaning.html`, plus the schema on `airbnb-cleaning`, `facility-maintenance`, `floor-care`, `make-ready-cleaning`, `post-construction-cleaning` and `renovation-cleaning`. |
| P2-2 | No `og:image` on the 11 blog pages, `quote.html`, `faq.html`, the 3 LPs or `thank-you.html`. `twitter:title/description/image` exist only on `index`, `about`, `contact` and `services` (X falls back to OG, so this is minor). The OG images are 4:3 photos; 1200×630 is the recommended size. | Add a 1200×630 branded `og:image` to every page. |
| P2-3 | BlogPosting/Article schema has no `image`, no `dateModified` (except one post), and an Organization author instead of a person. `blog-commercial-cleaning-saratoga.html`, `blog-property-manager-cleaning-guide.html` and `blog.html` use LocalBusiness instead of BlogPosting/Blog. | All `blog-*.html`: add image, dateModified and author (Miguel Medina, owner), and reference the #business publisher. |
| P2-4 | No BreadcrumbList on the blog posts, `index`, `quote`, `real-estate-turnovers`, `property-management`, `renovations-construction` or `property-manager-cleaning-albany-ny`. | Add breadcrumbs. |
| P2-5 | Heading order: on 13 pages the footer `<h4>` comes right after an `<h2>` (skips h3). Each page has exactly one H1. | Change footer `h4` to styled `<p class="fh">` or `<h2 class="fh">`. |
| P2-6 | `albany-ny.html` meta description is 165 chars (a little long). | Trim to 155. |
| P2-7 | 11 image and logo files are unused (`images/portfolio-*.jpg`, `images/hero-floors.jpg`, `assets/logo.png`, `assets/tps-logo-web.png`, `assets/tps-logo-dark-bg.png`, `assets/icon-192.png`), along with `style.css` and `main.js`. The header logo is an 800×800 PNG shown at 54 px. | Delete or exclude the unused files. Export a 108 px logo (or SVG). Add `width`/`height` to the footer logo `<img>`. |
| P2-8 | Hardcoded "© 2026". | Fine for now. Update yearly, or let the JARVIS rotator do it. |
| P2-9 | Wording that may read as generic or AI-written ("A 5-star clean is a psychological experience…", "no equivalent in any other commercial…"). | Light edit pass on `airbnb-cleaning.html` and the long blog posts. |

---

## Sitewide findings

### 1. Head tags
- **lang / viewport / charset / favicon:** all 44 pages have `lang="en"`, the viewport tag, UTF-8, `favicon-32.png` and `apple-touch-icon.png`. OK.
- **Titles:** all 44 are unique and 35–61 characters. None are truncated. 25 follow the "Service City NY | TPS Pro" pattern. The rest are missing the brand, use "| TPS Pro LLC", or are topic-first blog titles with no brand (Appendix A).
- **Meta descriptions:** all are unique. 4 are corrupted (P0-7) and 1 is slightly long (P2-6). The rest are 133–160 characters and include the phone number (good for local intent).
- **Canonical:** present and absolute on all 44 pages. 43 are correct; 1 points to a foreign domain (P1-1).
- **Robots:** `index, follow` everywhere, except `noindex, follow` on `commercial-cleaning-lp.html`, `post-construction-lp.html`, `student-housing-lp.html` and `thank-you.html`. That's correct, and none of them are in the sitemap.
- **robots.txt:** allows everything and points to the sitemap. OK. **CNAME:** `totalpropertysolution.net`. http and www both 301 to https apex. OK.
- **OG/Twitter:** og:title/description/type are present everywhere. Gaps are listed in P2-1 and P2-2.

### 2. Structured data (JSON-LD)
- **59 blocks on 44 pages, all parse cleanly. No parse errors.**
- Types used: LocalBusiness, ProfessionalService, Service, OfferCatalog/Offer, FAQPage, BreadcrumbList, BlogPosting, Article, AboutPage, ContactPage.
- **No page has more than one FAQPage.** The 5 working-tree edits each add a single FAQPage that matches the visible FAQ. Those are good.
- The FAQPage schema doesn't match the visible FAQ on 12 other pages (P1-2).
- No aggregateRating or Review markup anywhere (correct; P1-6).
- Entity inconsistencies are covered in P1-5. Address is locality-only (Albany, NY, US). That's fine for a service-area business, but it must match the Google Business Profile.
- `student-turnover-cleaning.html` schema email = `crcp183@gmail.com`; every other page uses bookings@ (P0-6).

### 3. Images
- **Alt text:** every `<img>` on all 44 pages has a descriptive alt. None are missing or weak.
- **Size:** 10 files are over 300 KB (9 in use), and all 26 work photos are over 100 KB (P1-11). Largest: `roof-pressure-washing.jpg` 347 KB, `exterior-construction-site.jpg` 337 KB, `kitchen-maintenance.jpg` 336 KB, `floor-buffing-commercial.jpg` 334 KB, `carpet-extraction-office.jpg` 331 KB, `roof-repair-patch.jpg` 324 KB, `retail-floor-care.jpg` 320 KB, `retail-floor-machine.jpg` 310 KB.
- **width/height:** only the header logo sets them. Every content image and the footer logo are missing them. That's 1–13 images per page.
- **Lazy-loading:** content images use `loading="lazy"`. The header logo is correctly eager. The footer logo is eager and could be lazy.
- **Formats:** JPEG/PNG only. No WebP/AVIF and no `srcset`.

### 4. Internal links and sitemap
- **Broken internal links: none.** All relative and root-relative links resolve to existing files, and all `#fragment` links (e.g. `property-management.html#residential`) resolve to real IDs.
- **Orphans:** `blog-student-housing-turnover-cleaning-albany.html` is indexable with 0 inbound links (P1-3). The 3 LPs and `thank-you.html` also have 0 inbound links, which is fine because they're noindex.
- **Weakly linked indexable pages:** each blog post gets 1–5 links; `property-manager-cleaning-albany-ny.html` gets 1 (from services.html only); `facility-maintenance`, `floor-care`, `renovation-cleaning` and `airbnb-cleaning` get 2–5 each. Add contextual links from related service pages and city pages.
- **Sitemap:** 39 URLs, all resolving to real files. Missing: the orphan post. lastmod is on only 13 entries (P1-4).

### 5. Content accuracy and trust: every occurrence

| Item | Occurrences |
|---|---|
| Unsourced testimonials "Jessica M.", "Daniel R.", "Sarah K." | `index.html` 304–318; `about.html` 164–178 (3 each, 6 total) |
| Star rows on non-reviews | `quote.html` 182, 190, 198, 206 |
| Wrong "200+" stat | `index.html:248`; `about.html:148`; `student-housing-lp.html:89`; "100 to 200+" in `blog-choose-commercial-cleaning-company-albany.html:244`, `blog-commercial-cleaning-cost-albany.html:207`; generic "100 to 200+ units" in `blog-how-often-commercial-cleaning.html:291` |
| Correct 800+/5,000+ stat (for reference) | index, faq, student-turnover-cleaning, student-housing-lp, blog-student-housing, and others (about 25 mentions). These are consistent. |
| Founding year | "since 2019" ×56, "founded in 2019" ×1 (about). **"Since 2022" ×3 in `commercial-cleaning-lp.html`** |
| Phone | (518) 948-7156 / +15189487156 everywhere. No wrong numbers. `(518) 555-0100` appears only as form placeholder text (OK). |
| Email | bookings@totalpropertysolution.net ×166; **crcp183@gmail.com ×34** (33 form actions + 1 schema) + `assets/fresh.js` + publicly served `worker/` files. `jane@company.com` is a placeholder only. |
| Hours | "Open 24/7" is consistent. The schema uses both `openingHoursSpecification` 00:00–23:59 (index) and `openingHours "Mo-Su 00:00-24:00"` (other pages). Same meaning. |
| Old company names ("Commercial And Residential Cleaning Pro", "cr-cleaning-pro") | **None found.** The "commercial and residential" hits are ordinary phrases. |
| Old domain totalpropertysolutionspro.com | **None.** A different dead domain, **tpsprollc.com**, appears ×4 in `property-manager-cleaning-albany-ny.html` (P1-1). |
| Netlify form handlers / `data-netlify` / FormSubmit | None in HTML. `fresh.js` still selects `form[action*="formsubmit"]` (harmless). `netlify.toml` and `.netlify/` are leftovers (`netlify.toml` is publicly served). |
| Lorem ipsum / TODO / TBD | None. The only "placeholder" hits are form `placeholder=` attributes. |
| Unsupported superlatives / claims | "top-rated" (`index.html:7` meta); "Fortune 500 facilities" (`index.html:261`, `about.html:119`); brand client wall (`index.html` 268–290); "one of the only cleaning companies … with dedicated crews for the Saratoga market" (`faq.html`); NYC/Westchester/NJ/Florida crews (`faq.html`). Verify all of these (P0-8). |
| Stale local fact | College of Saint Rose (closed 2024): `blog-student-housing-turnover-cleaning-albany.html` 48, 140; `blog-make-ready-cleaning-guide.html:253` |
| Price inconsistencies | See P1-12. |
| Google rating 4.6★ / 30 | **Not shown anywhere on the site**, and there's no GBP link. This is a missed trust signal. |

### 6. Forms

| Pages | Action | Behaviour on GitHub Pages |
|---|---|---|
| 33 pages (every service, city and core page plus the 3 LPs) | `mailto:crcp183@gmail.com`, POST, class `lead-form` | GitHub Pages can't receive a POST. `fresh.js` intercepts the submit, runs `reportValidity()`, fires GA4 `generate_lead`, then sets `location.href = mailto:…` with the fields in the body. **The lead only arrives if the visitor's device has a configured mail app and they press Send.** Then a red "Your email app should have opened… email crcp183@gmail.com" box appears. The `LEAD_ENDPOINT` branch (Cloudflare Worker via Resend) is written but switched off (`null`). `thank-you.html` is never used. |
| Blog posts, `thank-you.html` | no form | n/a |

Labels: every visible input, select and textarea has a matching `<label for>`. The hidden `_subject` field is skipped. OK.

### 7. Performance basics
- **Render-blocking:** only `assets/fresh.css` (18 KB, one file, no @import, no web fonts: system font stack). gtag is `async`, fresh.js is `defer`. This is good.
- **Homepage weight:** about 3.2 MB of local assets (HTML 30 KB, CSS 18 KB, JS 6 KB, hero 190 KB, 13 `<img>` about 3.0 MB) plus about 130 KB gtag. Lazy-loading keeps the initial load to roughly 0.5 MB, but a full scroll on mobile downloads about 3 MB.
- **LCP:** the homepage preloads `hero-buildout.jpg` (good). Inner pages use CSS background heroes with no preload, and 5 of them use files over 300 KB (`troy-ny`, `clifton-park-ny`, `saratoga-springs`, `facility-maintenance`, `floor-care`).
- **CLS:** content images have no width/height. The `.door .ph` wrappers reserve space with `aspect-ratio`, but other images don't.
- Cache headers are GitHub Pages' default (10 min). The `netlify.toml` headers aren't applied, because the site isn't on Netlify.

### 8. Accessibility basics
Contrast of `fresh.css` token pairs (WCAG AA needs 4.5:1 for normal text):

| Pair | Ratio | Where used | Verdict |
|---|---|---|---|
| `--ink-faint` #7C8A7F on white | 3.62 | `.qform .sub` (13.5 px), `.qform .fine` (12 px), `.review .who span` (13 px), `.header .call small` (10.5 px) | **Fails AA** |
| `--ink-faint` on `--paper` #FCFBF7 | 3.50 | same | **Fails** |
| `--ink-faint` on `--mint` #EDF5EC | 3.25 | `index.html:292` inline caption (14 px) | **Fails** |
| `.client-strip .c` (ink-faint at 85% opacity) | 2.6–2.8 | CSS only (class not used in HTML) | Fails, but unused |
| `--kelly-bright` #2FA52F on white (link hover) | 3.21 | `a:hover` | Fails (hover only) |
| `--kelly` #208820 on white | 4.56 | icons, borders | Passes (barely) |
| `--kelly-text`, `--ink-soft`, sun/pine, footer and topbar pairs | 5.5–12.8 | text | Pass |

**Fix:** darken `--ink-faint` to about `#5F6E62` (≈5.3:1 on white) and `--kelly-bright` to about `#1F7F1F` in `assets/fresh.css` lines 16 and 24.
- Buttons and links: no links or buttons without an accessible name. `.nav-toggle` has `aria-label` and `aria-expanded`, and SVG-only links carry text.
- Focus: `:focus-visible` outline is defined (good). Reduced motion is respected in the JS and CSS.
- The form result note uses `role="status"` (good).

### 9. Duplicate and thin content: the 9 city pages
The main content was compared with 5-word shingles and Jaccard overlap, excluding header, footer, form and scripts, and with the city name replaced by a token.
- **Pairwise overlap: mean 8%, max 11%** (Troy vs Schenectady). The copy is genuinely localized: RPI and Monument Square, Collar City, Spindle City, racing season, Skidmore. **This is not a duplicate-content risk.**
- The problem is **thinness and a shared template**. Every page has the same 4-section layout, the same H1 pattern, the same 7-link service grid and the same "Also serving nearby" block. Unique body copy is only 356–498 words, with no FAQ, no testimonials, no local job photos and no map. They also carry only LocalBusiness and breadcrumb schema, with no Service or FAQ. See P1-9.
- Service-page pairs that could compete (janitorial/office/commercial, property vs facility maintenance, post-construction vs renovation cleaning, make-ready vs real-estate turnovers) have 0–2% text overlap. They're distinct, but make sure each has a clearly different title keyword.

---

## Per-page table

Column key:
- **Title**: length / follows the "Service City NY | TPS Pro" pattern (Y, or a note)
- **Desc**: meta description length (target 100–160)
- **OG gaps**: missing og:image or og:url that doesn't match the canonical; then whether full Twitter tags exist or only `twitter:card`
- **Words**: visible words, including nav and footer
- **Schema**: top-level JSON-LD types, and how many FAQ schema questions appear verbatim on the page
- **In**: number of unique internal pages linking here
- **Sitemap**: lastmod date, "—" if in the sitemap with no lastmod, **missing** if not in it

| Page | Title | Desc | Canonical | Robots | OG gaps; Twitter | H1 | Words | Schema | In | Sitemap |
|---|---|---|---|---|---|---|---|---|---|---|
| about.html | 59 / partial | 755 | OK | index | OK; full | 1 | 588 | AboutPage, BreadcrumbList  | 40 | 2026-07-12 |
| airbnb-cleaning.html | 35 / Y | 133 | OK | index | OK; tw:card only | 1 | 1064 | LocalBusiness, Service, BreadcrumbList, FAQPage FAQ 0/5 visible | 3 | — |
| albany-ny.html | 43 / partial | 165 | OK | index | og:url≠canonical; tw:card only | 1 | 651 | LocalBusiness, BreadcrumbList  | 13 | — |
| ballston-spa-ny.html | 45 / Y | 142 | OK | index | og:url≠canonical; tw:card only | 1 | 557 | LocalBusiness, BreadcrumbList  | 11 | — |
| blog-choose-commercial-cleaning-company-albany.html | 55 / no brand | 138 | OK | index | image; tw:card only | 1 | 2954 | BlogPosting, FAQPage FAQ 0/4 visible | 1 | — |
| blog-commercial-cleaning-cost-albany.html | 58 / Y | 139 | OK | index | image; tw:card only | 1 | 3810 | BlogPosting, FAQPage FAQ 1/3 visible | 3 | — |
| blog-commercial-cleaning-saratoga.html | 53 / partial | 139 | OK | index | image, og:url≠canonical; tw:card only | 1 | 1131 | LocalBusiness  | 1 | — |
| blog-how-often-commercial-cleaning.html | 47 / no brand | 160 | OK | index | image; tw:card only | 1 | 4907 | BlogPosting, FAQPage FAQ 3/5 visible | 1 | 2026-06-09 |
| blog-make-ready-cleaning-guide.html | 60 / Y | 139 | OK | index | image; tw:card only | 1 | 3491 | BlogPosting, FAQPage FAQ 1/3 visible | 1 | — |
| blog-post-construction-cleaning-what-to-expect.html | 53 / no brand | 150 | OK | index | image; tw:card only | 1 | 3648 | BlogPosting, FAQPage FAQ 2/3 visible | 2 | — |
| blog-property-manager-cleaning-guide.html | 43 / partial | 160 | OK | index | image, og:url≠canonical; tw:card only | 1 | 1162 | LocalBusiness  | 1 | — |
| blog-student-housing-turnover-cleaning-albany.html | 52 / no brand | 149 | OK | index | image; tw:card only | 1 | 1101 | Article, FAQPage FAQ 0/3 visible | 0 | **missing** |
| blog-student-turnover-cost.html | 54 / partial | 158 | OK | index | image, og:url≠canonical; tw:card only | 1 | 1137 | Article, FAQPage FAQ 0/3 visible | 5 | — |
| blog.html | 41 / partial | 139 | OK | index | image, og:url≠canonical; tw:card only | 1 | 495 | LocalBusiness  | 40 | — |
| clifton-park-ny.html | 45 / Y | 157 | OK | index | og:url≠canonical; tw:card only | 1 | 522 | LocalBusiness, BreadcrumbList  | 12 | — |
| cohoes-ny.html | 39 / Y | 153 | OK | index | og:url≠canonical; tw:card only | 1 | 574 | LocalBusiness, BreadcrumbList  | 11 | — |
| commercial-cleaning-albany-ny.html | 47 / partial | 154 | OK | index | OK; tw:card only | 1 | 1520 | Service, FAQPage, BreadcrumbList FAQ 5/5 visible | 40 | 2026-07-12 |
| commercial-cleaning-lp.html | 59 / Y | 151 | OK | noindex | image; tw:card only | 1 | 350 | LocalBusiness  | 0 | **missing** |
| contact.html | 47 / partial | 149 | OK | index | OK; full | 1 | 245 | ContactPage, BreadcrumbList  | 40 | 2026-07-12 |
| facility-maintenance.html | 40 / Y | 157 | OK | index | OK; tw:card only | 1 | 1018 | LocalBusiness, BreadcrumbList, FAQPage FAQ 0/5 visible | 2 | — |
| faq.html | 45 / Y | 261 | OK | index | image, og:url≠canonical; tw:card only | 1 | 650 | LocalBusiness, FAQPage, BreadcrumbList FAQ 8/8 visible | 40 | — |
| floor-care.html | 42 / Y | 138 | OK | index | OK; tw:card only | 1 | 1042 | LocalBusiness, BreadcrumbList, FAQPage FAQ 0/5 visible | 5 | — |
| glens-falls-ny.html | 44 / Y | 158 | OK | index | og:url≠canonical; tw:card only | 1 | 580 | LocalBusiness, BreadcrumbList  | 11 | — |
| index.html | 51 / no brand | 310 | OK | index | OK; full | 1 | 786 | LocalBusiness  | 43 | 2026-07-12 |
| janitorial-services.html | 47 / partial | 157 | OK | index | OK; tw:card only | 1 | 765 | Service, FAQPage, BreadcrumbList FAQ 5/5 visible | 14 | 2026-07-12 |
| make-ready-cleaning.html | 39 / Y | 139 | OK | index | OK; tw:card only | 1 | 590 | LocalBusiness, Service, BreadcrumbList  | 14 | — |
| office-cleaning.html | 43 / partial | 153 | OK | index | OK; tw:card only | 1 | 769 | Service, FAQPage, BreadcrumbList FAQ 5/5 visible | 12 | 2026-07-12 |
| post-construction-cleaning.html | 46 / Y | 147 | OK | index | OK; tw:card only | 1 | 1690 | LocalBusiness, Service, BreadcrumbList, FAQPage FAQ 9/9 visible | 40 | — |
| post-construction-lp.html | 53 / Y | 145 | OK | noindex | image; tw:card only | 1 | 385 | LocalBusiness  | 0 | **missing** |
| property-maintenance.html | 48 / partial | 150 | OK | index | OK; tw:card only | 1 | 751 | Service, FAQPage, BreadcrumbList FAQ 4/5 visible | 11 | 2026-07-12 |
| property-management.html | 61 / partial | 154 | OK | index | OK; tw:card only | 1 | 1456 | Service, FAQPage FAQ 8/8 visible | 40 | 2026-07-12 |
| property-manager-cleaning-albany-ny.html | 54 / Y | 151 | **WRONG** (tpsprollc.com) | index | og:url≠canonical; tw:card only | 1 | 973 | ProfessionalService, FAQPage FAQ 5/5 visible | 1 | — |
| quote.html | 56 / Y | 146 | OK | index | image; tw:card only | 1 | 461 | LocalBusiness  | 40 | 2026-07-12 |
| real-estate-turnovers.html | 49 / Y | 154 | OK | index | OK; tw:card only | 1 | 418 | Service  | 40 | 2026-07-12 |
| renovation-cleaning.html | 39 / Y | 145 | OK | index | OK; tw:card only | 1 | 958 | LocalBusiness, Service, BreadcrumbList, FAQPage FAQ 1/5 visible | 3 | — |
| renovations-construction.html | 46 / Y | 152 | OK | index | OK; tw:card only | 1 | 1391 | Service, FAQPage FAQ 8/8 visible | 40 | 2026-07-12 |
| saratoga-county.html | 48 / Y | 156 | OK | index | og:url≠canonical; tw:card only | 1 | 619 | LocalBusiness, BreadcrumbList  | 12 | — |
| saratoga-springs.html | 47 / Y | 154 | OK | index | og:url≠canonical; tw:card only | 1 | 568 | LocalBusiness, BreadcrumbList  | 12 | — |
| schenectady-ny.html | 44 / Y | 152 | OK | index | og:url≠canonical; tw:card only | 1 | 564 | LocalBusiness, BreadcrumbList  | 12 | — |
| services.html | 54 / Y | 432 | OK | index | OK; full | 1 | 439 | BreadcrumbList  | 40 | 2026-07-12 |
| student-housing-lp.html | 53 / Y | 141 | OK | noindex | image; tw:card only | 1 | 361 | LocalBusiness  | 0 | **missing** |
| student-turnover-cleaning.html | 45 / Y | 149 | OK | index | og:url≠canonical; tw:card only | 1 | 1965 | LocalBusiness, Service, BreadcrumbList, FAQPage FAQ 8/8 visible | 40 | — |
| thank-you.html | 41 / partial | 137 | OK | noindex | image; tw:card only | 1 | 80 | LocalBusiness  | 0 | **missing** |
| troy-ny.html | 41 / partial | 157 | OK | index | og:url≠canonical; tw:card only | 1 | 530 | LocalBusiness, BreadcrumbList  | 12 | — |

Per-page notes that aren't visible in the table:
- `index.html`: garbled description; no brand in title; 200+ stat; fake reviews; brand client wall to verify; about 3.2 MB of images.
- `about.html`: 755-character description; 200+ stat; fake reviews.
- `services.html`, `faq.html`: garbled descriptions. `faq.html` also has the NYC/NJ/FL claim.
- `quote.html`: star rows on non-reviews.
- `commercial-cleaning-lp.html`: "Since 2022".
- `student-housing-lp.html`: 200+ stat.
- `student-turnover-cleaning.html`: Gmail in schema.
- `property-manager-cleaning-albany-ny.html`: foreign canonical.
- `blog-student-housing-turnover-cleaning-albany.html`: orphan, not in sitemap, Saint Rose.
- The 5 working-tree FAQ pages are clean. Their FAQPage schema matches the visible text, and there's one FAQPage per page.

---

## Appendix A: suggested titles and descriptions

Titles use the pattern `Service + City, NY | TPS Pro`. Only the pages that need a change are listed.

| Page | Suggested `<title>` | Suggested meta description (length) |
|---|---|---|
| index.html | Commercial Cleaning & Property Maintenance Albany, NY \| TPS Pro | Albany's one-contract partner for commercial cleaning, student turnovers & property maintenance. 4.6★ on Google, bonded & insured, 24/7. (518) 948-7156. (153) |
| about.html | About TPS Pro \| Cleaning & Maintenance Company, Albany, NY | Locally owned since 2019, TPS Pro handles cleaning, maintenance & turnovers under one contract across the Capital Region. Bonded & insured. (518) 948-7156. (153) |
| services.html | Cleaning & Property Services Albany, NY \| TPS Pro | Janitorial, student turnovers, post-construction, floor care, maintenance & renovations — every property service under one contract in Albany, NY. (148) |
| faq.html | Cleaning & Maintenance FAQ Albany, NY \| TPS Pro | Answers on pricing, insurance, scheduling & service area for TPS Pro's commercial cleaning and property maintenance in Albany & the Capital Region. (147) |
| albany-ny.html | Cleaning & Property Services Albany, NY \| TPS Pro | (shorten current to ≤155) |
| commercial-cleaning-albany-ny.html | Commercial Cleaning Albany, NY \| TPS Pro | keep |
| janitorial-services.html | Janitorial Services Albany, NY \| TPS Pro | keep |
| office-cleaning.html | Office Cleaning Albany, NY \| TPS Pro | keep |
| property-maintenance.html | Property Maintenance Albany, NY \| TPS Pro | keep |
| property-management.html | Property Management Albany, NY \| TPS Pro | keep |
| troy-ny.html | Commercial Cleaning Troy, NY \| TPS Pro | keep |
| contact.html | Contact TPS Pro \| Cleaning & Maintenance Albany, NY | Call (518) 948-7156 or email bookings@totalpropertysolution.net — TPS Pro answers 24/7 for cleaning, maintenance & turnover quotes across the Capital Region. (151) |
| blog.html | Cleaning & Maintenance Blog Albany, NY \| TPS Pro | keep |
| blog-choose-commercial-cleaning-company-albany.html | How to Choose a Commercial Cleaner in Albany, NY \| TPS Pro | keep |
| blog-how-often-commercial-cleaning.html | Commercial Cleaning Frequency Guide Albany, NY \| TPS Pro | keep |
| blog-post-construction-cleaning-what-to-expect.html | Post-Construction Cleaning Guide Albany, NY \| TPS Pro | keep |
| blog-property-manager-cleaning-guide.html | Property Manager Cleaning Guide Albany, NY \| TPS Pro | keep |
| blog-student-housing-turnover-cleaning-albany.html | Student Housing Turnover Guide Albany, NY \| TPS Pro | Plan your Albany student housing turn: timeline, full scope (clean, repair, paint, common areas) and how one crew handles 800+ units a turn. (143) |
| blog-student-turnover-cost.html | Student Turnover Cleaning Cost Albany, NY \| TPS Pro | keep |
| blog-commercial-cleaning-saratoga.html | Commercial Cleaning Saratoga Springs, NY Guide \| TPS Pro | keep |

## Appendix B: suggested order of work
1. **Day 1 (P0):** delete or replace the fake reviews and quote.html stars; fix the 200+/2022 stats; rewrite the 4 descriptions; switch LEAD_EMAIL, form actions and schema to bookings@; neutralize the red fallback note.
2. **Day 1–2 (P0-5):** deploy the lead Worker, set `TPS_LEAD_ENDPOINT`, redirect to `thank-you.html`, and test on 3 devices.
3. **Week 1 (P1):** fix the property-manager canonical; exclude internal folders; regenerate FAQ schema from visible text on 12 pages; unify the #business entity with GBP `sameAs` and add a visible 4.6★ badge; link the orphan post and rebuild the sitemap with lastmod.
4. **Weeks 2–4 (P1):** image pipeline (WebP, srcset, width/height); city page expansion; price and fact consistency pass; title standardization.
5. **After that (P2):** OG images, blog schema, breadcrumbs, 404 page, contrast tokens, cleanup of unused files.
