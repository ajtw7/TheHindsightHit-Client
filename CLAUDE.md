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
- **Routing:** React Router v6 (URL-based team ID: `/manager/:mgrId/profile`, etc.)
- **Persistence:** `localStorage` for team ID + all API response caching (TTL-based via `src/utils/cache.js`)
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
│   ├── useGWPicks.js                  # Fetches squad picks for a specific GW (used by GWHistory)
│   ├── useTransfers.js
│   ├── useGWHistory.js
│   ├── useGWLiveStats.js              # Fetches all-player stats per GW; in-memory cache via useRef
│   ├── useHistoricalPrices.js         # Fetches per-GW historical prices; in-memory cache via useRef
│   ├── useFixtures.js
│   └── useTeams.js
├── utils/
│   ├── cache.js            # Shared localStorage cache with TTL: cacheGet/cacheSet/initCache
│   ├── concurrencyLimit.js # Async pool: runs N tasks at a time (used by GW data hooks)
│   └── findAlternatives.js # Pure function: core "hindsight" logic — unit tested
├── Components/
│   ├── Header.jsx
│   ├── Nav.jsx             # Mobile burger + desktop nav; active link in emerald; Switch Team button
│   ├── Logo.jsx
│   └── ErrorBoundary.jsx
├── HomePage.jsx
├── ManagerProfile.jsx
├── GWHistory.jsx
├── Transfers.jsx           # Key page; Show Alternatives bottom-sheet modal
└── Fixtures.jsx
```

### Routing

| URL pattern | Component | Notes |
|---|---|---|
| `/` | `HomePage` | Team ID entry; redirects to `/manager/:id/profile` on submit |
| `/manager/:mgrId/profile` | `ManagerProfile` | Squad display (current GW) |
| `/manager/:mgrId/gameweek-history` | `GWHistory` | Past GW analysis |
| `/manager/:mgrId/fixtures` | `Fixtures` | Upcoming fixtures |
| `/manager/:mgrId/transfers` | `Transfers` | Transfer analysis & alternatives |

Old flat URLs (`/manager-profile`, `/transfers`, etc.) redirect to the new structure.

### Persistence & caching

All API caching uses `localStorage` with TTL-based expiration via the shared
`src/utils/cache.js` utility (`cacheGet`, `cacheSet`, `initCache`). Data survives
tab close, browser restart, and back-and-forth visits to/from the FPL app.

- **Team ID** persisted in `localStorage` — survives refresh and browser close. Cleared via "Switch Team" button.
- **Gameweeks** (4h TTL), **allPlayers** (1h), **teams** (24h) — bootstrap data shared across all teams.
- **mgrData** (1h), **gwPlayerStats** (1h), **transfers** (30min), **gwHistory** (30min) — keyed by `mgrId` (+ GW where applicable).
- **GW live stats** — finished GWs never expire; current/live GW has 5min TTL. Dual-layer cache: `useRef` L1 (in-memory) + `localStorage` L2.
- **Historical prices** — never expire (immutable). Same dual-layer cache as live stats.
- **Cache versioning:** all keys prefixed `thh_v1_`. `initCache()` (called in `index.js`) clears stale keys when the version changes.

### Key data flow

1. `App.js` fetches gameweeks, allPlayers, mgrData, gwPlayerStats, transfers,
   and gwHistory.
2. `neededGWIds` = union of transfer GW IDs and gwHistory GW IDs (typically ≤38).
   `useGWLiveStats` and `useHistoricalPrices` are **lazy-loaded** — they only fetch
   when the user is on `/transfers` or `/gameweek-history` (controlled by `useLocation`).
   On other pages, empty `[]` is passed so no GW-level requests fire.
   Both hooks use a **concurrency limiter** (`src/utils/concurrencyLimit.js`) to fetch
   at most 3 GWs at a time instead of all at once, preventing FPL rate-limit hits.
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
| `src/utils/cache.test.js` | localStorage TTL cache: get/set, expiry, eviction, version busting |
| `src/utils/concurrencyLimit.test.js` | Async pool: concurrency enforcement, ordering, error handling |
| `src/services/useGWLiveStats.test.js` | Fetch, dual-layer cache (useRef + localStorage), error handling |
| `src/services/useHistoricalPrices.test.js` | Fetch, dual-layer cache (useRef + localStorage), error handling |
| `src/services/useGWPicks.test.js` | Fetch, null-param guard, cache hit, error handling |
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
- **After pushing, always provide the PR title and full PR description inside a fenced markdown code block** (` ```markdown `) so the user can copy-paste it verbatim. Do this automatically — never wait to be asked.

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
- **2026-03-15 — Session 5 (claude/review-claude-md-TziqO):**
  - **Session persistence:** `mgrId` now stored in `localStorage` — page refresh no longer loses the team. Read back on mount via `useState` lazy initialiser.
  - **URL-based team routing:** routes changed from flat (`/transfers`) to `/manager/:mgrId/transfers`. URLs are shareable and bookmarkable. Old flat URLs redirect to the new structure.
  - **Switch Team button:** added to Nav (desktop: icon button, mobile: labelled button in burger menu). Clears localStorage and navigates back to HomePage.
  - **sessionStorage caching:** `useGameweeks`, `useAllPlayers`, `useTeams` now read from `sessionStorage` on mount and skip the fetch if cached. Written after successful fetch. Cleared automatically on tab close.
  - **Nav + Header prop threading:** `mgrId` and `onSwitchTeam` passed from App → Header → Nav for dynamic link generation.
  - Updated `App.test.js` to use `MemoryRouter` and clear storage in `beforeEach`. All 52 tests pass.
