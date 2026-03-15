# CLAUDE.md — TheHindsightHit Client

This file is the single source of truth for Claude Code sessions on this repo.
Read it before starting any work. Update it before every push (see **Keeping This File Current**).

---

## Project Overview

React frontend for **The Hindsight Hit** — an FPL analytics tool that shows
managers which players they _could_ have transferred in instead of the ones
they actually picked, judged by points scored that gameweek within the same
budget.

- **Framework:** Create React App (react-scripts 5)
- **Styling:** Tailwind CSS v3 (via CRACO), dark slate/emerald palette
- **Backend:** Railway (API base URL: `https://thehindsighthit-server-production.up.railway.app`)
- **Data grid:** `@mui/x-data-grid` v7 (themed via CSS class overrides — `@mui/material` is NOT installed)
- **Routing:** React Router v6
- **Icons:** lucide-react
- **Testing:** Jest + React Testing Library (built into CRA)
- **Deployment:** Netlify (`netlify.toml` present; SPA redirect rule configured)

---

## Architecture

```
src/
├── App.js                  # Root: fetches all shared data, owns context providers
├── index.js                # Entry point; wraps app in ErrorBoundary + BrowserRouter
├── services/
│   ├── context.js          # PlayerContext, SelectedGWContext, ManagerContext
│   ├── useGameweeks.js
│   ├── useAllPlayers.js
│   ├── useMgrData.js
│   ├── useGWPlayerStats.js
│   ├── useTransfers.js
│   ├── useGWHistory.js
│   ├── useGWLiveStats.js              # Fetches all-player stats per GW; in-memory cache via useRef
│   ├── useHistoricalPrices.js         # Fetches per-GW historical prices; in-memory cache via useRef
│   ├── useFixtures.js
│   └── useTeams.js
├── utils/
│   └── findAlternatives.js # Pure function: core "hindsight" logic — unit tested
├── Components/
│   ├── Header.jsx
│   ├── Nav.jsx             # Mobile burger + desktop nav; active link in emerald
│   ├── Logo.jsx
│   └── ErrorBoundary.jsx
├── HomePage.jsx
├── ManagerProfile.jsx
├── GWHistory.jsx
├── Transfers.jsx           # Key page; Show Alternatives bottom-sheet modal
└── Fixtures.jsx
```

### Key data flow

1. `App.js` fetches gameweeks, allPlayers, mgrData, gwPlayerStats, transfers,
   and gwHistory.
2. `neededGWIds` = union of transfer GW IDs and gwHistory GW IDs (typically ≤38).
   `useGWLiveStats(neededGWIds)` fires one request per GW (replaces ~750 per-player calls).
   `useHistoricalPrices(neededGWIds)` fetches accurate per-GW prices from the backend.
3. `uniquePlayerHistories` is built in a `useMemo` from `gwLiveStats` + `historicalPrices`,
   preserving the existing `Array<Array<{element, round, total_points, value, minutes, goals_scored}>>`
   shape. `value` uses historical price when available, falling back to `now_cost`.
4. `Transfers.jsx` reads from context; `findAlternatives` runs in a `useEffect`
   when both `myTransfers` and `uniquePlayerHistories` are populated.
5. `GWHistory.jsx` filters `uniquePlayerHistories` down to `myPlayerIds` via
   `useMemo` — no additional fetches.
6. All hooks expose `{ ..., error }`. App.js aggregates errors and shows a
   full-page error banner when any critical data fails to load.

**Never** call `useGWLiveStats` inside a page component — it must live in `App.js`
to prevent duplicate fetches and the infinite re-render loop.

---

## Environment

| Variable | Purpose |
|---|---|
| `REACT_APP_API_URL` | Base URL for the backend API (no trailing slash) |

Copy `.env.example` to `.env.local` before running locally.

---

## Running Locally

```bash
npm install
cp .env.example .env.local   # fill in REACT_APP_API_URL
npm start                    # http://localhost:3000
npm test                     # run all tests
npm run build                # production build
```

---

## Testing

```bash
npm test
```

Test files live next to the code they test:

