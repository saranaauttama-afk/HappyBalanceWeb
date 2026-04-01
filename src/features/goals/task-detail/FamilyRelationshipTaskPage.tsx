import { CircleCheckBig, CircleX, HandHelping, HeartHandshake, HousePlus, Smile, Sparkles, UserRoundCheck } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import AppHeader from "../../../components/layout/AppHeader";
import MobileShell from "../../../components/layout/MobileShell";
import { logsService } from "../../../services/logs.service";
import { getCurrentUserId } from "../../../utils/authSession";
import { FAMILY_RELATIONSHIP_TASKS } from "../tasks/familyRelationshipTasks";
import {
  formatThaiDate,
  getBoolean,
  getLogTimestamp,
  getTodayDate,
  parseSocialTaskNote,
  syncSocialActivityGoal,
} from "./socialTaskShared";

const activityKey = "family-relationship";

function getTaskIcon(task: string) {
  switch (task) {
    case "smile-with-family":
      return Smile;
    case "take-responsibility":
      return UserRoundCheck;
    case "help-housework":
      return HousePlus;
    case "care-for-family":
      return HandHelping;
    case "no-aggressive-behavior":
      return HeartHandshake;
    default:
      return Sparkles;
  }
}

export default function FamilyRelationshipTaskPage() {
  const { task } = useParams<{ task?: string }>();
  const userId = getCurrentUserId();
  const config = FAMILY_RELATIONSHIP_TASKS.find((item) => item.slug === task);

  const [done, setDone] = useState<boolean | null>(null);
  const [lastSavedDate, setLastSavedDate] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState("");

  const Icon = getTaskIcon(task ?? "");

  const scorePreview = useMemo(() => {
    if (done === null) return null;
    return done ? 100 : 0;
  }, [done]);

  const loadTaskState = useCallback(async () => {
    if (!task || task === "listen-and-accept") return;

    try {
      setLoading(true);
      setError(null);

      const response = await logsService.listSocialTaskLogs(userId ?? undefined, {
        activity: activityKey,
        task,
        limit: 20,
      });
      if (!response.success) {
        throw new Error(response.error || "ไม่สามารถโหลดข้อมูลบันทึกได้");
      }

      const latestLog = [...(response.data || [])]
        .sort((a, b) => getLogTimestamp(b) - getLogTimestamp(a))
        .find((log) => {
          const parsed = parseSocialTaskNote(String(log.note));
          return parsed?.activity === activityKey && parsed.task === task;
        });

      if (!latestLog) {
        setDone(null);
        setLastSavedDate(null);
        return;
      }

      const parsed = parseSocialTaskNote(String(latestLog.note));
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
  }, [task, userId]);

  useEffect(() => {
    void loadTaskState();
  }, [loadTaskState]);

  async function handleSave() {
    if (!task) return;

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
        mood: `task-${activityKey}-${task}`,
        energy: done ? 4 : 2,
        stress: done ? 1 : 4,
        note: JSON.stringify({
          entry_type: "social_task",
          category: "social",
          activity: activityKey,
          task,
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

      await syncSocialActivityGoal(activityKey, userId ?? undefined);
      await loadTaskState();
      setLastSavedDate(getTodayDate());
      setSuccessMessage(done ? "บันทึกสำเร็จ คะแนนหัวข้อนี้เป็น 100%" : "บันทึกสำเร็จ คะแนนหัวข้อนี้เป็น 0%");
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

        <main className="space-y-4 px-4 py-4">
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

          <div className={loading ? "pointer-events-none opacity-70" : ""}>
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
          </div>
        </main>
      </div>
    </MobileShell>
  );
}
