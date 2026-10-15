# Mobile-First + Cohesion Audit — 2026-10-15 (weekly page-qa sweep)

**Run:** Fable daily task `page-qa-sweep`, `fable_daily_runs` id 149. **Prior:** `docs/mobile-audit-20261006.md`.
**Scope rule:** REPORT ONLY. No code fixes applied. The founder-led page-editing workstream applies fixes.
**Method: carry-forward + spot-check render.** Since the 10-06 full render, no page, CSS or JS file has changed. The newest commit is still `f1667fa` (09-24), there are no tracked working-tree changes, and no `*.html/css/js` file is newer than 2026-10-06. A full 30-page fan-out would have re-rendered identical bytes. Instead, 1 `page-qa` subagent rendered 5 representative pages at 360 / 390 / 412 px to confirm the renderer, harness and external dependencies (Google Fonts, the supabase-js CDN) behave the same. The 5 pages: home (drift reference), index (vault), account (gated), search, vehicle/mod/new (gated). The other 25 pages keep their 10-06 verdicts, valid because their files are byte-identical. Page count is 30 on disk; the brief says 29, and `.claude/worktrees` is excluded.

## Headline

- **30 pages: 18 PASS / 4 JUDGMENT-only / 8 MECHANICAL. Same as 10-06. No regressions, nothing new.**
- **All 5 spot-checked pages match 10-06 at all 3 widths:**
  - overflow 0, body 16 px, inputs at least 16 px
  - `#0D0D0D` / `#E85D2C`, no retired orange, no Inter
  - only Barlow Condensed 600/700 and DM Sans 400/500
  - Mobile-first base block and both line-setting layers present
  - hamburger 44x44 and working
  - Google Fonts and the jsdelivr supabase-js CDN both returned 200
