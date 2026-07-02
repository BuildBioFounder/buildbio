# CLAUDE.md — BuildBio Repo Steward File

> **Purpose:** This file makes Claude Code (terminal sessions) run the same end-of-session
> steward audit that chat sessions run. It exists because the BuildBio Close Protocol
> historically lived only in Notion and only ran in chat sessions — terminal sessions never
> saw it, which was the root cause of canonical knowledge drift. Claude Code reads this file
> automatically at the start of every session. Read it, follow it.

---

## WHO / WHAT (one-paragraph orientation)

BuildBio = "Facebook for modified vehicles." Founder: Blakeley King ("Mr. King"), solo,
non-technical, bootstrapped, Westlake Village CA, Windows + Samsung only (never assume Apple).
Domain buildbio.app. Tagline "Your Aftermarket Blueprint." This repo is the website frontend
(static HTML/CSS/JS, Vercel-deployed). Backend lives in the separate `buildbio-supabase` repo.

**Canonical source of truth = Notion** (the "🧠 Claude Session Context — Read This First" page
and its children). Google Drive = formal/archive layer. This repo's code is truth for *what is
built*; Notion is truth for *what was decided and why*.

---

## THE BRIGHT LINES (do not cross without explicit founder say-so)

- **HARD GATE:** NOT launched. The Pre-Launch MVP Stress Test (all 5 layers) must pass before
  the domain is connected or real users are invited. Do not connect buildbio.app to Vercel or
  push anything that goes live to real users until that test clears.
- **BB Bucks vs BB Points (load-bearing tax line):** Bucks = elected cash cut of affiliate
  rev-share only (W-9 / 1099 / Stripe Connect). Points = everything else (referrals, events,
  builds, surveys incl. paid brand surveys, rebates, streaks) — **merch-only, never cash, ever.**
  Never write code that lets Points convert to or redeem for cash.
- **Brand colors:** BB Orange `#E85D2C` (action/CTAs/leads), Olive Green `#5C6B3A` (identity).
  `#D85A30` is RETIRED — do not use. Orange always leads action; never equal weight with olive
  in the same moment.
- **Rev-share tiers (authoritative — from 9.4b legal doc):** Starter $0–499=5%, Builder
  $500–1,499=10%, Enthusiast $1,500–3,999=15%, Pro $4,000–7,999=20%, Elite $8,000–14,999=25%,
  Legend $15,000+=30% (of BuildBio's earned commission, not sale price). Rev-share does NOT
  activate until 6 months post-launch — no page may promise day-one earnings.

---

## CLOSE PROTOCOL — RUN AT END OF EVERY SESSION (without being asked)

Trigger phrases: "I'm taking a break" / "I'm done" / "wrap this" / "save and stop".
Fix every fixable issue before closing. Route founder-only tasks into a `## MR. KING'S TASKS` block.

**Step 1 — Session log.** Append a dated one-line summary of this session to the session-log
record (Notion "Read This First" session-log table, or hand the text to Mr. King if no Notion
access from terminal).

**Step 1.5 — Reconcile canonical BODY prose (NOT just the log).** Updating the log captures
*what happened*; it does NOT fix stale *claims* in page bodies. Before closing, verify the prose
of canonical docs still matches reality: tier thresholds (match 9.4b), tool/agent statuses,
build approach, currency model, anything locked this session. Past drift came from "log what
happened" outrunning "rewrite what is now true." Fix the encyclopedia, not just the diary.

**Step 2 — Drive audit.** No stray files in Drive root. Canonical versions current. No active
doc references a retired tool. (Claude Code CAN edit Drive files locally at
`C:\Users\blake\My Drive\BuildBio` — this is the terminal's job, since the chat Drive connector
is create-only.)

**Step 3 — Supabase audit.** Run security advisors; fix ERROR-level now, log WARN. Confirm edge
functions ACTIVE. Pull live counts from the source, never hardcode.

**Step 4 — Cron verification.** Confirm nightly crons ran and are healthy. Flag failures as a
MR. KING'S TASK.

**Step 5 — Cross-session state.** Write a closing `agent_status` row (workstream, action,
end-state summary, open items) so the next session — in ANY surface — sees it first. **This is
how the terminal leaves footprints the chat can read. Write your REASONING here, not just
results — chat can read this row but cannot read this terminal conversation.**

**Step 6 — Consistency check.** Any decision locked this session must be reflected everywhere it
lives (Notion, Drive, code comments). Surface conflicts to Mr. King before closing.

**Step 7 — Session backup.** Create a dated backup entry: what was worked on, what completed,
what is pending, exact next steps.

---

## KNOWN SYSTEM LIMITS (so no session makes false assumptions)

- **Surfaces are stateless and separate.** Chat, Cowork, and Claude Code do not share memory.
  They share artifacts: this repo (GitHub), Supabase, and Notion. Coordinate through those.
- **Chat reads terminal FOOTPRINTS, not REASONING.** When a chat session "checks terminal," it
  reads Supabase/GitHub/agent_status — not this conversation. If you don't write your reasoning
  into a shared system (Step 5), it is lost to every other surface.
- **Chat/Cowork Drive connector is create-only** (cannot edit existing files). Terminal is the
  surface that edits Drive files locally. That division is deliberate — own it.
- **Claude.ai's built-in Drive search tools (google_drive_search / google_drive_fetch) do not
  reliably return .md files** — verified 2026-07-02, they return empty even with exact
  mimeType/name filters, finding only Google-native Docs/Sheets/Slides and folders. Any Drive
  .md lookup from Claude.ai must go through the Google Drive MCP connector
  (search_files + read_file_content/download_file_content) instead. Does not affect Claude Code
  — local filesystem access at C:\Users\blake\My Drive\BuildBio\ is unaffected.

---

## REPO FACTS

- Frontend repo: `BuildBioFounder/buildbio` (this repo) — static HTML, Vercel auto-deploys on
  push to main.
- Backend repo: `BuildBioFounder/buildbio-supabase` (private) — migrations, edge functions
  (generate-qr, catalog-research, status-bridge-daily, etc.).
- Never put a Node project on Google Drive (node_modules breaks Drive sync).
- Supabase project: `bicmwjtkncjkguumbidq` (active).

---

## OPEN HANDOFFS (queued for terminal action — check and clear)

- ~~**Schema naming debt:** DONE 2026-06-18. Migration `20260618180000_bb_rewards_two_currency.sql`
  creates tables with `currency_type` ('points'|'bucks') baked in + balance view split by currency.
  Table RENAME deferred as destructive — needs Mr. King decision.~~
- ~~**Ambassador page rebuild:** DONE 2026-06-18. 6-tier earned ladder + Creator Ambassador /
  Trusted Influencer permanent-FEEL rate floor. 6-month activation notice. #D85A30 purged.~~
- **Pending:** Migration `20260618180000` not yet applied to live Supabase via CLI.
- **Pending:** 24 HTML files still carry retired #D85A30 rgba values — cosmetic pass needed.
- **Pending:** `reviewer_tier_active` view exists in live DB but not in repo migrations.

---

*Keep this file current. When the Close Protocol or a bright line changes in Notion, mirror the
change here in the same session, or the terminal building goes stale again.*
