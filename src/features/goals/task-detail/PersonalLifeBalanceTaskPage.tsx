import {
  BellOff,
  BookOpenText,
  CircleCheckBig,
  CircleX,
  Film,
  Music4,
  Plus,
  Sparkles,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import AppHeader from "../../../components/layout/AppHeader";
import MobileShell from "../../../components/layout/MobileShell";
import WeekNavBar from "../../../components/ui/WeekNavBar";
import { logsService } from "../../../services/logs.service";
import { getCurrentUserId } from "../../../utils/authSession";
import { getStartOfMonth, getEndOfMonth, isCurrentMonth, toMonthKey, toDateKey } from '../../../utils/weekPeriod';
import { PERSONAL_LIFE_BALANCE_TASKS } from "../tasks/personalLifeBalanceTasks";
import {
  formatThaiDate,
  getBoolean,
  getLogTimestamp,
  getNumber,
  getTodayDate,
  parseBalanceTaskNote,
  syncBalanceActivityGoal,
} from "./balanceTaskShared";

const activityKey = "personal-life-balance";

type CounterHistoryItem = {
  id: string;
  date: string;
  count: number;
  score: number;
  point: number;
  achieved: boolean;
};

type WeekHistoryItem = {
  id: string;
  date: string;
  done: boolean;
  point: number;
};

function getTaskIcon(task: string) {
  switch (task) {
    case "mute-phone-after-work":
      return BellOff;
    case "listen-favorite-music":
      return Music4;
    case "watch-favorite-movie":
      return Film;
    case "read-interesting-book":
      return BookOpenText;
    default:
      return Sparkles;
  }
}

export default function PersonalLifeBalanceTaskPage() {
  const { task } = useParams<{ task?: string }>();
  const userId = getCurrentUserId();
  const config = PERSONAL_LIFE_BALANCE_TASKS.find((item) => item.slug === task);

  const [weekStartKey] = useState(() => {
    const saved = sessionStorage.getItem("goals-month");
    return saved ?? toMonthKey(new Date());
  });
  const weekStartDate = getStartOfMonth(new Date(weekStartKey + "-01T00:00:00"));
  const weekEndDate = getEndOfMonth(weekStartDate);
  const isViewingCurrentWeek = isCurrentMonth(weekStartKey);

  const [done, setDone] = useState<boolean | null>(null);
  const [countValue, setCountValue] = useState(0);
  const [history, setHistory] = useState<CounterHistoryItem[]>([]);
  const [weekHistory, setWeekHistory] = useState<WeekHistoryItem[]>([]);
  const [historyLoading, setHistoryLoading] = useState(true);
  const [lastSavedDate, setLastSavedDate] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState("");

  const Icon = getTaskIcon(task ?? "");

  const scorePreview = useMemo(() => {
    if (!config) return null;
    if (config.type === "counter") {
      return countValue > 0 ? 100 : 0;
    }
    if (done === null) return null;
    return done ? 100 : 0;
  }, [config, countValue, done]);

  const monthlyPoints = useMemo(() => {
    const now = new Date();
    const monthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
    if (config?.type === "counter") {
      return history.filter((item) => item.date.startsWith(monthKey)).reduce((sum, item) => sum + item.point, 0);
    }
    return weekHistory.filter((item) => item.date.startsWith(monthKey)).reduce((sum, item) => sum + item.point, 0);
  }, [config, history, weekHistory]);

  const loadTaskState = useCallback(async (forceRefresh = false) => {
    if (!task || !config) return;

    try {
      setLoading(true);
      setHistoryLoading(true);
      setError(null);

      const response = await logsService.listBalanceTaskLogs(userId ?? undefined, {
        activity: activityKey,
        task,
        limit: 240,
        forceRefresh,
        from: toDateKey(weekStartDate),
        to: toDateKey(weekEndDate),
      });
      if (!response.success) {
        throw new Error(response.error || "ไม่สามารถโหลดข้อมูลบันทึกได้");
      }

      const sortedLogs = [...(response.data || [])].sort((a, b) => getLogTimestamp(b) - getLogTimestamp(a));
      const latestLog = sortedLogs[0];

      if (!latestLog) {
        setDone(null);
        setCountValue(0);
        setHistory([]);
        setWeekHistory([]);
        setLastSavedDate(null);
        return;
      }

      const parsed = parseBalanceTaskNote(String(latestLog.note));
      if (!parsed) {
        setDone(null);
        setCountValue(0);
        setHistory([]);
        setWeekHistory([]);
        setLastSavedDate(null);
        return;
      }

      if (config.type === "counter") {
        const byDate = new Map<string, CounterHistoryItem>();
        sortedLogs.forEach((log) => {
          const current = parseBalanceTaskNote(String(log.note));
          if (!current || current.activity !== activityKey || current.task !== task) return;

          const count = Math.max(0, Math.round(getNumber(current.payload.count, 0)));
          const achieved = getBoolean(current.payload.achieved, count > 0 || current.score > 0);
          const point = getNumber(current.payload.point, achieved ? 1 : 0);

          if (byDate.has(log.log_date)) return;

          byDate.set(log.log_date, {
            id: log.id,
            date: log.log_date,
            count,
            score: current.score,
            point: point > 0 ? 1 : 0,
            achieved,
          });
        });

        const nextHistory = Array.from(byDate.values())
          .sort((a, b) => b.date.localeCompare(a.date))
          .slice(0, 31);

        setHistory(nextHistory);
        setWeekHistory([]);
        setCountValue(Math.max(0, Math.round(getNumber(parsed.payload.count, 0))));
        setDone(null);
      } else {
        setDone(getBoolean(parsed.payload.done, parsed.score > 0));
        setCountValue(0);
        setHistory([]);

        // Build weekly history — dedup by week start
        const byDay = new Map<string, WeekHistoryItem>();
        sortedLogs.forEach((log) => {
          if (!log.log_date) return;
          const current = parseBalanceTaskNote(String(log.note));
          if (!current || current.activity !== activityKey || current.task !== task) return;
          const logDate = new Date(String(log.log_date).slice(0, 10) + "T00:00:00");
          if (Number.isNaN(logDate.getTime())) return;
          const dk = String(log.log_date).slice(0, 10); // "2026-05-03"
          if (byDay.has(dk)) return;
          const isDone = getBoolean(current.payload.done, current.score > 0);
          byDay.set(dk, {
            id: String(log.id),
            date: dk,
            done: isDone,
            point: isDone ? 1 : 0,
          });
        });

        setWeekHistory(
          Array.from(byDay.values())
            .sort((a, b) => b.date.localeCompare(a.date))
            .slice(0, 31)
        );
      }

      setLastSavedDate(latestLog.log_date);
    } catch (err) {
      setError(err instanceof Error ? err.message : "เกิดข้อผิดพลาดที่ไม่ทราบสาเหตุ");
    } finally {
      setLoading(false);
      setHistoryLoading(false);
    }
  }, [config, task, userId, weekStartDate, weekEndDate]);

  useEffect(() => {
    void loadTaskState();
  }, [loadTaskState]);

  async function handleSave() {
    if (!task || !config) return;

    setError(null);
    setSuccessMessage("");

    if (config.type === "boolean" && done === null) {
      setError("กรุณาเลือกคำตอบ Yes หรือ No ก่อนบันทึก");
      return;
    }

    try {
      setSaving(true);

      const score = config.type === "counter" ? (countValue > 0 ? 100 : 0) : done ? 100 : 0;
      const achieved = score > 0;
      const point = achieved ? 1 : 0;

      const response = await logsService.createDailyLog({
        user_id: userId ?? undefined,
        log_date: getTodayDate(),
        mood: `task-${activityKey}-${task}`,
        energy:
          config.type === "counter"
            ? Math.max(1, Math.min(5, countValue === 0 ? 1 : Math.min(countValue + 1, 5)))
            : done
              ? 4
              : 2,
        stress: score > 0 ? 1 : 4,
        note: JSON.stringify({
          entry_type: "balance_task",
          category: "balance",
          activity: activityKey,
          task,
          score,
          payload:
            config.type === "counter"
              ? {
                  count: countValue,
                  achieved,
                  point,
                  is_daily: true,
                }
              : {
                  done,
                  is_daily: false,
                },
        }),
      });

      if (!response.success) {
        throw new Error(response.error || "ไม่สามารถบันทึกข้อมูลได้");
      }

      await syncBalanceActivityGoal(activityKey, userId ?? undefined);
      await loadTaskState(true);
      setSuccessMessage(
        config.type === "counter"
          ? countValue > 0
            ? `บันทึกสำเร็จ วันนี้ทำกิจกรรมนี้ ${countValue} ครั้ง ได้ +1 คะแนน`
            : "บันทึกสำเร็จ วันนี้ยังไม่มีจำนวนที่บันทึก"
          : done
            ? "บันทึกสำเร็จ ได้ +1 คะแนน"
            : "บันทึกสำเร็จ วันนี้ยังไม่ผ่านหัวข้อนี้"
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "เกิดข้อผิดพลาดที่ไม่ทราบสาเหตุ");
    } finally {
      setSaving(false);
    }
  }

  if (!config) {
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
        <AppHeader title={config.label} showBack showBell variant="soft" />
        <WeekNavBar monthDate={weekStartDate} isCurrentMonth={isViewingCurrentWeek} />

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
                    <h2 className="text-lg font-semibold text-slate-900">{config.label}</h2>
                    <p className="mt-1 text-sm text-slate-500">{config.subtitle}</p>
                  </div>
                </div>
                {config.helperText ? <p className="mt-3 text-sm text-slate-500">{config.helperText}</p> : null}
              </div>

              <span
                className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                  scorePreview === null
                    ? "bg-slate-100 text-slate-600"
                    : scorePreview > 0
                      ? "bg-emerald-50 text-emerald-700"
                      : "bg-rose-50 text-rose-700"
                }`}
              >
                {scorePreview === null ? "ยังไม่ได้เลือก" : `${scorePreview}%`}
              </span>
            </div>

            {config.type === "counter" ? (
              <div className="mt-5 rounded-[28px] border border-[#e8f2ec] bg-[linear-gradient(180deg,#f8fffb_0%,#eefbf5_100%)] p-4">
                <p className="text-center text-sm text-slate-500">จำนวนครั้งที่ทำกิจกรรมนี้วันนี้</p>
                <div className="mt-4 flex items-center justify-center gap-3">
                  <button
                    type="button"
                    onClick={() => setCountValue((prev) => Math.max(prev - 1, 0))}
                    className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-slate-200 bg-white text-xl font-semibold text-slate-700"
                    aria-label="ลดจำนวน"
                  >
                    -
                  </button>

                  <div className="min-w-28 rounded-2xl bg-white px-5 py-3 text-center shadow-sm">
                    <p className="text-3xl font-bold text-slate-900">{countValue}</p>
                    <p className="text-xs text-slate-500">ครั้ง</p>
                  </div>

                  <button
                    type="button"
                    onClick={() => setCountValue((prev) => Math.min(prev + 1, 20))}
                    className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-slate-200 bg-white text-xl font-semibold text-slate-700"
                    aria-label="เพิ่มจำนวน"
                  >
                    <Plus size={18} />
                  </button>
                </div>

                <div className="mt-4 flex flex-wrap justify-center gap-2">
                  {[1, 2, 3].map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => setCountValue(preset)}
                      className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-600"
                    >
                      {preset} ครั้ง
                    </button>
                  ))}
                </div>
              </div>
            ) : (
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
            )}

            <p className="mt-4 text-xs text-slate-500">
              {loading
                ? "กำลังโหลดข้อมูลบันทึกล่าสุด..."
                : lastSavedDate
                  ? `บันทึกล่าสุด: ${formatThaiDate(lastSavedDate)}`
                  : "ยังไม่เคยบันทึกหัวข้อนี้"}
            </p>
          </section>

          <button
            type="button"
            onClick={() => void handleSave()}
            disabled={saving || loading || (config.type === "boolean" && done === null)}
            className={`w-full rounded-2xl py-4 font-semibold text-white ${
              saving || loading || (config.type === "boolean" && done === null) ? "bg-slate-400" : "bg-[#c6968c]"
            }`}
          >
            {saving ? "กำลังบันทึก..." : "บันทึกผล"}
          </button>

          <section className="rounded-3xl border border-white/70 bg-white/80 p-4 shadow-[0_18px_40px_rgba(31,47,61,0.1)] backdrop-blur">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-semibold text-slate-900">
                ประวัติการบันทึกย้อนหลัง
              </h3>
              <span className="rounded-full bg-[#eef8f2] px-2.5 py-1 text-xs font-medium text-[#2f7b56]">
                เดือนนี้ได้ {monthlyPoints} คะแนน
              </span>
            </div>

            {historyLoading ? (
              <p className="mt-3 text-sm text-slate-500">กำลังโหลดข้อมูลบันทึก...</p>
            ) : config.type === "counter" ? (
              history.length === 0 ? (
                <p className="mt-3 text-sm text-slate-500">ยังไม่มีข้อมูลการบันทึกไว้</p>
              ) : (
                <div className="mt-3 space-y-2">
                  {history.map((item) => (
                    <div
                      key={`${item.date}-${item.id}`}
                      className={`rounded-2xl border px-3 py-3 ${
                        item.achieved ? "border-emerald-200 bg-emerald-50/70" : "border-rose-200 bg-rose-50/70"
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-sm font-medium text-slate-900">{formatThaiDate(item.date)}</p>
                        <span
                          className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                            item.achieved ? "bg-emerald-100 text-emerald-700" : "bg-rose-100 text-rose-700"
                          }`}
                        >
                          {item.point > 0 ? `+${item.point} คะแนน` : "0 คะแนน"}
                        </span>
                      </div>
                      <p className="mt-1 text-xs text-slate-600">ทำกิจกรรมนี้ {item.count} ครั้ง</p>
                    </div>
                  ))}
                </div>
              )
            ) : weekHistory.length === 0 ? (
              <p className="mt-3 text-sm text-slate-500">ยังไม่มีข้อมูลการบันทึกสำหรับหัวข้อนี้</p>
            ) : (
              <div className="mt-3 space-y-2">
                {weekHistory.map((item) => (
                  <div
                    key={item.id}
                    className={`rounded-2xl border px-3 py-3 ${
                      item.done
                        ? "border-emerald-200 bg-emerald-50/70"
                        : "border-rose-200 bg-rose-50/70"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-sm font-medium text-slate-900">
                        {new Date(item.date + "T00:00:00").toLocaleDateString("th-TH", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </p>
                      <span
                        className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                          item.done ? "bg-emerald-100 text-emerald-700" : "bg-rose-100 text-rose-700"
                        }`}
                      >
                        {item.done ? `+${item.point} คะแนน` : "0 คะแนน"}
                      </span>
                    </div>
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
