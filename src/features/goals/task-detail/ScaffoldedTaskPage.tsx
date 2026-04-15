import {
  Activity,
  AlarmClockCheck,
  BadgeHelp,
  CircleCheckBig,
  CircleX,
  Dumbbell,
  Heart,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import AppHeader from "../../../components/layout/AppHeader";
import MobileShell from "../../../components/layout/MobileShell";
import { logsService } from "../../../services/logs.service";
import { getCurrentUserId } from "../../../utils/authSession";
import { addDays, getStartOfWeek, isCurrentWeek, toDateKey } from "../../../utils/weekPeriod";
import WeekNavBar from "../../../components/ui/WeekNavBar";
import { getScaffoldedActivityConfig } from "../tasks/scaffoldedActivityTasks";
import {
  formatThaiDate,
  getBoolean,
  getLogTimestamp,
  getScaffoldedEntryType,
  getTodayDate,
  listScaffoldedTaskLogs,
  parseScaffoldedTaskNote,
  syncScaffoldedActivityGoal,
} from "./scaffoldedTaskShared";

type ScaffoldedHistoryItem = {
  id: string;
  date: string;
  done: boolean;
  score: number;
  point: number;
};

function getActivityIcon(activity?: string) {
  switch (activity) {
    case "food-intake":
      return Activity;
    case "exercise":
      return Dumbbell;
    case "body-hygiene":
      return ShieldCheck;
    case "life-satisfaction":
      return Sparkles;
    case "self-worth":
      return Heart;
    default:
      return BadgeHelp;
  }
}

export default function ScaffoldedTaskPage() {
  const { category, activity, task } = useParams<{
    category?: string;
    activity?: string;
    task?: string;
  }>();
  const userId = getCurrentUserId();
  const config =
    category === "physical" || category === "mental"
      ? getScaffoldedActivityConfig(category, activity)
      : undefined;
  const resolvedCategory = config?.category;
  const taskConfig = config?.tasks.find((item) => item.slug === task);

  const [weekStartKey] = useState(() => {
    const saved = sessionStorage.getItem("goals-week");
    if (saved) return saved;
    return toDateKey(getStartOfWeek(new Date()));
  });
  const isViewingCurrentWeek = isCurrentWeek(weekStartKey);
  const weekStartDate = new Date(weekStartKey + "T00:00:00");
  const weekEndDate = addDays(weekStartDate, 6);

  const [done, setDone] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState("");
  const [history, setHistory] = useState<ScaffoldedHistoryItem[]>([]);
  const [historyLoading, setHistoryLoading] = useState(true);

  const Icon = getActivityIcon(activity);

  const monthlyPoints = useMemo(() => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const monthKey = `${year}-${month}`;
    return history
      .filter((item) => item.date.startsWith(monthKey))
      .reduce((sum, item) => sum + item.point, 0);
  }, [history]);

  const loadTaskState = useCallback(async (forceRefresh = false) => {
    if (!config || !task || !resolvedCategory) return;

    try {
      setLoading(true);
      setHistoryLoading(true);
      setError(null);

      const weekEndKey = toDateKey(
        new Date(new Date(weekStartKey + "T00:00:00").setDate(
          new Date(weekStartKey + "T00:00:00").getDate() + 6
        ))
      );

      const [weekResponse, historyResponse] = await Promise.all([
        listScaffoldedTaskLogs(
          resolvedCategory,
          config.activity,
          userId ?? undefined,
          task,
          forceRefresh,
          weekStartKey,
          weekEndKey
        ),
        listScaffoldedTaskLogs(
          resolvedCategory,
          config.activity,
          userId ?? undefined,
          task,
          forceRefresh,
          "2020-01-01",
          getTodayDate()
        ),
      ]);

      if (!weekResponse.success) {
        throw new Error(weekResponse.error || "ไม่สามารถโหลดข้อมูลบันทึกได้");
      }

      // Pre-fill: only pre-fill Yes when this week has a true answer
      const weekLog = [...(weekResponse.data || [])]
        .sort((a, b) => getLogTimestamp(b) - getLogTimestamp(a))
        .find((log) => {
          if (log.log_date !== weekStartKey) return false;
          const parsed = parseScaffoldedTaskNote(String(log.note), resolvedCategory, config.activity);
          return parsed?.task === task;
        });

      if (weekLog) {
        const parsed = parseScaffoldedTaskNote(String(weekLog.note), resolvedCategory, config.activity);
        if (parsed && getBoolean(parsed.payload.done, parsed.score > 0)) {
          setDone(true);
        } else {
          setDone(null);
        }
      } else {
        setDone(null);
      }

      // Build history — dedup by week (handles old records saved on non-Monday dates)
      if (historyResponse.success) {
        const byWeek = new Map<string, ScaffoldedHistoryItem>();
        [...(historyResponse.data || [])]
          .sort((a, b) => getLogTimestamp(b) - getLogTimestamp(a))
          .forEach((log) => {
            if (!log.log_date) return;
            const parsed = parseScaffoldedTaskNote(String(log.note), resolvedCategory, config.activity);
            if (!parsed || parsed.task !== task) return;
            const logDate = new Date(log.log_date + "T00:00:00");
            if (Number.isNaN(logDate.getTime())) return;
            const weekKey = toDateKey(getStartOfWeek(logDate));
            if (byWeek.has(weekKey)) return;

            const isDone = getBoolean(parsed.payload.done, parsed.score > 0);
            byWeek.set(weekKey, {
              id: log.id,
              date: weekKey,
              done: isDone,
              score: parsed.score,
              point: isDone ? 1 : 0,
            });
          });

        setHistory(
          Array.from(byWeek.values())
            .sort((a, b) => b.date.localeCompare(a.date))
            .slice(0, 14)
        );
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "เกิดข้อผิดพลาดที่ไม่ทราบสาเหตุ");
    } finally {
      setLoading(false);
      setHistoryLoading(false);
    }
  }, [config, resolvedCategory, task, userId, weekStartKey]);

  useEffect(() => {
    void loadTaskState();
  }, [loadTaskState]);

  async function handleSave() {
    if (!config || !taskConfig || !resolvedCategory) return;

    setError(null);
    setSuccessMessage("");

    if (done === null) {
      setError("กรุณาเลือกคำตอบ Yes หรือ No ก่อนบันทึก");
      return;
    }

    try {
      setSaving(true);

      const score = done ? 100 : 0;
      const response = await logsService.createDailyLog({
        user_id: userId ?? undefined,
        log_date: weekStartKey,
        mood: `task-${config.activity}-${taskConfig.slug}`,
        energy: done ? 4 : 2,
        stress: done ? 1 : 4,
        note: JSON.stringify({
          entry_type: getScaffoldedEntryType(resolvedCategory),
          category: resolvedCategory,
          activity: config.activity,
          task: taskConfig.slug,
          score,
          payload: {
            done,
            is_daily: false,
          },
        }),
      });

      if (!response.success) {
        throw new Error(response.error || "ไม่สามารถบันทึกข้อมูลได้");
      }

      await syncScaffoldedActivityGoal(
        resolvedCategory,
        config.activity,
        config.tasks,
        userId ?? undefined
      );
      await loadTaskState(true);
      setSuccessMessage(done ? "บันทึกสำเร็จ ได้ +1 คะแนน" : "บันทึกสำเร็จ วันนี้ยังไม่ผ่านหัวข้อนี้");
    } catch (err) {
      setError(err instanceof Error ? err.message : "เกิดข้อผิดพลาดที่ไม่ทราบสาเหตุ");
    } finally {
      setSaving(false);
    }
  }

  if (!config || !taskConfig || !resolvedCategory) {
    return (
      <MobileShell>
        <AppHeader title="ไม่พบกิจกรรม" showBack />
        <main className="p-6 text-center text-slate-500">ไม่พบกิจกรรมที่ต้องการ</main>
      </MobileShell>
    );
  }

  return (
    <MobileShell>
      <div className="min-h-screen bg-[radial-gradient(circle_at_top_right,#fff6db_0%,#f7fdff_42%,#e8f7ef_100%)]">
        <AppHeader title={taskConfig.label} showBack showBell variant="soft" />
        <WeekNavBar weekStartDate={weekStartDate} weekEndDate={weekEndDate} isCurrentWeek={isViewingCurrentWeek} />

        <main className={`space-y-4 px-4 py-4 ${loading ? "pointer-events-none opacity-70" : ""}`}>
          {error ? (
            <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">{error}</div>
          ) : null}

          {successMessage ? (
            <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700">
              {successMessage}
            </div>
          ) : null}

          {loading ? (
            <div className="rounded-2xl border border-slate-200 bg-white/90 px-4 py-3 text-sm text-slate-600 shadow-sm">
              <div className="flex items-center gap-3">
                <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-slate-300 border-t-slate-600" />
                กำลังโหลดข้อมูลเดิม...
              </div>
            </div>
          ) : null}

          <section className="rounded-3xl border border-white/70 bg-white/80 p-4 shadow-[0_18px_40px_rgba(31,47,61,0.1)] backdrop-blur">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-[#f5fbff] text-[#2e6a8b] shadow-sm">
                    <Icon size={18} />
                  </span>
                  <div className="min-w-0">
                    <h2 className="text-lg font-semibold text-slate-900">{taskConfig.label}</h2>
                    <p className="mt-0.5 text-sm text-slate-500">{taskConfig.subtitle}</p>
                  </div>
                </div>
                {taskConfig.helperText ? (
                  <p className="mt-3 text-sm text-slate-500">{taskConfig.helperText}</p>
                ) : null}
              </div>

              <span
                className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-medium ${
                  done === null
                    ? "bg-slate-100 text-slate-600"
                    : done
                      ? "bg-emerald-50 text-emerald-700"
                      : "bg-rose-50 text-rose-700"
                }`}
              >
                {done === null ? "ยังไม่เลือก" : done ? "ได้ +1 คะแนน" : "วันนี้ 0 คะแนน"}
              </span>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setDone(true)}
                className={`flex items-center justify-center gap-2 rounded-2xl border px-4 py-3 text-sm font-semibold transition ${
                  done === true
                    ? "border-emerald-300 bg-emerald-50 text-emerald-700"
                    : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                }`}
              >
                <CircleCheckBig size={18} />
                Yes
              </button>

              <button
                type="button"
                onClick={() => setDone(false)}
                className={`flex items-center justify-center gap-2 rounded-2xl border px-4 py-3 text-sm font-semibold transition ${
                  done === false
                    ? "border-rose-300 bg-rose-50 text-rose-700"
                    : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                }`}
              >
                <CircleX size={18} />
                No
              </button>
            </div>
          </section>

          {!isViewingCurrentWeek ? (
            <div className="rounded-2xl bg-amber-50 px-4 py-3 text-center text-sm text-amber-700">
              ดูย้อนหลังเท่านั้น — บันทึกได้เฉพาะสัปดาห์ปัจจุบัน
            </div>
          ) : (
            <button
              type="button"
              onClick={() => void handleSave()}
              disabled={saving || loading || done === null}
              className={`w-full rounded-2xl py-4 font-semibold text-white ${
                saving || loading || done === null ? "bg-slate-400" : "bg-[#c6968c]"
              }`}
            >
              {saving ? "กำลังบันทึก..." : "บันทึกผล"}
            </button>
          )}

          <section className="rounded-3xl border border-white/70 bg-white/80 p-4 shadow-[0_18px_40px_rgba(31,47,61,0.1)] backdrop-blur">
            <div className="flex items-center justify-between gap-2">
              <h3 className="text-base font-semibold text-slate-900">ประวัติรายสัปดาห์</h3>
              <span className="inline-flex items-center gap-1 rounded-full bg-[#eef8f2] px-2.5 py-1 text-xs font-medium text-[#2f7b56]">
                <AlarmClockCheck size={13} />
                สัปดาห์นี้ได้ {monthlyPoints} คะแนน
              </span>
            </div>

            {historyLoading ? (
              <p className="mt-3 text-sm text-slate-500">กำลังโหลดข้อมูลบันทึก...</p>
            ) : history.length === 0 ? (
              <p className="mt-3 text-sm text-slate-500">ยังไม่มีข้อมูลการบันทึกสำหรับหัวข้อนี้</p>
            ) : (
              <div className="mt-3 space-y-2">
                {history.map((item) => (
                  <div
                    key={`${item.date}-${item.id}`}
                    className={`rounded-2xl border px-3 py-3 ${
                      item.done
                        ? "border-emerald-200 bg-emerald-50/70"
                        : "border-rose-200 bg-rose-50/70"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-sm font-medium text-slate-900">{formatThaiDate(item.date)}</p>
                      <span
                        className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                          item.done ? "bg-emerald-100 text-emerald-700" : "bg-rose-100 text-rose-700"
                        }`}
                      >
                        {item.point > 0 ? `+${item.point} คะแนน` : "0 คะแนน"}
                      </span>
                    </div>
                    <p className="mt-1 text-xs text-slate-600">
                      ผลการทำ: {item.done ? "ทำได้" : "ยังไม่ผ่าน"}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </section>
        </main>
      </div>
    </MobileShell>
  );
}
