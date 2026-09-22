# Shared components — the one structure every page carries

**Status:** canonical for the 2026-09-22 cohesion sweep (fable_proposals 11 + 17; ledger 1577).
**Reference page:** `home.html`. `index.html` is the coming-soon vault and is exempt from everything below except tokens, Mobile-first base, and line-setting.
**Founder rule (2026-09-22):** all pages must be identical in formatting and structure — inconsistency confuses the user.

## 0. Head

Every page carries, in `<head>`:

```html
<link rel="icon" type="image/png" sizes="32x32" href="/favicon-32.png">
<link rel="icon" type="image/png" sizes="192x192" href="/favicon-192.png">
<link rel="apple-touch-icon" href="/favicon-192.png">
```

Fonts: only Barlow Condensed 600/700 and DM Sans 400/500 are loaded (Typography Law v2). No Inter in CSS anywhere.

## 1. Tokens (ruling A) — inside `:root`

`--black:#0D0D0D; --dark:#0D0D0D;` — never `#000`, never `#0F0F0F`. `--orange:#E85D2C` (retired orange `#D85A30` / `rgba(216,90,48` must not appear). Body background comes from `var(--black)` or `var(--dark)`, never a literal.

## 2. Nav (rulings B/C) — identical markup on every page

Copy the block from `home.html` lines 249-266 exactly, then set the four `href`s for the page's context:

```html
<nav class="nav">
  <a href="/" class="logo"><span class="BL">B</span><span class="rb">UILD</span><span class="BL2">B</span><span class="rb2">IO</span></a>
  <div class="nav-r">
    <a href="/home.html#how-it-works" class="nl">How it works</a>
    <a href="/home.html#features" class="nl">Features</a>
    <a href="/pricing.html" class="nl">Pricing</a>
    <a href="/login.html" class="nl">Log in</a>
    <a href="/signup.html" class="ncta">Create Your Free Profile</a>
    <div class="ham" onclick="toggleMenu()"><span></span><span></span><span></span></div>
  </div>
</nav>
<div class="mob-menu" id="mobMenu">
  <a href="/home.html#how-it-works">How It Works</a>
  <a href="/home.html#features">Features</a>
  <a href="/pricing.html">Pricing</a>
  <a href="/login.html">Log In</a>
  <a href="/signup.html" class="mob-cta">Create Your Free Profile</a>
</div>
```

- On `home.html` itself the first two links stay `#how-it-works` / `#features` (same page).
- **Signed-in state** (account, vehicle/new, vehicle/mod/new, and vehicle-profile when `isOwner`): the page's script may swap "Log in" → "Account" (`/account.html`) and the CTA → "Sign Out" or "+ Add Vehicle", but the *markup and classes* stay the same. No page invents its own nav classes (`.nav-link`, `.nav-r a`, `b1/b2` logo spans are all retired).
- **Logo `href` is always `/`.** The middleware sends vault-cookie holders to `home.html` and everyone else to the vault. Never `index.html`, never `../index.html`.
- **All internal links carry `.html`.** `vercel.json` has no `cleanUrls`; extensionless `/login` and `/signup` 404 for anyone past the vault.
- The `.ham` becomes `<button type="button" class="ham" aria-label="Menu" aria-expanded="false" onclick="toggleMenu()">` with 44×44 tap size (`padding:11px`); `toggleMenu()` also flips `aria-expanded`. Copy the CSS for `.nav .logo .nav-r .nl .ncta .ham .mob-menu .mob-cta` and the ≤640 px media rules from `home.html` lines 43-48, 210-231 verbatim, adjusting only `.ham{padding:11px}` and `.ham span{width:22px}` so the button measures 44×44.

## 3. Footer (ruling D)

**Marketing pages** (about, ambassadors, brands, categories, community, contact, disciplines, faq, home, how-it-works, mission, pricing, search, shop, start, terms, privacy, affiliate-disclosure): the full footer from `home.html` lines 492-509 verbatim, `.flink` tap height ≥ 44 px on phones (`padding:12px 0` inside the ≤640 rule).

**Auth/app pages** (login, signup, password-reset, password-reset-confirm, welcome, account, vehicle/new, vehicle/mod/new, vehicle-profile, alert, vehicle-status-unavailable): the micro-footer, one line, same tokens:

