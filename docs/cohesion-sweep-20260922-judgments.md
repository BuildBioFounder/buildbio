# Cohesion sweep 2026-09-22 — judgment notes collected from the batch agents

Each note was left as an HTML comment at the top of <body> by the batch agent and stripped here before commit. Rulings by the main session follow each block.

## about.html

SWEEP-JUDGMENT: (1) spec §2's canonical nav block carries the CTA "Create Your Free
     Profile" -> /signup.html; this page previously said "Start Your Build" -> /start.html.
     Took the spec's shared-component wording; in-body CTAs left as page copy (§9).
     (2) spec §3 says "footer verbatim from home.html", but home's first two footer links
     are same-page anchors; retargeted to /home.html#... to match the §2 nav rule.

## account.html

SWEEP-JUDGMENT: shared-components §2 fixes the mobile-menu slots as Log In + "Create Your Free Profile". At <=640px .nl and .ncta are hidden, so the signed-in slots would be unreachable on a phone. The nav-r signed-in occupants are mirrored into the mobile menu with -m id twins; the page script updates both.

SWEEP-JUDGMENT: home.html's nav CSS, copied verbatim per §2, is position:fixed (this page's was sticky). body gets padding-top:58px so nothing sits under the bar.

SWEEP-JUDGMENT: §3's .mfoot uses var(--max,1160px); this page's content column is narrower, so --max is set to the page's own content width so the footer rule lines up with the content.

## affiliate-disclosure.html

SWEEP-JUDGMENT: spec §3 says "footer verbatim from home.html", but home's first two
     footer links are same-page anchors (#how-it-works / #features). Retargeted to
     /home.html#... to match the §2 nav rule, since bare anchors are dead off-home.

## alert.html

SWEEP-JUDGMENT: shared-components §2 fixes the mobile-menu slots as Log In + "Create Your Free Profile". At <=640px .nl and .ncta are hidden, so the signed-in slots would be unreachable on a phone. The nav-r signed-in occupants are mirrored into the mobile menu with -m id twins; the page script updates both.

SWEEP-JUDGMENT: the nav CTA on this QR-landing page was "Start Your Build" -> /start.html. §2 prescribes the canonical "Create Your Free Profile" -> /signup.html, so that was taken. The page's own sticky bar still reads "Start Your Build".

SWEEP-JUDGMENT: home.html's nav CSS, copied verbatim per §2, is position:fixed (this page's was sticky). body gets padding-top:58px so nothing sits under the bar.

SWEEP-JUDGMENT: the §7 sentence binder runs once at parse time. This page renders its body from Supabase afterwards, so prose inside #content is not bound. Spec does not say whether the binder should be re-run after a dynamic render.

SWEEP-JUDGMENT: §3's .mfoot uses var(--max,1160px); this page's content column is narrower, so --max is set to the page's own content width so the footer rule lines up with the content.

## ambassadors.html

