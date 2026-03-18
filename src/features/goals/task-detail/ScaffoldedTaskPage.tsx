import {
  Activity,
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

  const [done, setDone] = useState<boolean | null>(null);
  const [lastSavedDate, setLastSavedDate] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState("");

  const Icon = getActivityIcon(activity);

  const scorePreview = useMemo(() => {
    if (done === null) return null;
    return done ? 100 : 0;
  }, [done]);

  const loadTaskState = useCallback(async () => {
    if (!config || !task || !resolvedCategory) return;

    try {
      setLoading(true);
      setError(null);

      const response = await listScaffoldedTaskLogs(
        resolvedCategory,
        config.activity,
        userId ?? undefined,
        task
      );
      if (!response.success) {
        throw new Error(response.error || "ไม่สามารถโหลดข้อมูลบันทึกได้");
      }

      const latestLog = [...(response.data || [])]
        .sort((a, b) => getLogTimestamp(b) - getLogTimestamp(a))
        .find((log) => {
          const parsed = parseScaffoldedTaskNote(
            String(log.note),
            resolvedCategory,
            config.activity
          );
          return parsed?.task === task;
        });

      if (!latestLog) {
        setDone(null);
        setLastSavedDate(null);
        return;
      }

      const parsed = parseScaffoldedTaskNote(
        String(latestLog.note),
        resolvedCategory,
        config.activity
      );
      if (!parsed) {
        setDone(null);
        setLastSavedDate(null);
        return;
      }

      setDone(getBoolean(parsed.payload.done, parsed.score > 0));
      setLastSavedDate(latestLog.log_date);
    } catch (err) {
      setError(err instanceof Error ? err.message : "เกิดข้อผิดพลาดที่ไม่ทราบสาเหตุ");
    } finally {
      setLoading(false);
    }
  }, [config, resolvedCategory, task, userId]);

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
        log_date: getTodayDate(),
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
      await loadTaskState();
      setSuccessMessage(done ? "บันทึกสำเร็จ คะแนนหัวข้อนี้เป็น 100%" : "บันทึกสำเร็จ คะแนนหัวข้อนี้เป็น 0%");
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
                <div className="flex items-center gap-2">
                  <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-[#f5fbff] text-[#2e6a8b] shadow-sm">
                    <Icon size={18} />
                  </span>
                  <div className="min-w-0">
                    <h2 className="text-lg font-semibold text-slate-900">{taskConfig.label}</h2>
                    <p className="mt-1 text-sm text-slate-500">{taskConfig.subtitle}</p>
                  </div>
                </div>
                {taskConfig.helperText ? <p className="mt-3 text-sm text-slate-500">{taskConfig.helperText}</p> : null}
              </div>

              <span
                className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                  done === null
                    ? "bg-slate-100 text-slate-600"
                    : done
                      ? "bg-emerald-50 text-emerald-700"
                      : "bg-rose-50 text-rose-700"
                }`}
              >
                {scorePreview === null ? "ยังไม่ได้เลือก" : `${scorePreview}%`}
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
            disabled={saving || loading || done === null}
            className={`w-full rounded-2xl py-4 font-semibold text-white ${
              saving || loading || done === null ? "bg-slate-400" : "bg-[#c6968c]"
            }`}
          >
            {saving ? "กำลังบันทึก..." : "บันทึกผล"}
          </button>
        </main>
      </div>
    </MobileShell>
  );
}
