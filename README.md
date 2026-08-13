# BuildBio — frontend

Static HTML/CSS/JS frontend for [buildbio.app](https://buildbio.app) ("the Facebook for modified vehicles"), auto-deployed to Vercel on every push to `main`.

**PRE-LAUNCH.** The apex domain is deliberately NOT attached to the Vercel project (hard gate: Pre-Launch MVP Stress Test must pass first). Live preview: `buildbio-mu.vercel.app`.

## Architecture

- ~28 static HTML pages, no framework, no build step, no `package.json`. Inline CSS/JS per page (marketing design system: DM Sans, BB Orange `#E85D2C`, olive `#5C6B3A`).
- One serverless function: `api/v/[pid].js` — the QR resolver. `/v/<8-hex>` (rewrite in `vercel.json`) → rate-limited Supabase RPC `resolve_vehicle_qr_limited` (30/min per hashed IP) → logs the scan → 307 to the vehicle profile. 429 + Retry-After when throttled. Kill-switch env: `BOLO_RESOLVER_KILLSWITCH` (the ONLY env var this project uses).
- Backend: Supabase project `bicmwjtkncjkguumbidq` — see the private `buildbio-supabase` repo (schema cheat-sheet, migrations, 27 edge functions). Pages use the publishable key only; RLS governs all access.
- Membership tiers sitewide: FREE / PLUS / APEX (renamed 2026-08-06 — never reintroduce Mid/Premium).

## CI / governance

- Actions: secret scan + JS syntax on every push. Branch protection on `main`: force-pushes and deletion blocked (2026-08-13).
- Direct pushes to `main` are the solo-founder deploy flow; Vercel builds each push.

## Testing / preview

No test suite yet (pre-launch gap, tracked). Manual preview: open pages locally or `npx serve`, or use the Vercel deployment URL per commit. The Drive folder `10_Website_Pages` is a read-only inspection mirror — never edit there.

## Steward

Claude Code operates this repo per `CLAUDE.md` (same-folder steward file). Operational history: `BuildBio/07_Operations/BB_log.md` in Drive.
