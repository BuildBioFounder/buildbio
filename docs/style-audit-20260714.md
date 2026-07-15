# Style Cohesion Audit

**Date:** 2026-07-14
**Pages scanned:** 27

## Majority Patterns (Design System Baseline)

| Element | Majority Value | Count |
|---|---|---|
| --orange | #E85D2C | 27/27 (unanimous) |
| --text | #fff | 18/27 |
| --muted | #B4B2A9 | 18/27 |
| Display font | Barlow Condensed | sitewide |
| Body font (majority) | DM Sans, sans-serif | 18/27 pages |
| Body font (auth/form pages) | Barlow, sans-serif | 9/27 pages |
| Nav button (ncta) border-radius | 8px | sitewide |
| Primary CTA (btnl) border-radius | 10px | sitewide |
| Card border-radius | 14px-16px | varies by component |
| Nav position | fixed | 24/27 |
| Nav height | 58px | sitewide |

## Key Findings

1. **Two font systems in use.** Marketing/content pages use DM Sans as body font. Auth/form pages (signup, login, password-reset, welcome, account, vehicle/new, vehicle/mod/new) use Barlow as body font. Both import Barlow Condensed as display font. This is a deliberate split but creates a subtle visual inconsistency.

2. **Two muted-text color systems.** Marketing pages use --muted: #B4B2A9 (warm gray). Auth/form pages use --text-dim: #888 (neutral gray). Same functional role, different values.

3. **--text color split.** Marketing pages: #fff. Auth/form pages: #F0EDE8 (warm off-white). vehicle-profile.html uses #ffffff (functionally identical to #fff).

4. **Nav position inconsistency.** 24 pages use position:fixed. 3 pages (terms.html, privacy.html, affiliate-disclosure.html) use position:sticky. Legal pages intentionally diverge for reading UX.

5. **Button border-radius is not standardized.** Small buttons (ncta): 8px. Large CTAs (btnl): 10px. Form submit buttons: 10px. Both radii appear on most pages. Not a bug per se but worth standardizing if a design system emerges.

6. **No hamburger menu on index.html.** All other marketing pages with a full nav include the hamburger mobile menu. index.html is the only marketing page missing it.

## Deviation Table

| Page | Element | Its Value | Majority Value |
|---|---|---|---|
| account.html | --text | #F0EDE8 | #fff |
| account.html | --muted/--text-dim | #888 | #B4B2A9 |
| account.html | body font-family | Barlow | DM Sans |
| account.html | Google Fonts import | Barlow+Barlow Condensed | DM Sans+Barlow Condensed |
| affiliate-disclosure.html | nav position | sticky | fixed |
| index.html | hamburger menu | missing | present (mobile nav) |
| index.html | card border-radius | 7px / 10px / 14px / 16px | mixed (by component) |
| login.html | --text | #F0EDE8 | #fff |
| login.html | --muted/--text-dim | #888 | #B4B2A9 |
| login.html | body font-family | Barlow | DM Sans |
| login.html | Google Fonts import | Barlow+Barlow Condensed | DM Sans+Barlow Condensed |
| password-reset.html | --text | #F0EDE8 | #fff |
| password-reset.html | --muted/--text-dim | #888 | #B4B2A9 |
| password-reset.html | body font-family | Barlow | DM Sans |
| password-reset.html | Google Fonts import | Barlow+Barlow Condensed | DM Sans+Barlow Condensed |
| password-reset-confirm.html | --text | #F0EDE8 | #fff |
| password-reset-confirm.html | --muted/--text-dim | #888 | #B4B2A9 |
| password-reset-confirm.html | body font-family | Barlow | DM Sans |
| password-reset-confirm.html | Google Fonts import | Barlow+Barlow Condensed | DM Sans+Barlow Condensed |
| privacy.html | nav position | sticky | fixed |
| signup.html | --text | #F0EDE8 | #fff |
| signup.html | --muted/--text-dim | #888 | #B4B2A9 |
| signup.html | body font-family | Barlow | DM Sans |
| signup.html | Google Fonts import | Barlow+Barlow Condensed | DM Sans+Barlow Condensed |
| terms.html | nav position | sticky | fixed |
| vehicle-profile.html | --text | #ffffff | #fff |
| vehicle-profile.html | --muted/--text-dim | not set | #B4B2A9 |
| vehicle/mod/new.html | --text | #F0EDE8 | #fff |
| vehicle/mod/new.html | --muted/--text-dim | #888 | #B4B2A9 |
| vehicle/mod/new.html | body font-family | Barlow | DM Sans |
| vehicle/mod/new.html | Google Fonts import | Barlow+Barlow Condensed | DM Sans+Barlow Condensed |
| vehicle/new.html | --text | #F0EDE8 | #fff |
| vehicle/new.html | --muted/--text-dim | #888 | #B4B2A9 |
| vehicle/new.html | body font-family | Barlow | DM Sans |
| vehicle/new.html | Google Fonts import | Barlow+Barlow Condensed | DM Sans+Barlow Condensed |
| welcome.html | --text | #F0EDE8 | #fff |
| welcome.html | --muted/--text-dim | #888 | #B4B2A9 |
| welcome.html | body font-family | Barlow | DM Sans |
| welcome.html | Google Fonts import | Barlow+Barlow Condensed | DM Sans+Barlow Condensed |

## Summary

- **Total pages:** 27
- **Total deviations:** 39 (unique)
- **Pages with deviations:** 14/27
- **Pages fully consistent with majority:** 13/27
- **Unanimous:** --orange (#E85D2C) is identical across all 27 pages
- **Headline finding:** Two distinct micro-design-systems coexist -- "marketing" (DM Sans, #fff, #B4B2A9) and "auth/form" (Barlow, #F0EDE8, #888). Both are internally consistent. Unifying them is optional but would tighten cross-page coherence.