| File | What it covers |
|---|---|
| `src/utils/findAlternatives.test.js` | Core alternatives logic — most thorough |
| `src/services/useGWLiveStats.test.js` | Fetch, cache, error handling for GW live stats |
| `src/services/useHistoricalPrices.test.js` | Fetch, cache, error handling for historical prices |
| `src/Transfers.test.jsx` | Full integration: modal open/close, correct alternatives |
| `src/App.test.js` | Smoke test: renders without crashing |

When adding a new service hook, add a corresponding `.test.js` next to it.

---

## Keeping This File Current

At the end of every session, before pushing, Claude must update this file:

1. **Append** a bullet to `## Key History / What Was Done` summarising what changed.
2. **Replace** the `## What's Next` section with an accurate list of remaining/new tasks, including today's date.
3. **Commit** the updated `CLAUDE.md` together with (or immediately after) the work commits — never leave it out of date.

---

## Git Commit Guidelines

- Write clear, descriptive commit messages (imperative mood, present tense).
- Always push to the designated feature branch (`claude/...`); never push directly to `master`.
- Do not use `--no-verify` or skip hooks.
- Group related changes in a single commit; don't commit half-finished work.
- Do not include Claude session URLs in commit messages.

## Pull Request Guidelines

- **Always open a PR** when a feature branch is ready to merge — never merge directly.
- Write the PR description in **Markdown**.
- The description must cover at minimum:
  - **What changed** — a concise summary of the work done.
  - **Why** — the problem being solved or feature being added.
  - **How to test** — steps a reviewer can follow to verify the change works.
- Keep the PR title short and in imperative mood (e.g. `Fix GW dropdown not updating fixtures`).
- Reference any related issues or prior PRs where relevant.

---

## Key History / What Was Done

- **Initial build:** Basic CRA scaffold; custom hooks for FPL API endpoints; Tailwind + CRACO config; NavBar component extracted.
- **EC2 / hardcoded IP era:** API base URL was hardcoded to an EC2 IP address in every hook.
- **2026-03-10 — Session 3 (claude/gather-context-oyUrc):**
  - **Root cause analysis:** diagnosed that `usePlayerHistories(allPlayerIds)` was firing ~750 individual API calls on every load, causing rate-limit hits and extremely slow alternatives loading. The backend was proxying each call to FPL individually.
  - **Fix — `useGWLiveStats`:** new hook fetches `/api/gw-live-stats/{gwId}` (one call per gameweek) instead of one call per player. In-memory cache (keyed by GW ID) prevents re-fetching. Requires the server to expose `GET /api/gw-live-stats/:gwId` backed by FPL's `/event/{gw}/live/` endpoint.
  - **App.js refactor:** replaced `usePlayerHistories(allPlayerIds)` + `useManageUniquePlayerHistories` with `useGWLiveStats(neededGWIds)` where `neededGWIds` = union of transfer GWs + history GWs (≤38 calls vs ~750). `uniquePlayerHistories` rebuilt in a `useMemo` preserving the existing consumer interface. `value` field approximated with `now_cost` from allPlayers.
  - Added `useGWLiveStats.test.js` (fetch, cache, error, re-render stability).
  - `usePlayerHistories` and `useManageUniquePlayerHistories` are now dead code (not deleted yet).