- **H1 (harness) RESOLVED.** The runner now blocks only the `*.supabase.co` API (`C:\Users\blake\dev\bb-qa-rig\tmp\pageqa-one-cdn.js`). supabase-js loads, and all 5 pages showed 0 JS errors.
- **New harness note (H2):** with the CDN unblocked, gated pages (account, vehicle/*) correctly redirect to `login.html` when there is no session. To measure them, the rig needs a fake localStorage session (and `vehicle/mod/new` needs `?vehicle=<id>`). The spot-check used throwaway scripts in `%LOCALAPPDATA%\Temp\wk1015\`. Fold this into the rig. Also, the `mobileaudit-tools` path in the agent brief no longer exists.

## Per-page table

The 5 spot-checked pages were re-measured this run. The other 25 carry forward from 10-06 with unchanged files.

| Page | Verdict | Mechanical | Judgment | Basis |
|---|---|---|---|---|
| about | PASS | — | — | carry |
| account | MECH | no `autocomplete` on 7 fields (f-first `given-name`, f-last `family-name`, f-city `address-level2`, f-state `address-level1`, f-ig/f-yt/f-tt `off`). Sign Out `#btn-logout` / `#btn-logout-m` have no href | — | **rendered** (fake session) |
| affiliate-disclosure | JUDGMENT | — | inline prose links 39-43 px tall. Inline-link exemption? | carry |
| alert | PASS | — | — | carry |
| ambassadors | PASS | — | — | carry |
| brands | PASS | — | data cards not rendered (API blocked by design) | carry |
| categories | PASS | — | same as brands | carry |
| community | PASS | — | — | carry |
| contact | MECH | info-card mailto 148x18. `.info-value a{display:inline-block;padding:13px 0}` | — | carry |
| disciplines | PASS | — | same as brands | carry |
| faq | MECH | `.faq-icon` "+" DM Sans 700 (L51). Use 500 | — | carry |
| home | JUDGMENT | — | L412 inline `background:#000` bypasses the token. Sample-profile links L287/L375/L510 have no `?id`. Footer outlier (J1) | **rendered** |
| how-it-works | PASS | — | — | carry |
| index | MECH | vault footer Terms 31x14 / Privacy 37x14 (L334). Needs a 44 px tap box | no nav/footer/h1 by design (vault) | **rendered** |
| login | PASS | — | — | carry |
| mission | PASS | — | — | carry |
| password-reset-confirm | PASS | — | — | carry |
| password-reset | PASS | — | "Sign in" 42x44 (C1 class) | carry |
| pricing | MECH | stale "matches index.html" comments (L45, L189), cosmetic only | — | carry |
| privacy | JUDGMENT | — | 5 inline `privacy@` mailto links are 43 px tall. Inline-link exemption? | carry |
| search | MECH | `.initial-link` chips 133x43 / 156x43. Add `min-height:44px` (L115) | no guard if supabase-js fails to load | **rendered** |
| shop | PASS | — | — | carry |
| signup | PASS | — | no guard if supabase-js fails to load | carry |
| start | PASS | — | `window.toggleMenu` sits inside an IIFE | carry |
| terms | JUDGMENT | — | 4 inline prose links are 43 px tall. Inline-link exemption? | carry |
| vehicle-profile | PASS | — | — | carry |
| vehicle-status-unavailable | PASS | — | — | carry |
| welcome | PASS | — | — | carry |
| vehicle/new | MECH | Sign Out `#btn-logout` / `#btn-logout-m` have no href. Add `href="#"` + `preventDefault`, or `role="button" tabindex="0"` | — | carry |
| vehicle/mod/new | MECH | `#cat-search` 40 px tall. `#brand-search` is hidden until a category is picked. Add `min-height:44px`. Same Sign Out fix as vehicle/new | — | **rendered** (fake session, `?vehicle=qa-test`) |

## Cross-page

- **C1 (MECH, shared fix, open since 09-24).** Full-footer `.flink` links are 31-44 px wide. home measures Pricing 41, Shop 31, Terms 36. Micro-footer links are 34 / 40 px wide. Fix: `min-width:44px` on `.flink` and `.mfoot a`.
- **J1 (JUDGMENT): footer canon.** home.html has 10 footer links. 17 other marketing pages have 14. home is the outlier.
- **J2 (doc drift).** `docs/shared-components-20260922.md` lists nav "How it works" → `/home.html#how-it-works`. Pages use `/how-it-works.html`.
- **J3 (tooling).** The page-qa agent brief still names index.html as the drift reference. It should be home.html.
- **H1 (tooling).** RESOLVED this run (see Headline).
- **H2 (tooling, new).** Fake-session support for gated pages belongs in the rig. The brief's `mobileaudit-tools` path is stale.
- **False positive.** static-verify flags `ctaLabel` on account and vehicle/mod/new. Same as 09-24; not a defect.

## Ageing

These mechanical items have now carried through 3 sweeps unchanged (09-24, 10-06, 10-15):
- account `autocomplete`
- Sign Out with no href (account, vehicle/new, vehicle/mod/new)
- C1

The site has had no commits since 09-24, so the page-editing workstream has not been active.

## Harness note H3 (added 2026-10-15 after the live stress test): production headers are part of page QA

- **Finding:** 14 app pages (signup, login, account, welcome, vehicle/new, vehicle/mod/new, search, brands, categories, disciplines, vehicle-profile, alert, password-reset, password-reset-confirm) were dead in production with `supabase is not defined`. The `vercel.json` CSP allows `script-src 'self'` plus Google only, so the `https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2` load was blocked on every one of them. Every local render passed because the local server (`serve-repo.js` on :3111) sends no Vercel headers.
- **Fix:** supabase-js is vendored same-origin at `/assets/js/supabase.js` (UMD build, 2.117.3). The CSP is unchanged and stays tight; do not add CDNs to `script-src` to solve this class of problem.
- **Rule from here:** a page is not PASS until it has also been loaded from the deployed URL (`https://buildbio.app` or `https://buildbio-mu.vercel.app`) with the console checked for CSP violations and reference errors. Local renders catch layout; only the live URL catches headers. The rig's CDN-allow note in H1 is obsolete: there is no CDN script left to allow.
