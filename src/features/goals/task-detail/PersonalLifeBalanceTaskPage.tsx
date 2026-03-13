import { BellOff, BookOpenText, CircleCheckBig, CircleX, Film, Music4, Plus, Sparkles } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import AppHeader from "../../../components/layout/AppHeader";
import MobileShell from "../../../components/layout/MobileShell";
import { logsService } from "../../../services/logs.service";
import { getCurrentUserId } from "../../../utils/authSession";
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

  const [done, setDone] = useState<boolean | null>(null);
  const [countValue, setCountValue] = useState(0);
  const [lastSavedDate, setLastSavedDate] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
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

  const loadTaskState = useCallback(async () => {
    if (!task || !config) return;

    try {
      setLoading(true);
      setError(null);

      const response = await logsService.listDailyLogs(userId ?? undefined, {
        entry_type: "balance_task",
        category: "balance",
        activity: activityKey,
        task,
        limit: 20,
      });
      if (!response.success) {
        throw new Error(response.error || "Could not load task logs");
      }

      const latestLog = [...(response.data || [])].sort((a, b) => getLogTimestamp(b) - getLogTimestamp(a))[0];
      if (!latestLog) {
        setDone(null);
        setCountValue(0);
        setLastSavedDate(null);
        return;
      }

      const parsed = parseBalanceTaskNote(String(latestLog.note));
      if (!parsed) {
        setDone(null);
        setCountValue(0);
        setLastSavedDate(null);
        return;
      }

      if (config.type === "counter") {
        setCountValue(Math.max(0, Math.round(getNumber(parsed.payload.count, 0))));
        setDone(null);
      } else {
        setDone(getBoolean(parsed.payload.done, parsed.score > 0));
        setCountValue(0);
      }

      setLastSavedDate(latestLog.log_date);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  }, [config, task, userId]);

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
                  achieved: countValue > 0,
                  is_daily: false,
                }
              : {
                  done,
                  is_daily: false,
                },
        }),
      });

      if (!response.success) {
        throw new Error(response.error || "Could not save task");
      }

      await syncBalanceActivityGoal(activityKey, userId ?? undefined);
      setLastSavedDate(getTodayDate());
      setSuccessMessage(
        config.type === "counter"
          ? countValue > 0
            ? `บันทึกสำเร็จ กิจกรรมนี้ถูกบันทึกไว้ ${countValue} ครั้ง`
            : "บันทึกสำเร็จ แต่ยังไม่มีจำนวนที่ทำกิจกรรม"
          : done
            ? "บันทึกสำเร็จ หัวข้อนี้ได้ 100%"
            : "บันทึกสำเร็จ หัวข้อนี้ได้ 0%"
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
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

        <main className="space-y-4 px-4 py-4">
          {error ? (
            <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">{error}</div>
          ) : null}

          {successMessage ? (
            <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700">
              {successMessage}
            </div>
          ) : null}

          <section className="rounded-3xl border border-white/70 bg-white/80 p-4 shadow-[0_18px_40px_rgba(31,47,61,0.1)] backdrop-blur">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="inline-flex items-center gap-2 rounded-full bg-[#f5fbff] px-3 py-1.5 text-xs font-medium text-[#2e6a8b]">
                  <Icon size={14} />
                  {config.type === "counter" ? "บันทึกแบบนับจำนวน" : "ตอบแบบ Yes / No"}
                </div>
                <h2 className="mt-3 text-lg font-semibold text-slate-900">{config.label}</h2>
                <p className="mt-1 text-sm text-slate-500">{config.subtitle}</p>
                {config.helperText ? (
                  <p className="mt-2 text-sm text-slate-500">{config.helperText}</p>
                ) : null}
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
                {scorePreview === null ? "ยังไม่เลือก" : `${scorePreview}%`}
              </span>
            </div>

            {config.type === "counter" ? (
              <>
                <div className="mt-5 rounded-[28px] border border-[#e8f2ec] bg-[linear-gradient(180deg,#f8fffb_0%,#eefbf5_100%)] p-4">
                  <p className="text-center text-sm text-slate-500">จำนวนครั้งที่ทำกิจกรรมนี้</p>
                  <div className="mt-4 flex items-center justify-center gap-3">
                    <button
                      type="button"
                      onClick={() => setCountValue((prev) => Math.max(prev - 1, 0))}
                      className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-slate-200 bg-white text-xl font-semibold text-slate-700"
                      aria-label="ลดจำนวน"
                    >
                      -
                    </button>

                    <div className="min-w-[112px] rounded-2xl bg-white px-5 py-3 text-center shadow-sm">
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
              </>
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
              saving || loading || (config.type === "boolean" && done === null)
                ? "bg-slate-400"
                : "bg-[#c6968c]"
            }`}
          >
            {saving ? "กำลังบันทึก..." : "บันทึกผล"}
          </button>
        </main>
      </div>
    </MobileShell>
  );
}
