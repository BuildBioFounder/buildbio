# Mobile-First Audit — 2026-08-16

**Standard:** founder-locked 2026-08-16 — MOBILE-FIRST IS THE DESIGN STANDARD (the QR visitor is a phone; desktop adapts from mobile).
**Method:** Playwright headless Chromium, Galaxy-class emulation (touch, 3x DPR, Android UA), viewports **360x800 / 390x844 / 412x915**, all 29 pages rendered live off a local static server with Supabase/GA network calls blocked for determinism. Screenshots at 360px in `docs/mobile-audit-20260816/`. Full raw metrics captured per page per viewport.

## Verdict: 29/29 pages PASS the mechanical bar (post-fix). 5 JUDGMENT flags for Mr. King.

## Baseline findings (pre-fix)

| Check | Result before fixes |
|---|---|
| (a) viewport meta | 29/29 present and correct — no fixes needed |
| (b) horizontal overflow @360px | **0px on all 29 pages** — no fixes needed (the one 170px reading on welcome.html was a redirect-in-flight artifact; 3 controlled re-runs = 0px) |
| (f) base font ≥16px | FAIL on 24 pages (15px marketing base; **14px on vehicle-profile — the QR landing page**) |
| (f) inputs ≥16px | FAIL on 11 form pages (14-15px class rules → Samsung/iOS zoom-jump on focus) |
| (i) responsive images | 7 pages carried one unbounded `hero-img` each |
| (e) tap targets | Buttons mostly fine; nav links ~20px tall; dense inline/footer links widespread (see flags) |
| (g) input types | Correct types in use (email/password/text verified on signup); autocomplete attrs absent (flag 4) |
| (j) tables/mod-lists | Card-based layouts; nothing page-breaks at 360px |
| (l) QR-landing lean load | vehicle-profile static shell is light: inline CSS/JS, Google Fonts + GA the only third-party, images lazy/deferred by data-load — acceptable on cellular |

## Fixes applied (mechanical class, standing auth)

One appended `Mobile-first base` CSS block per page (cascade-last, marker-commented), all 29 pages:
1. `body { font-size: 16px; }` — raises the 15px/14px bases; explicit component sizes unaffected.
2. `input, select, textarea { font-size: 16px !important; }` — the zoom-jump killer; `!important` used deliberately as a floor against per-page class rules (the one legitimate use).
3. `img { max-width: 100%; height: auto; }` — bounds all images; class-level sizing (e.g. QR thumbnails) still overrides.
4. `.btn, .mod-btn, button { min-height: 44px; }` + `.nav-link` vertical padding — 44px touch height on controls and nav.

**Post-fix re-render (all 3 viewports): base font 16px on 29/29, small inputs 0, unbounded images 0, horizontal overflow 0, no layout regressions introduced.**

## JUDGMENT flags — founder decisions, not improvised

1. **Breakpoint architecture is desktop-down.** All 8 media queries sitewide are `max-width`. Safe inversion is a per-page rewrite, not a mechanical swap. Recommendation: new/rewritten pages use `min-width` from a mobile base per the standard; existing pages convert opportunistically as they're edited.
2. **Dense inline link rows** (footers, legal pages: privacy 19 links, terms 18, brands/categories/disciplines grids ~13) sit below 44px height. Inflating them all mechanically would redesign the footer/legal layouts. Options: larger tap spacing, grouped menus, or accept (inline prose links are a conventional exception).
3. **start.html multi-step form**: 15 inputs render 0-width (hidden steps) — automation can't validate hidden steps; needs one manual Galaxy walk-through.
4. **Autocomplete attributes** absent on auth forms (`email`, `current-password`, `new-password`) — small mechanical follow-up, touches form semantics so listed rather than improvised.
5. **Thumb-zone CTA placement** (checklist h) is not machine-checkable — founder eyeball on the Galaxy (folder 10 is refreshed, or the Vercel preview) settles it.

## Canon actions taken with this audit

- Frontend `CLAUDE.md`: MOBILE-FIRST STANDARD section added (checklist = acceptance bar for any new/edited page).
- Drive: `02_Brand_Assets/Style_Guides/BB_brand_mobile-first-standard_v1_20260816.md` created (13.1 sibling check passed — no prior mobile doc).
- **Pre-Launch QA note (founder decision pending, protocol NOT edited):** QA Layer 4 already mandates 375-412px / 44px targets / no h-scroll / 3s LTE. Proposed upgrade: adopt this audit's full 12-point checklist + the 360px floor as Layer 4's bar.
