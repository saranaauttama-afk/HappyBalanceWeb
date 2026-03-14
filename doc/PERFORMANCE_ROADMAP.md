# Performance Roadmap (Google Sheets + App UX)

## Goal
Reduce page-load and save-to-feedback latency in goals/rest flows, while keeping current Google Sheets backend.

## Status (2026-03-14)
- Phase 0: done in code (frontend + Apps Script timing logs), baseline note added.
- Phase 1: done in code (`listRestTaskLogs`, `listMentalTaskLogs`, `listSocialTaskLogs`, `listBalanceTaskLogs`, filter params, read cache + invalidation).
- Phase 2: done in code for task-detail flows that rely on structured task logs (`rest`, `mental`, `social`, `balance`).
- Phase 3: done for `rest`, `mental`, `social`, and `balance` mirror sheets.
- Phase 4: pending.

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

Delivered in current implementation:
- Added dedicated `rest_task_logs` sheet as read-optimized mirror for `physical/rest`.
- Added dedicated `mental_task_logs`, `social_task_logs`, and `balance_task_logs` sheets for structured task-history reads.
- `createDailyLog` now mirrors rest-task rows into `rest_task_logs`.
- `createDailyLog` now also mirrors `mental_task`, `social_task`, and `balance_task` rows into their dedicated sheets.
- `listRestTaskLogs`, `listMentalTaskLogs`, `listSocialTaskLogs`, and `listBalanceTaskLogs` now read dedicated mirror sheets first and fall back to `daily_logs` only when the mirror is still empty.
- Added one-time migration helpers `backfillRestTaskLogs_()`, `backfillMentalTaskLogs_()`, `backfillSocialTaskLogs_()`, `backfillBalanceTaskLogs_()`, and `backfillAllStructuredTaskLogs_()`.
- Updated task-detail/shared goal-sync flows in `mental`, `social`, and `balance` to stop fetching full `daily_logs` by default.

Rollout checklist:
1. Deploy the latest Apps Script version containing all structured task log sheets.
2. Open the Apps Script editor once and run `backfillAllStructuredTaskLogs_()` manually.
3. Confirm the new `rest_task_logs`, `mental_task_logs`, `social_task_logs`, and `balance_task_logs` sheets were created and populated.
4. Re-test one task page from each category and compare first-load latency before/after.

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

## Next Recommended Step
- Measure latency again after deploying Apps Script with all structured task log sheets.
- If a remaining slow path still depends on `daily_logs`, split that read pattern next instead of optimizing frontend first.
- Consider a summary endpoint for overview pages only after the task-detail cold paths are verified improved.
