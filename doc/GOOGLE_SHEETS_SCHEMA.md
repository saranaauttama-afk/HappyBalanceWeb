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
- listDailyLogs(userId)
- createDailyLog(user_id, log_date, mood, energy, stress, note)

## Sheet 4: appointments
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

## Sheet 5: articles
Columns:
- id (string, PK)
- title (string)
- description (string)
- image_url (string, nullable)
- published_at (ISO datetime)
- created_at (ISO datetime)

Actions:
- listArticles(limit?)

## Optional Sheet 6: task_logs (next phase)
Use this when task-detail pages need dedicated analytics instead of storing summaries in daily_logs.note.

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

## Notes for current codebase (as of 2026-03-08)
- Core pages now save to goals and daily_logs actions directly.
- Some task-detail pages currently save via createDailyLog as an interim approach.
- Next migration step: switch those pages to createTaskLog once Apps Script supports task_logs.
- Profile avatar upload now uses `uploadProfileAvatar` and stores file on Google Drive.
- Optional Apps Script property: `PROFILE_AVATAR_FOLDER_ID` (if not set, files go to Drive root).
