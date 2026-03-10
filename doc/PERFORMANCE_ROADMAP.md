# Performance Roadmap (Google Sheets + App UX)

## Goal
Reduce page-load and save-to-feedback latency in goals/rest flows, while keeping current Google Sheets backend.

## Current Symptoms
- First load of task pages feels slow.
- After save, UI waits for multiple API calls before showing final state.
- Latency gets worse as `daily_logs` grows.

## Known Root Causes
- Apps Script reads full sheets (`getAllObjects_`) and filters in memory.
- `listDailyLogs` is called repeatedly from multiple task pages.
- Each task page re-fetches all logs even when only one task needs last 14 days.
- No server-side cache for frequent read endpoints.

## Phase 0 - Baseline (0.5 day)
- Add simple timing logs in frontend for key API calls:
  - `listDailyLogs`, `listGoals`, `createDailyLog`, `updateGoal`.
- Add timing logs in `Code.gs` around:
  - `listDailyLogs_`, `listGoals_`, `createDailyLog_`, `updateGoal_`.
- Capture baseline metrics (cold start and warm runs):
  - p50 / p95 endpoint latency.
  - task page total load time.

Deliverable:
- One markdown note with baseline numbers and top 3 slow paths.

## Phase 1 - Quick Wins in API (1 day)
- Add read endpoint(s) with narrow scope (do not return full history):
  - `listRestTaskLogs(userId, task, limit)`
  - default `limit=14`.
- Add optional date range filter to logs endpoints.
- Add server-side cache (Apps Script `CacheService`) for read endpoints:
  - short TTL (30-120 sec).
- Invalidate or bypass cache when write occurs for same user/task.

Success criteria:
- At least 40% faster task-page load (warm cache).

## Phase 2 - Frontend Request Strategy (1 day)
- Replace full `listDailyLogs` calls in task pages with scoped endpoint.
- Avoid duplicate fetches across similar task pages:
  - central hook/service cache by key (`userId + task + dateRange`).
- On save:
  - optimistic UI update for today.
  - refresh only scoped history for current task.
  - defer heavy rest-score sync to background when possible.

Success criteria:
- User sees save success state in < 500ms (excluding network extremes).

## Phase 3 - Rest Score Sync Optimization (0.5-1 day)
- Avoid scanning full logs on every save.
- Options:
  1. Incremental update by task/date.
  2. Store per-task latest score in a dedicated sheet.
- Recompute aggregate score from compact table instead of full `daily_logs`.

Success criteria:
- Save flow network calls reduced.
- `syncRestGoalProgress` no longer depends on full log scan.

## Phase 4 - Data Growth Protection (1 day)
- Add archival policy for very old `daily_logs` rows (optional).
- Add simple maintenance script for sheet health.
- Add data-size guardrails and monitoring notes.

Success criteria:
- Latency trend remains stable as rows increase.

## Implementation Order (Recommended)
1. Phase 0 baseline
2. Phase 1 scoped endpoint + cache
3. Phase 2 frontend scoped fetch + optimistic save
4. Phase 3 score sync refactor
5. Phase 4 long-term scaling hygiene

## Risks and Notes
- Apps Script cold start cannot be fully removed; only mitigated.
- Cache must be per-user/task safe to avoid stale cross-user data.
- Keep endpoint changes backward-compatible during rollout.

## Rollback Plan
- Keep old endpoints untouched while introducing new ones.
- Feature-flag frontend to switch between old/new fetch strategy.
- If issues occur, flip back to old strategy without schema rollback.

## Definition of Done
- Documented before/after latency metrics.
- No functional regression in log save/history display.
- Task pages no longer fetch full `daily_logs` by default.
