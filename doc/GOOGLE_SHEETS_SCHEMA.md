# Google Sheets Data Design (Web Mobile)

## Objective
Store app data from the mobile-first web flow in Google Sheets through Apps Script actions.

## Sheet 1: users
Columns:
- id (string, PK)
- email (string)
- full_name (string)
- phone (string)
- avatar_url (string, nullable)
- sleep_goal_minutes (number, nullable)
- water_goal_ml (number, nullable)
- password_hash (string)
- auth_provider (enum: password|google|facebook|apple)
- provider_user_id (string, nullable)
- status (enum: active|disabled)
- created_at (ISO datetime)
- updated_at (ISO datetime)

Actions:
- getUser(id)
- registerUser(full_name, email, phone, password, auth_provider?)
- loginUser(email, password)
- updateProfile(id, full_name?, email?, phone?, sleep_goal_minutes?, water_goal_ml?, avatar_url?)
- uploadProfileAvatar(id, image_base64, file_name?, mime_type?)

## Sheet 2: goals
Columns:
- id (string, PK)
- user_id (string, FK users.id)
- category (enum: physical|mental|social|balance)
- activity (string slug)
- current_value (number)
- target_value (number)
- status (enum: active|completed|paused)
- created_at (ISO datetime)
- updated_at (ISO datetime)

Actions:
- listGoals(userId)
- createGoal(user_id, category, activity, current_value, target_value, status)
- updateGoal(id, category?, activity?, current_value?, target_value?, status?)

## Sheet 3: daily_logs
Columns:
- id (string, PK)
- user_id (string, FK users.id)
- log_date (ISO date)
- mood (string)
- energy (number)
- stress (number)
- note (string)
- created_at (ISO datetime)
- updated_at (ISO datetime)

Actions:
- listDailyLogs(userId, from?, to?, limit?, entry_type?, category?, activity?, task?)
- createDailyLog(user_id, log_date, mood, energy, stress, note)

## Sheet 4: rest_task_logs
Dedicated read-optimized mirror for `physical/rest` task history.

Columns:
- id (string, PK)
- daily_log_id (string, FK daily_logs.id)
- user_id (string, FK users.id)
- log_date (ISO date)
- entry_type (string)
- category (string)
- activity (string)
- task (string slug)
- score (number)
- point (number)
- achieved (boolean)
- mood (string)
- energy (number)
- stress (number)
- note (string)
- created_at (ISO datetime)
- updated_at (ISO datetime)

Actions:
- listRestTaskLogs(userId, task?, limit?, from?, to?)

Notes:
- `createDailyLog` remains the write action used by frontend.
- When `note.entry_type === "rest_task"`, Apps Script now writes to `daily_logs` and mirrors a structured row into `rest_task_logs`.
- `listRestTaskLogs` reads `rest_task_logs` first and falls back to `daily_logs` only when the dedicated sheet is still empty.
- One-time migration helper available in Apps Script: `backfillRestTaskLogs_()`.

## Sheet 5: mental_task_logs
Dedicated read-optimized mirror for `mental` task history.

Columns:
- id (string, PK)
- daily_log_id (string, FK daily_logs.id)
- user_id (string, FK users.id)
- log_date (ISO date)
- entry_type (string)
- category (string)
- activity (string)
- task (string slug)
- score (number)
- point (number)
- achieved (boolean)
- mood (string)
- energy (number)
- stress (number)
- note (string)
- created_at (ISO datetime)
- updated_at (ISO datetime)

Actions:
- listMentalTaskLogs(userId, activity?, task?, limit?, from?, to?)

Notes:
- `createDailyLog` mirrors `mental_task` rows into `mental_task_logs`.
- `listMentalTaskLogs` reads `mental_task_logs` first and falls back to `daily_logs` only when the dedicated sheet is still empty.
- One-time migration helper available in Apps Script: `backfillMentalTaskLogs_()`.

## Sheet 6: social_task_logs
Dedicated read-optimized mirror for `social` task history.

Columns:
- id (string, PK)
- daily_log_id (string, FK daily_logs.id)
- user_id (string, FK users.id)
- log_date (ISO date)
- entry_type (string)
- category (string)
- activity (string)
- task (string slug)
- score (number)
- point (number)
- achieved (boolean)
- mood (string)
- energy (number)
- stress (number)
- note (string)
- created_at (ISO datetime)
- updated_at (ISO datetime)

