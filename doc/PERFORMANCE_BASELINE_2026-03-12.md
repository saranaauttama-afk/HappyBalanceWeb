# Performance Baseline (2026-03-12)

## Scope
- Environment: API URL จาก `.env` (`VITE_API_BASE_URL`)
- User: `demo-user-001`
- Date measured: 2026-03-12 (Asia/Bangkok)
- Method: ยิง API ซ้ำหลายรอบจากเครื่อง dev แล้วจับเวลาที่ client side

## Endpoint latency (ms)
| Endpoint | Runs | p50 | p95 | Min | Max |
|---|---:|---:|---:|---:|---:|
| `listGoals` | 7 | 2773.0 | 3378.9 | 2440.4 | 3550.8 |
| `listDailyLogs` | 7 | 2605.5 | 3479.1 | 2414.2 | 3482.1 |
| `listRestTaskLogs` | 7 | 1742.7 | 1824.3 | 1688.3 | 1891.8 |
| `createDailyLog` | 3 | 2601.0 | 2601.0 | 2316.7 | 2662.6 |
| `updateGoal` | 3 | 2856.4 | 2856.4 | 2738.6 | 3933.9 |

## Top 3 slow paths
1. หน้า task เดิมเรียก `listDailyLogs` ทั้งก้อนหลายครั้งในหน้าเดียว (รวมทั้งหลัง save)
2. `syncRestGoalProgress` เดิมสแกน log ทั้งหมดทุกครั้งที่บันทึก
3. Apps Script cold start + sheet read แบบ full table ทำให้ p95 สูง

## Changes implemented in this round
- เพิ่ม API filter สำหรับ `listDailyLogs` + endpoint `listRestTaskLogs`
- เพิ่ม Apps Script read cache (TTL สั้น) + user version invalidation หลัง write
- เปลี่ยนหน้า rest/task ให้ดึง log แบบ scoped ตาม task และ `limit`
- เปลี่ยน save flow ให้ตอบ success เร็วขึ้น แล้วค่อย sync คะแนน/refresh แบบ background
- เพิ่ม timing log ทั้ง frontend (`[api-timing]`) และ Apps Script (`[perf]`)