- **2026-03-10 — Session 2 (claude/fix-frontend-layout-pUgsn):**
  - **Manager Profile:** widened layout to `max-w-5xl`; split Starting XI vs Bench using `squadPosition` from gwPlayerStats; added clickable player cards that open a profile modal (position, full name, jersey #, total points, price, team name).
  - **App.js GW bug fix:** `useGWPlayerStats` now always uses `currentGW?.id` (not `selectedGW`), so changing the GW History dropdown no longer mutates the Manager Profile squad. `myPlayers` enriched with `squadPosition` + `multiplier` from gwPlayerStats.
  - **Fixtures:** rebuilt with GW dropdown (defaults to current GW), team IDs resolved to names via static `FPL_TEAMS` map in `src/utils/teams.js` (2024/25 season). Subsequently replaced with live `/api/teams` call via `useTeams` hook; `teams` passed through `PlayerContext`.
  - **Transfers:** replaced MUI DataGrid entirely with a card-based layout — GW badge, In/Out player names with costs, full-width "Show N Alternatives" button. Added GW filter dropdown. Alternatives now sorted by points descending. Fixes all mobile truncation issues.
  - Updated `Transfers.test.jsx` to match new UI (removed DataGrid mock, updated button text patterns and modal heading assertions).
- **2026-03-09 — Session 1 (claude/fix-api-url-loops-FjN3O):**
  - Replaced all hardcoded EC2 IP addresses with `REACT_APP_API_URL` env var across all 9 service hooks.
  - Added `netlify.toml` with SPA redirect rule (`/* → /index.html 200`).
  - Added missing `lucide-react` dependency.
  - Fixed ESLint errors blocking the Netlify build.
  - Fixed 10 critical code quality issues: `res.ok` checks in all hooks, null-pointer crash in `Transfers`, stale `console.log` cleanup, wrong state initialisation types, deprecated MUI `pageSize` prop, semantic `<button>` elements, `ErrorBoundary` added, broken test fixed.
  - Fixed infinite re-render loop: hoisted `usePlayerHistories` to `App.js` with memoized `allPlayerIds`; distributed `uniquePlayerHistories` via `PlayerContext`; removed duplicate hook calls from `GWHistory` and `Transfers`.
  - Implemented **Show Alternatives** feature: `findAlternatives` extracted to `src/utils/findAlternatives.js` (pure function); `Transfers.jsx` wired up; bottom-sheet modal displays better players by pts/price using already-loaded context data — zero additional API calls.
  - Added full test suite: `findAlternatives.test.js` (18 cases), `usePlayerHistories.test.js`, `useManageUniquePlayerHistories.test.js`, `transferColumnDef.test.js`, `Transfers.test.jsx` (integration).
  - MVP UI refresh: dark slate/emerald design system across all pages; mobile-first Tailwind layout; MUI DataGrid dark-themed via CSS overrides; loading spinner; bottom-sheet modal; colour-coded Show Alternatives button (green = alternatives exist).
- **2026-03-15 — Session 4 (claude/review-claude-md-TziqO):**
  - **Dead code cleanup:** deleted `usePlayerHistories.js`, `useManageUniquePlayerHistories.js`, `useAllData.js`, `transferColumnDef.js`, `src/utils/teams.js`, and their test files (8 files total, 543 lines removed).
  - **Historical prices integration:** created `useHistoricalPrices` hook fetching `GET /api/prices/:gwId` (flat object keyed by element ID, values in 1/10th GBP). Updated `App.js` to use historical prices in `uniquePlayerHistories` useMemo with `now_cost` fallback. Added `useHistoricalPrices.test.js` (4 test cases).
  - **Off-season loading fix:** App.js now falls back to the last finished GW when no `is_current` gameweek exists, preventing infinite loading spinner. Shows amber banner when in off-season mode.
  - **Error state UI:** all 10 hooks now expose `error` state. App.js aggregates errors and renders a full-page error screen with "Try Again" button. Fixtures.jsx shows inline error banner. Hooks that previously returned bare values (`useAllPlayers`, `useTeams`, `useGWLiveStats`, `useFixtures`) now return `{ value, error }` objects.
  - Updated `useGWLiveStats.test.js` for new return shape. All 52 tests pass.

---

## What's Next

*Last updated: 2026-03-15*

Remaining priorities (in order):

1. **`REACT_APP_API_URL` missing guard** — if the env var is absent every fetch URL becomes `undefined/api/...`. Add a startup assertion with a clear message.
2. **Player headshots in profile modal** — FPL provides `player.photo` filename; fetch from `https://resources.premierleague.com/premierleague/photos/players/110x140/p{code}.png`.
3. **GWHistory shows current-squad players only** — since `gwPlayerStats` now always uses `currentGW`, past-GW squad data is not available. If accurate historical lineups are needed, the backend must provide a picks endpoint per GW.
4. **TypeScript migration** — start with `src/utils/findAlternatives.js` and the service hooks.