Actions:
- listSocialTaskLogs(userId, activity?, task?, limit?, from?, to?)

Notes:
- `createDailyLog` mirrors `social_task` rows into `social_task_logs`.
- `listSocialTaskLogs` reads `social_task_logs` first and falls back to `daily_logs` only when the dedicated sheet is still empty.
- One-time migration helper available in Apps Script: `backfillSocialTaskLogs_()`.

## Sheet 7: balance_task_logs
Dedicated read-optimized mirror for `balance` task history.

Columns:
- id (string, PK)
- daily_log_id (string, FK daily_logs.id)
- user_id (string, FK users.id)
- log_date (ISO date)
- entry_type (string)
- category (string)
- activity (string)
- task (string slug)
- score (number)
- point (number)
- achieved (boolean)
- mood (string)
- energy (number)
- stress (number)
- note (string)
- created_at (ISO datetime)
- updated_at (ISO datetime)

Actions:
- listBalanceTaskLogs(userId, activity?, task?, limit?, from?, to?)

Notes:
- `createDailyLog` mirrors `balance_task` rows into `balance_task_logs`.
- `listBalanceTaskLogs` reads `balance_task_logs` first and falls back to `daily_logs` only when the dedicated sheet is still empty.
- One-time migration helper available in Apps Script: `backfillBalanceTaskLogs_()`.

## Sheet 8: appointments
Columns:
- id (string, PK)
- user_id (string, FK users.id)
- appointment_date (ISO datetime)
- type (string)
- status (enum: pending|confirmed|done|cancelled)
- note (string)
- created_at (ISO datetime)
- updated_at (ISO datetime)

Actions:
- listAppointments(userId)
- createAppointment(user_id, appointment_date, type, status, note)

## Sheet 9: monthly_goals
Columns:
- id (string, PK)
- user_id (string, FK users.id)
- month_key (string, format YYYY-MM)
- goal_text (string)
- created_at (ISO datetime)
- updated_at (ISO datetime)

Actions:
- listMonthlyGoals(userId, month_key?)
- upsertMonthlyGoal(user_id, month_key, goal_text)

## Sheet 10: articles
Columns:
- id (string, PK)
- title (string)
- description (string)
- image_url (string, nullable)
- published_at (ISO datetime)
- created_at (ISO datetime)

Actions:
- listArticles(limit?)

## Optional Sheet 11: task_logs (future generic layer)
Use this only if we later want a single generic task-log table instead of category-specific mirror sheets.

Columns:
- id (string, PK)
- user_id (string, FK users.id)
- category (string)
- activity (string)
- task_slug (string)
- value_type (enum: number|boolean|timeseries)
- value_number (number, nullable)
- value_boolean (boolean, nullable)
- value_json (stringified JSON, nullable)
- log_date (ISO date)
- created_at (ISO datetime)

Recommended actions:
- listTaskLogs(userId, category?, activity?, task_slug?, from?, to?)
- createTaskLog(user_id, category, activity, task_slug, value_type, value_number?, value_boolean?, value_json?, log_date)

## Notes for current codebase (as of 2026-03-14)
- Core pages now save to goals and daily_logs actions directly.
- Task-detail pages for `rest`, `mental`, `social`, and `balance` now read from dedicated mirror sheets via `listRestTaskLogs`, `listMentalTaskLogs`, `listSocialTaskLogs`, and `listBalanceTaskLogs`.
- Writes still go through `createDailyLog`, and Apps Script mirrors structured task rows into the category-specific sheet automatically.
- One-time migration helpers are available in Apps Script: `backfillRestTaskLogs_()`, `backfillMentalTaskLogs_()`, `backfillSocialTaskLogs_()`, `backfillBalanceTaskLogs_()`, and `backfillAllStructuredTaskLogs_()`.
- Profile avatar upload now uses `uploadProfileAvatar` and stores file on Google Drive.
- Optional Apps Script property: `PROFILE_AVATAR_FOLDER_ID` (if not set, files go to Drive root).
- Appointments monthly goal now saves to `monthly_goals` (Google Sheets) via `upsertMonthlyGoal`.
- `listGoals`, `listDailyLogs`, `listRestTaskLogs`, `listMentalTaskLogs`, `listSocialTaskLogs`, and `listBalanceTaskLogs` support short-lived read cache (Apps Script `CacheService`) with user-version invalidation after writes.