SWEEP-JUDGMENT: spec §3 says copy home.html's footer "verbatim", but home's
     footer links are same-page anchors (#how-it-works / #features / #pricing)
     that go nowhere on a sub-page. Resolved the three the same way §2 resolves
     them for the nav: /home.html#how-it-works, /home.html#features,
     /pricing.html. Structure is verbatim; only those hrefs are contextual.

## brands.html

SWEEP-JUDGMENT: the canonical §2 nav replaced this page's browse nav set
     (Brands / Categories / Disciplines / Search). The spec mandates identical
     nav markup and link text sitewide, so the browse cross-links no longer
     appear in the nav on brands / categories / disciplines, and the home.html
     footer (§3, verbatim) does not carry them either. search.html still offers
     all three as "Browse …" links in its initial and empty states. Founder
     decision needed: add a browse row to the shared footer, or accept that
     directory pages are reached from search / category cards only.

## categories.html

SWEEP-JUDGMENT: the canonical §2 nav replaced this page's browse nav set
     (Brands / Categories / Disciplines / Search). The spec mandates identical
     nav markup and link text sitewide, so the browse cross-links no longer
     appear in the nav on brands / categories / disciplines, and the home.html
     footer (§3, verbatim) does not carry them either. search.html still offers
     all three as "Browse …" links in its initial and empty states. Founder
     decision needed: add a browse row to the shared footer, or accept that
     directory pages are reached from search / category cards only.

## community.html

SWEEP-JUDGMENT: §2 settles mobile-audit J2 in favour of home's nav CTA, so
     the nav/mobile-menu CTA changed from "Start Your Build" (/start.html) to
     "Create Your Free Profile" (/signup.html). The in-page body CTAs still read
     "Start Your Build" and still point at /start.html — those are page copy,
     which §9 puts out of scope. Founder decision: leave the two worded
     differently, or align the body CTAs in a copy pass.

## contact.html

SWEEP-JUDGMENT: (1) spec §2's canonical nav block carries the CTA "Create Your Free
     Profile" -> /signup.html; this page previously said "Start Your Build" -> /start.html.
     Took the spec's shared-component wording; in-body CTAs left as page copy (§9).
     (2) spec §3 says "footer verbatim from home.html", but home's first two footer links
     are same-page anchors; retargeted to /home.html#... to match the §2 nav rule.

## disciplines.html

SWEEP-JUDGMENT: the canonical §2 nav replaced this page's browse nav set
     (Brands / Categories / Disciplines / Search). The spec mandates identical
     nav markup and link text sitewide, so the browse cross-links no longer
     appear in the nav on brands / categories / disciplines, and the home.html
     footer (§3, verbatim) does not carry them either. search.html still offers
     all three as "Browse …" links in its initial and empty states. Founder
     decision needed: add a browse row to the shared footer, or accept that
     directory pages are reached from search / category cards only.

## faq.html

SWEEP-JUDGMENT: §2 settles mobile-audit J2 in favour of home's nav CTA, so
     the nav/mobile-menu CTA changed from "Start Your Build" (/start.html) to
     "Create Your Free Profile" (/signup.html). The in-page CTA buttons still
     read "Start Your Build" and still point at /start.html — page copy, which
     §9 puts out of scope. Founder decision: leave them worded differently, or
     align the body CTAs in a copy pass.

## how-it-works.html

SWEEP-JUDGMENT: spec §3 says copy home.html's footer "verbatim", but home's
     footer links are same-page anchors (#how-it-works / #features / #pricing)
     that go nowhere on a sub-page. Resolved the three the same way §2 resolves
     them for the nav: /home.html#how-it-works, /home.html#features,
     /pricing.html. Structure is verbatim; only those hrefs are contextual.

## login.html

SWEEP-JUDGMENT: the canonical nav is position:fixed 58px tall, but this page's .page is a full-viewport grid with no nav of its own before the sweep. Added padding-top:58px to .page (border-box, so min-height:100vh still fits) rather than restyling the layout. Same treatment on signup/welcome/password-reset ×2.

SWEEP-JUDGMENT: the in-card brand lockup used class="logo", which collides with the nav's .logo. Renamed the card lockup to .brand-lockup and scoped the nav rules as .nav .logo. No script referenced either class.

## mission.html

SWEEP-JUDGMENT: (1) spec §2's canonical nav block carries the CTA "Create Your Free
     Profile" -> /signup.html; this page previously said "Start Your Build" -> /start.html.
     Took the spec's shared-component wording; in-body CTAs left as page copy (§9).
     (2) spec §3 says "footer verbatim from home.html", but home's first two footer links
     are same-page anchors; retargeted to /home.html#... to match the §2 nav rule.

## password-reset.html

SWEEP-JUDGMENT: the canonical nav is position:fixed 58px tall and this page had no nav before the sweep. Changed .page padding from 40px 20px to 98px 20px 40px so the centred card clears it.

SWEEP-JUDGMENT: the in-card brand lockup used class="logo", which collides with the nav's .logo. Renamed the card lockup to .brand-lockup and scoped the nav rules as .nav .logo. No script referenced either class.

## password-reset-confirm.html

SWEEP-JUDGMENT: the canonical nav is position:fixed 58px tall and this page had no nav before the sweep. Changed .page padding from 40px 20px to 98px 20px 40px so the centred card clears it.

SWEEP-JUDGMENT: the in-card brand lockup used class="logo", which collides with the nav's .logo. Renamed the card lockup to .brand-lockup and scoped the nav rules as .nav .logo. No script referenced either class.

## pricing.html

SWEEP-JUDGMENT: spec §3 says copy home.html's footer "verbatim", but home's
     footer links are same-page anchors (#how-it-works / #features / #pricing)
     that go nowhere on a sub-page. Resolved the three the same way §2 resolves
     them for the nav: /home.html#how-it-works, /home.html#features,
     /pricing.html. Structure is verbatim; only those hrefs are contextual.

## privacy.html

SWEEP-JUDGMENT: spec §3 says "footer verbatim from home.html", but home's first two
     footer links are same-page anchors (#how-it-works / #features). Retargeted to
     /home.html#... to match the §2 nav rule, since bare anchors are dead off-home.

## search.html

SWEEP-JUDGMENT: (1) the canonical §2 nav replaced this page's browse nav
     set (Brands / Categories / Disciplines / Search); the spec mandates
     identical nav markup and link text sitewide. This page keeps all three as
     "Browse …" links in its initial and empty states, but brands / categories /
     disciplines now have no browse cross-links at all. Founder decision: add a
     browse row to the shared footer, or accept it. (2) The spec did not name an
     h1 for this page; "Search" was added above the form in the page's existing
     Barlow Condensed 700 uppercase heading style, matching the <title>.

## shop.html

SWEEP-JUDGMENT: spec §3 says copy home.html's footer "verbatim", but home's
     footer links are same-page anchors (#how-it-works / #features / #pricing)
     that go nowhere on a sub-page. Resolved the three the same way §2 resolves
     them for the nav: /home.html#how-it-works, /home.html#features,
     /pricing.html. Structure is verbatim; only those hrefs are contextual.

## signup.html

SWEEP-JUDGMENT: the canonical nav is position:fixed 58px tall and this page had no nav before the sweep. Added padding-top:58px to the full-viewport .page grid (border-box, so min-height:100vh still fits) rather than restyling the layout.

SWEEP-JUDGMENT: the in-card brand lockup used class="logo", which collides with the nav's .logo. Renamed the card lockup to .brand-lockup and scoped the nav rules as .nav .logo. No script referenced either class.

## start.html

SWEEP-JUDGMENT: spec §3 says copy home.html's footer "verbatim", but home's
     footer links are same-page anchors (#how-it-works / #features / #pricing)
     that go nowhere on a sub-page. Resolved the three the same way §2 resolves
     them for the nav: /home.html#how-it-works, /home.html#features,
     /pricing.html. Structure is verbatim; only those hrefs are contextual.

SWEEP-JUDGMENT: §8 asks for autocomplete on the save-form inputs but names
     only name -> "name" and email -> "email". This form has no name field; it
     has email / username / password, so: email -> "email", username ->
     "username", password -> "new-password" (account creation, not sign-in).

## terms.html

SWEEP-JUDGMENT: spec §3 says "footer verbatim from home.html", but home's first two
     footer links are same-page anchors (#how-it-works / #features). Retargeted to
     /home.html#... to match the §2 nav rule, since bare anchors are dead off-home.

## vehicle-profile.html

SWEEP-JUDGMENT: shared-components §2 fixes the mobile-menu slots as Log In + "Create Your Free Profile". At <=640px .nl and .ncta are hidden, so the signed-in slots would be unreachable on a phone. The nav-r signed-in occupants are mirrored into the mobile menu with -m id twins; the page script updates both.

SWEEP-JUDGMENT: the nav CTA on this QR-landing page was "Start Your Build" -> /start.html. §2 prescribes the canonical "Create Your Free Profile" -> /signup.html, so that was taken. The page's own sticky bar still reads "Start Your Build".

SWEEP-JUDGMENT: home.html's nav CSS, copied verbatim per §2, is position:fixed (this page's was sticky). body gets padding-top:58px so nothing sits under the bar.

SWEEP-JUDGMENT: the §7 sentence binder runs once at parse time. This page renders its body from Supabase afterwards, so prose inside #content is not bound. Spec does not say whether the binder should be re-run after a dynamic render.

## vehicle-status-unavailable.html

SWEEP-JUDGMENT: §3's .mfoot uses var(--max,1160px); this page's content column is narrower, so --max is set to the page's own content width so the footer rule lines up with the content.

## welcome.html

SWEEP-JUDGMENT: the canonical nav is position:fixed 58px tall and this page had no nav before the sweep. Changed .page padding from 40px 20px to 98px 20px 40px so the centred card clears it.

SWEEP-JUDGMENT: the in-card brand lockup used class="logo", which collides with the nav's .logo. Renamed the card lockup to .brand-lockup and scoped the nav rules as .nav .logo. No script referenced either class.

## vehicle/new.html

SWEEP-JUDGMENT: shared-components §2 fixes the mobile-menu slots as Log In + "Create Your Free Profile". At <=640px .nl and .ncta are hidden, so the signed-in slots would be unreachable on a phone. The nav-r signed-in occupants are mirrored into the mobile menu with -m id twins; the page script updates both.

SWEEP-JUDGMENT: this page previously carried only an Account link. §2 says a signed-in CTA is "Sign Out" or "+ Add Vehicle", so a Sign Out CTA plus a sb.auth.signOut() handler was added to make the nav identical to account.html.

SWEEP-JUDGMENT: home.html's nav CSS, copied verbatim per §2, is position:fixed (this page's was sticky). body gets padding-top:58px so nothing sits under the bar.

SWEEP-JUDGMENT: §3's .mfoot uses var(--max,1160px); this page's content column is narrower, so --max is set to the page's own content width so the footer rule lines up with the content.

## vehicle/mod/new.html

SWEEP-JUDGMENT: shared-components §2 fixes the mobile-menu slots as Log In + "Create Your Free Profile". At <=640px .nl and .ncta are hidden, so the signed-in slots would be unreachable on a phone. The nav-r signed-in occupants are mirrored into the mobile menu with -m id twins; the page script updates both.

SWEEP-JUDGMENT: this page previously carried only an Account link. §2 says a signed-in CTA is "Sign Out" or "+ Add Vehicle", so a Sign Out CTA plus a sb.auth.signOut() handler was added to make the nav identical to account.html.

SWEEP-JUDGMENT: home.html's nav CSS, copied verbatim per §2, is position:fixed (this page's was sticky). body gets padding-top:58px so nothing sits under the bar.

SWEEP-JUDGMENT: the 8 inputs here are all free text or a date picker - there is no price/number field on this page - so all 8 took autocomplete="off" and no inputmode applies.

SWEEP-JUDGMENT: §3's .mfoot uses var(--max,1160px); this page's content column is narrower, so --max is set to the page's own content width so the footer rule lines up with the content.

## Main-session rulings on the notes above (2026-09-22)

- **Browse links displaced by the canonical nav** (batch D): ruled — the shared footer gains a Browse row (Brands / Categories / Disciplines / Search) on all 17 full-footer pages. Applied.
- **Footer "How it works" / "Features" anchors**: "How it works" points at the real page `/how-it-works.html` sitewide (73 links retargeted); "Features" stays `/home.html#features`; home keeps its own in-page anchors. Applied.
- **Nav CTA on QR-landing pages changed from "Start Your Build" to "Create Your Free Profile"** (batch B): accepted — identical structure was the founder's instruction (ledger 1577). The sticky bar's "Start Your Build" is page copy and stays. Conversion-path effect is to be read from the first tester sessions.
- **In-body "Start Your Build" CTAs** on how-it-works / pricing / about / mission / contact: page copy, untouched — a copy pass can align them later.
- **Fixed nav over centered auth layouts, `.logo` class collision, mobile-menu signed-in twins, Sign Out added to vehicle pages, `body{padding-top:58px}`, `--max` per page**: all accepted as implemented.
- **Dynamic prose not typeset post-render** (vehicle-profile, alert): fixed — the binder is exposed as `window.bbTypeset(root)` and re-run after `#content` renders.
- **`.ham` height from the §6 block**: accepted; the two rules ship together on every page.
- **Binder chain bug (found in the render check, not by any batch)**: back-to-back short sentences chained their NBSP bindings into one unbreakable run (mission.html, 337px). Fixed in the binder itself — a binding never crosses a sentence end — and propagated to all 30 copies.
- **Verification**: `bb-qa-rig/static-verify-20260922.js` (static rules) + `bb-qa-rig/sweep-check-20260922.js` (Playwright, 3 widths): 30/30 pages clean.