```html
<footer class="mfoot">
  <span>© 2026 BuildBio</span>
  <a href="/terms.html">Terms</a>
  <a href="/privacy.html">Privacy</a>
</footer>
```
```css
.mfoot{max-width:var(--max,1160px);margin:32px auto 0;padding:18px 28px;border-top:1px solid var(--border);display:flex;gap:18px;flex-wrap:wrap;align-items:center;font-size:12px;color:var(--dim,#6B6B6B)}
.mfoot a{color:var(--muted,#B4B2A9);text-decoration:none;padding:12px 0;display:inline-flex;align-items:center}
.mfoot a:hover{color:var(--text,#fff)}
@media(max-width:640px){.mfoot{padding:16px}}
```
A consent line under a form is not a footer.

## 4. Double-B mark (J5)

Where a page shows the icon mark (login, signup, welcome, password-reset ×2 heroes), it is the locked asset, never CSS-typed letters:

```html
<img src="/images/brand/double-b-192.png" alt="BuildBio" width="64" height="64" class="bbmark">
```
The wordmark elsewhere stays Barlow Condensed text (the nav logo above). Do not re-set the double-B in CSS (ledger 419/1531).

## 5. Type weights (Typography Law v2)

Only Barlow Condensed 600/700 and DM Sans 400/500 exist. Any `font-weight:800` → `700`. Any `strong`, `h3`, badge, table header or label that currently synthesizes DM Sans 600/700 gets an explicit rule: headings/labels that want emphasis switch to `font-family:'Barlow Condensed';font-weight:700` (uppercase, letter-spacing .04em where the page already does that); inline `strong` inside prose becomes `font-weight:500` (DM Sans medium). Add `strong{font-weight:500}` and `h3{font-family:'Barlow Condensed',sans-serif;font-weight:700}` page-level where absent.

## 6. Mobile-first base (cascade-last) — verbatim, last block inside `<style>`

```css
    /* ── Mobile-first base (founder standard 2026-08-16) ──────────────────
       Appended last so it wins the cascade. */
    body { font-size: 16px; }
    input, select, textarea { font-size: 16px !important; }
    img { max-width: 100%; height: auto; }
    .btn, .mod-btn, button, select { min-height: 44px; }
    a.nl, a.flink, .mfoot a { min-height: 44px; display: inline-flex; align-items: center; }
```

## 7. Line-setting (Typography Law §2, ledger 1560) — two layers on every page with prose

1. CSS: `h1,h2,h3,.h1,.eyebrow,.page-title{text-wrap:balance}` and `p,li,.hint,.blurb,.sub,.lead{text-wrap:pretty}`.
2. Script: copy the sentence-opening binder from `index.html` (the `SITE TYPOGRAPHY RULE` IIFE, lines 333 to the end of that script block) verbatim, and pass it the page's prose selectors (`p, li, .hint, .sub, .lead, .qr-hint, .empty-state`). It walks text nodes, so inline markup survives.

## 8. Per-page carry-list (from docs/mobile-audit-20260915.md)

| Page | Must fix |
|---|---|
| how-it-works | N1 overflow: `.detail-grid{grid-template-columns:minmax(0,1fr)}` + `min-width:0` on `.detail-text/.detail-visual` inside the ≤900 rule |
| brands, categories, disciplines, search | hamburger absent and `.nl` hidden ≤640 → no phone nav. Full block from §2 |
| affiliate-disclosure, privacy, terms | `b1/b2` logo, relative `index.html` links, `h3/strong` weights, `body{background:#000}` literal |
| login, signup, welcome, password-reset ×2 | CSS-typed double-B → §4; Barlow 800 → 700; micro-footer; extensionless links |
| account, vehicle/new, vehicle/mod/new, vehicle-profile | micro-footer; `.page-title` 800 → 700; nav classes → §2; `autocomplete`/`inputmode` on inputs (name→`name`, email→`email`, trim/color/nickname→`off`, numeric fields `inputmode="numeric"`) |
| alert, vehicle-status-unavailable | full nav + micro-footer; tokens |
| contact, start | `autocomplete` on name/email/save-form inputs |
| all | tokens #0D0D0D; ham 44×44 `<button>`; favicon links; §6 + §7 |

## 9. What not to touch

Page copy, section order, hero art, forms' logic, Supabase calls, the vault (`index.html`) beyond tokens/§6/§7, `middleware.js`, `api/`. If a page needs a judgment beyond this document, leave a `<!-- SWEEP-JUDGMENT: ... -->` comment at the top of `<body>` and report it.