- **2026-03-16 — Session 6 (claude/review-claude-md-TziqO):**
  - **Manager-specific sessionStorage caching:** added sessionStorage caching to `useMgrData`, `useGWPlayerStats`, `useTransfers`, and `useGWHistory`. On page refresh these hooks now return cached data instantly instead of firing four simultaneous API requests that get rate-limited by the FPL backend. Cache keys include `mgrId` (and GW where applicable); cache clears automatically on tab close.
  - **Build fixes:** removed unused `useParams`/`useNavigate` imports from App.js (Netlify `CI=true` treats warnings as errors).

- **2026-03-16 — Session 7 (claude/review-claude-md-TziqO):**
  - **localStorage caching with TTL:** migrated all 9 service hooks from `sessionStorage` / `useRef`-only caching to persistent `localStorage` with TTL-based expiration. Data now survives tab close, browser restart, and back-and-forth visits to the FPL app — zero API calls needed for cached data.
  - **Shared cache utility:** created `src/utils/cache.js` with `cacheGet` (read + TTL check), `cacheSet` (write + quota eviction), `initCache` (version-gated cleanup). All cache keys prefixed `thh_v1_` with version-busting on code changes.
  - **Dual-layer caching for GW data:** `useGWLiveStats` and `useHistoricalPrices` now use `useRef` as L1 (in-memory, fastest) and `localStorage` as L2 (persistent). On mount, L1 is hydrated from L2 before fetching.
  - **Conditional TTL:** `useGWLiveStats` accepts `currentGWId` param — finished GWs never expire, current/live GW uses 5min TTL. Historical prices never expire (immutable data).
  - **TTL values:** gameweeks 4h, teams 24h, allPlayers 1h, mgrData 1h, gwPlayerStats 1h, transfers 30min, gwHistory 30min.
  - Added `cache.test.js` (7 test cases). Updated `useGWLiveStats.test.js` and `useHistoricalPrices.test.js` with localStorage hydration tests. All 65 tests pass.
- **2026-03-16 — Session 8 (claude/review-claude-md-TziqO):**
  - **Concurrency limiter:** created `src/utils/concurrencyLimit.js` — reusable async pool that runs N tasks at a time with `allSettled`-style results. Added `concurrencyLimit.test.js` (5 test cases).
  - **Rate-limit fix:** replaced `Promise.all` in `useGWLiveStats` and `useHistoricalPrices` with `concurrencyLimit(tasks, 3)`. GW data now fetches 3 at a time instead of 30+ simultaneously.
  - **Lazy-load GW data:** `useGWLiveStats` and `useHistoricalPrices` now receive empty `[]` when user is not on `/transfers` or `/gameweek-history` (detected via `useLocation`). GW-level API calls no longer fire on Profile or Fixtures pages.
  - All 70 tests pass. Production build succeeds.
- **2026-03-16 — Session 9 (claude/review-claude-md-TziqO):**
  - **`REACT_APP_API_URL` startup guard:** added a throw in `index.js` before render if the env var is missing. Provides a clear error message pointing to `.env.example`.
  - **Historical GW lineups in GWHistory:** created `useGWPicks` hook that fetches the manager's actual squad for any GW via the existing `/api/{mgrId}/gw-player-stats/{gwId}` endpoint. GWHistory now shows the squad that was active for the selected GW (not the current squad). Player lookups use `allPlayers` instead of `myPlayers` so transferred-out players are still resolved. Added loading spinner while picks load.
  - Added `useGWPicks.test.js` (4 test cases: fetch, null params, cache hit, error). All 74 tests pass. Production build succeeds.
- **2026-03-17 — Session 10 (claude/review-claude-md-eXf2v):**
  - **Player headshots in profile modal:** `PlayerModal` in `ManagerProfile.jsx` now renders the player's headshot using `player.code` to build the FPL CDN URL (`https://resources.premierleague.com/premierleague/photos/players/110x140/p{code}.png`). Image is hidden via `onError` if the CDN returns a 404. Photo sits inline with the position badge, name, and team name in the modal header.

---

## What's Next

*Last updated: 2026-03-17*

Remaining priorities (in order):

1. **Backend DB migration** — move remaining FPL-proxied endpoints to a database (like pricing already is). Would eliminate FPL rate-limiting at the root.
2. **Analytics integration** — add PostHog or Plausible for anonymous visitor tracking (requires account signup + project ID).
3. **User accounts** — Firebase Auth or Supabase for multi-device sync, saved preferences (requires project setup).
4. **TypeScript migration** — start with `src/utils/findAlternatives.js` and the service hooks.
