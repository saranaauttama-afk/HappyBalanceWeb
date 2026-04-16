import { Sun } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import AppHeader from "../../../components/layout/AppHeader";
import MobileShell from "../../../components/layout/MobileShell";
import WeekNavBar from "../../../components/ui/WeekNavBar";
import { logsService } from "../../../services/logs.service";
import { getCurrentUserId } from "../../../utils/authSession";
import { addDays, getStartOfWeek, isCurrentWeek, toDateKey } from "../../../utils/weekPeriod";
import { STRESS_TASKS } from "../tasks/stressTasks";
import {
  formatThaiDate,
  getBoolean,
  getLogTimestamp,
  getNumber,
  getTodayDate,
  parseStressTaskNote,
  syncStressLevelGoal,
} from "./stressTaskShared";

type SunHistoryItem = {
  id: string;
  date: string;
  count: number;
  score: number;
  point: number;
  achieved: boolean;
};

const config = STRESS_TASKS.find((item) => item.slug === "get-sunlight");

export default function SunlightTaskPage() {
  const userId = getCurrentUserId();

  const [weekStartKey] = useState(() => {
    const saved = sessionStorage.getItem("goals-week");
    return saved ?? toDateKey(getStartOfWeek(new Date()));
  });
  const weekStartDate = new Date(weekStartKey + "T00:00:00");
  const weekEndDate = addDays(weekStartDate, 6);
  const isViewingCurrentWeek = isCurrentWeek(weekStartKey);

  const [sunCount, setSunCount] = useState(0);
  const [history, setHistory] = useState<SunHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState("");

  const todayScore = useMemo(() => (sunCount > 0 ? 100 : 0), [sunCount]);

  const monthlyPoints = useMemo(() => {
    const now = new Date();
    const monthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;

    return history
      .filter((item) => item.date.startsWith(monthKey))
      .reduce((sum, item) => sum + item.point, 0);
  }, [history]);

  const loadSunlightContext = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await logsService.listMentalTaskLogs(userId ?? undefined, {
        activity: "stress-level",
        task: "get-sunlight",
        limit: 90,
      });
      if (!response.success) {
        throw new Error(response.error || "ไม่สามารถโหลดข้อมูลบันทึกได้");
      }

      const byDate = new Map<string, SunHistoryItem>();
      [...(response.data || [])]
        .sort((a, b) => getLogTimestamp(b) - getLogTimestamp(a))
        .forEach((log) => {
          const parsed = parseStressTaskNote(String(log.note));
          if (!parsed || parsed.task !== "get-sunlight") return;

          const count = Math.max(0, Math.round(getNumber(parsed.payload.sun_count, 0)));
          const achieved = getBoolean(parsed.payload.achieved, count > 0 || parsed.score > 0);
          const point = getNumber(parsed.payload.point, achieved ? 1 : 0);

          if (byDate.has(log.log_date)) return;

          byDate.set(log.log_date, {
            id: log.id,
            date: log.log_date,
            count,
            score: parsed.score,
            point: point > 0 ? 1 : 0,
            achieved,
          });
        });

      const nextHistory = Array.from(byDate.values())
        .sort((a, b) => b.date.localeCompare(a.date))
        .slice(0, 14);

      setHistory(nextHistory);

      if (nextHistory.length > 0 && nextHistory[0].date === getTodayDate()) {
        setSunCount(nextHistory[0].count);
        return;
      }

      setSunCount(0);
    } catch (err) {
      setError(err instanceof Error ? err.message : "เกิดข้อผิดพลาดที่ไม่ทราบสาเหตุ");
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    void loadSunlightContext();
  }, [loadSunlightContext]);

  async function handleSave() {
    setError(null);
    setSuccessMessage("");

    try {
      setSaving(true);

      const score = sunCount > 0 ? 100 : 0;
      const point = sunCount > 0 ? 1 : 0;
      const achieved = point > 0;

      const response = await logsService.createDailyLog({
        user_id: userId ?? undefined,
        log_date: getTodayDate(),
        mood: "task-get-sunlight",
        energy: Math.max(1, Math.min(5, sunCount > 0 ? 3 + Math.min(sunCount, 2) : 1)),
        stress: achieved ? 1 : 4,
        note: JSON.stringify({
          entry_type: "mental_task",
          category: "mental",
          activity: "stress-level",
          task: "get-sunlight",
          score,
          payload: {
            sun_count: sunCount,
            point,
            achieved,
            is_daily: true,
          },
        }),
      });

      if (!response.success) {
        throw new Error(response.error || "ไม่สามารถบันทึกข้อมูลได้");
      }

      await syncStressLevelGoal(userId ?? undefined);
      await loadSunlightContext();

      setSuccessMessage(
        achieved
          ? `บันทึกสำเร็จ วันนี้ออกไปเจอแสงแดด ${sunCount} ครั้ง ได้ +1 คะแนน`
          : "บันทึกสำเร็จ วันนี้ยังไม่มีจำนวนครั้งที่บันทึก"
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "เกิดข้อผิดพลาดที่ไม่ทราบสาเหตุ");
    } finally {
      setSaving(false);
    }
  }

  return (
    <MobileShell>
      <div className="min-h-screen bg-[radial-gradient(circle_at_top_right,#fff6db_0%,#f7fdff_42%,#e8f7ef_100%)]">
        <AppHeader title="ออกไปเจอแสงแดด" showBack showBell variant="soft" />
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
                  <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-[#fff8dd] text-[#966300] shadow-sm">
                    <Sun size={18} />
                  </span>
                  <div className="min-w-0">
                    <h2 className="text-lg font-semibold text-slate-900">{config?.label ?? "ออกไปเจอแสงแดด"}</h2>
                    <p className="mt-1 text-sm text-slate-500">{config?.subtitle}</p>
                  </div>
                </div>
                {config?.helperText ? <p className="mt-3 text-sm text-slate-500">{config.helperText}</p> : null}
              </div>
              <span
                className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                  todayScore > 0 ? "bg-emerald-50 text-emerald-700" : "bg-rose-50 text-rose-700"
                }`}
              >
                {todayScore > 0 ? "วันนี้ +1 คะแนน" : "วันนี้ 0 คะแนน"}
              </span>
            </div>

            <div className="mt-5 rounded-[28px] border border-[#f5ebcf] bg-[linear-gradient(180deg,#fffdf4_0%,#fff7de_100%)] p-4">
              <p className="text-center text-sm text-slate-500">จำนวนครั้งที่ได้ออกไปเจอแสงแดดในวันนี้</p>
              <div className="mt-4 flex items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={() => setSunCount((prev) => Math.max(prev - 1, 0))}
                  className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-slate-200 bg-white text-xl font-semibold text-slate-700"
                  aria-label="ลดจำนวนครั้ง"
                >
                  -
                </button>

                <div className="min-w-[112px] rounded-2xl bg-white px-5 py-3 text-center shadow-sm">
                  <p className="text-3xl font-bold text-slate-900">{sunCount}</p>
                  <p className="text-xs text-slate-500">ครั้ง</p>
                </div>

                <button
                  type="button"
                  onClick={() => setSunCount((prev) => Math.min(prev + 1, 30))}
                  className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-slate-200 bg-white text-xl font-semibold text-slate-700"
                  aria-label="เพิ่มจำนวนครั้ง"
                >
                  +
                </button>
              </div>

              <div className="mt-4 flex flex-wrap justify-center gap-2">
                {[1, 2, 3, 5].map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => setSunCount(preset)}
                    className={`rounded-full border px-3 py-1.5 text-xs font-medium ${
                      sunCount === preset
                        ? "border-[#dcb161] bg-[#fff2c8] text-[#9a6a10]"
                        : "border-slate-200 bg-white text-slate-600"
                    }`}
                  >
                    {preset} ครั้ง
                  </button>
                ))}
              </div>
            </div>
          </section>

          <button
            type="button"
            onClick={() => void handleSave()}
            disabled={saving || loading}
            className={`w-full rounded-2xl py-4 font-semibold text-white ${
              saving || loading ? "bg-slate-400" : "bg-[#c6968c]"
            }`}
          >
            {saving ? "กำลังบันทึก..." : "บันทึกการเจอแสงแดดวันนี้"}
          </button>

          <section className="rounded-3xl border border-white/70 bg-white/80 p-4 shadow-[0_18px_40px_rgba(31,47,61,0.1)] backdrop-blur">
            <div className="flex items-center justify-between gap-2">
              <h3 className="text-base font-semibold text-slate-900">ประวัติการบันทึกย้อนหลัง</h3>
              <span className="rounded-full bg-[#eef8f2] px-2.5 py-1 text-xs font-medium text-[#2f7b56]">
                รวม {monthlyPoints} คะแนน
              </span>
            </div>

            {loading ? (
              <p className="mt-3 text-sm text-slate-500">กำลังโหลดข้อมูลบันทึก...</p>
            ) : history.length === 0 ? (
              <p className="mt-3 text-sm text-slate-500">ยังไม่มีข้อมูลการเจอแสงแดดที่บันทึกไว้</p>
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
                    <p className="mt-1 text-xs text-slate-600">เจอแสงแดด {item.count} ครั้ง</p>
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
