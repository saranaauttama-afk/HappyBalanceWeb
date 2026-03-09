import { Clock3, Minus, MoonStar, Plus, Sparkles } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import AppHeader from "../../../components/layout/AppHeader";
import MobileShell from "../../../components/layout/MobileShell";
import { goalsService } from "../../../services/goals.service";
import type { Goal } from "../../../types/models";
import { getCurrentUserId } from "../../../utils/authSession";

const QUICK_PRESETS = [
  { hour: 6, minute: 30, label: "6 ชม. 30 นาที" },
  { hour: 7, minute: 0, label: "7 ชม." },
  { hour: 8, minute: 0, label: "8 ชม." },
  { hour: 9, minute: 0, label: "9 ชม." },
];

function format(value: number) {
  return value.toString().padStart(2, "0");
}

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

function toHourMinute(targetHours: number) {
  const safeTarget = Number.isFinite(targetHours) ? targetHours : 8;
  const rawHour = Math.floor(safeTarget);
  const rawMinute = Math.round(((safeTarget - rawHour) * 60) / 5) * 5;
  const carryHour = rawMinute >= 60 ? 1 : 0;
  const minute = rawMinute >= 60 ? 0 : rawMinute;
  const hour = rawHour + carryHour;

  return {
    hour: clamp(hour, 0, 23),
    minute: clamp(minute, 0, 55),
  };
}

function getGoalTimestamp(goal: Goal) {
  const updatedAt = goal.updated_at ? new Date(goal.updated_at).getTime() : Number.NaN;
  if (Number.isFinite(updatedAt)) return updatedAt;

  const createdAt = goal.created_at ? new Date(goal.created_at).getTime() : Number.NaN;
  if (Number.isFinite(createdAt)) return createdAt;

  return 0;
}

function findLatestGoal(goals: Goal[], matcher: (goal: Goal) => boolean) {
  const filtered = goals.filter(matcher);
  if (filtered.length === 0) return null;

  return filtered.sort((a, b) => getGoalTimestamp(b) - getGoalTimestamp(a))[0];
}

export default function SleepGoalPage() {
  const userId = getCurrentUserId();

  const [hour, setHour] = useState(8);
  const [minute, setMinute] = useState(0);
  const [hasLoadedGoal, setHasLoadedGoal] = useState(false);
  const [existingSleepGoalId, setExistingSleepGoalId] = useState<string | null>(null);
  const [loadingGoal, setLoadingGoal] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState("");

  const loadSleepGoal = useCallback(async () => {
    try {
      setLoadingGoal(true);
      setError(null);

      const response = await goalsService.listGoals(userId ?? undefined);
      if (!response.success) {
        throw new Error(response.error || "ไม่สามารถโหลดเป้าหมายการนอนได้");
      }

      const goals = response.data || [];
      const sleepGoal = findLatestGoal(
        goals,
        (goal) => goal.category === "physical" && goal.activity === "sleep"
      );
      const legacyRestGoal = findLatestGoal(
        goals,
        (goal) =>
          goal.category === "physical" &&
          goal.activity === "rest" &&
          Number(goal.target_value) > 0 &&
          Number(goal.target_value) <= 24
      );
      const selectedGoal = sleepGoal ?? legacyRestGoal;
      const targetHours = Number(selectedGoal?.target_value);

      if (Number.isFinite(targetHours) && targetHours > 0) {
        const parsed = toHourMinute(targetHours);
        setHour(parsed.hour);
        setMinute(parsed.minute);
      }

      setExistingSleepGoalId(sleepGoal?.id ?? null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "เกิดข้อผิดพลาดที่ไม่ทราบสาเหตุ");
    } finally {
      setLoadingGoal(false);
      setHasLoadedGoal(true);
    }
  }, [userId]);

  useEffect(() => {
    void loadSleepGoal();
  }, [loadSleepGoal]);

  function adjustHour(delta: number) {
    setHour((prev) => {
      const next = prev + delta;
      if (next < 0) return 23;
      if (next > 23) return 0;
      return next;
    });
  }

  function adjustMinute(delta: number) {
    setMinute((prev) => {
      const next = prev + delta;
      if (next < 0) return 55;
      if (next > 55) return 0;
      return next;
    });
  }

  async function handleSave() {
    setError(null);
    setSuccessMessage("");

    const targetValue = Number((hour + minute / 60).toFixed(2));

    try {
      setSaving(true);
      const response = existingSleepGoalId
        ? await goalsService.updateGoal({
            id: existingSleepGoalId,
            category: "physical",
            activity: "sleep",
            target_value: targetValue,
            status: "active",
          })
        : await goalsService.createGoal({
            user_id: userId ?? undefined,
            category: "physical",
            activity: "sleep",
            current_value: 0,
            target_value: targetValue,
            status: "active",
          });

      if (!response.success) {
        throw new Error(response.error || "ไม่สามารถบันทึกเป้าหมายการนอนได้");
      }

      if (!existingSleepGoalId && response.data?.id) {
        setExistingSleepGoalId(response.data.id);
      }

      setSuccessMessage("บันทึกเป้าหมายการนอนเรียบร้อยแล้ว (goals: physical/sleep)");
      await loadSleepGoal();
    } catch (err) {
      setError(err instanceof Error ? err.message : "เกิดข้อผิดพลาดที่ไม่ทราบสาเหตุ");
    } finally {
      setSaving(false);
    }
  }

  const isInitialLoading = loadingGoal && !hasLoadedGoal;

  return (
    <MobileShell>
      <div className="relative min-h-screen overflow-hidden bg-[radial-gradient(circle_at_top_right,#fff6db_0%,#f7fdff_42%,#e8f7ef_100%)]">
        <div className="pointer-events-none absolute -left-20 top-14 h-56 w-56 rounded-full bg-[#ffc9a3]/20 blur-3xl" />
        <div className="pointer-events-none absolute -right-20 bottom-28 h-56 w-56 rounded-full bg-[#7dcdb8]/20 blur-3xl" />

        <AppHeader title="เป้าหมายการนอนหลับ" showBack showBell variant="soft" />

        <main className="relative z-10 space-y-4 px-4 py-4">
          {error ? (
            <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
              {error}
            </div>
          ) : null}

          {successMessage ? (
            <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700">
              {successMessage}
            </div>
          ) : null}

          <section className="relative overflow-hidden rounded-[28px] border border-white/80 bg-[linear-gradient(145deg,rgba(255,255,255,0.9)_0%,rgba(245,253,255,0.86)_48%,rgba(237,251,243,0.88)_100%)] p-5 shadow-[0_22px_48px_rgba(31,47,61,0.14)] backdrop-blur">
            <div className="pointer-events-none absolute -right-16 -top-16 h-44 w-44 rounded-full bg-[#9ad4be]/20 blur-3xl" />
            <p className="text-xs font-semibold tracking-[0.14em] text-[#255f54]">SLEEP TARGET</p>
            <h2 className="mt-2 text-2xl font-extrabold leading-tight text-slate-900">ตั้งเป้าหมายการนอนของคุณ</h2>
            <p className="mt-2 text-sm text-slate-600">เวลานอนที่สม่ำเสมอช่วยให้ร่างกายฟื้นตัวดีขึ้นและลดความเหนื่อยล้าสะสม</p>

            <div className="mt-4 text-center">
              <div className="rounded-2xl bg-[#ecfdf3] px-2 py-3">
                <p className="text-xs text-slate-500">เวลาที่ตั้งไว้</p>
                {isInitialLoading ? (
                  <div className="mx-auto mt-1 h-7 w-24 animate-pulse rounded-lg bg-[#d8eadf]" />
                ) : (
                  <p className="text-lg font-bold text-[#166534]">{format(hour)}:{format(minute)}</p>
                )}
              </div>
            </div>
          </section>

          <section className="rounded-3xl border border-white/70 bg-white/80 p-4 shadow-[0_18px_40px_rgba(31,47,61,0.1)] backdrop-blur">
            <div className="mb-3 flex items-center gap-2 text-slate-900">
              <Clock3 size={18} />
              <h3 className="text-base font-semibold">เลือกชั่วโมงและนาที</h3>
            </div>

            {isInitialLoading ? (
              <div className="space-y-3">
                <div className="rounded-2xl bg-white p-4">
                  <div className="h-4 w-20 animate-pulse rounded bg-slate-200" />
                  <div className="mt-3 h-12 w-full animate-pulse rounded-xl bg-slate-100" />
                </div>
                <div className="rounded-2xl bg-white p-4">
                  <div className="h-4 w-16 animate-pulse rounded bg-slate-200" />
                  <div className="mt-3 h-12 w-full animate-pulse rounded-xl bg-slate-100" />
                </div>
                <p className="text-sm text-slate-500">กำลังโหลดเป้าหมายล่าสุด...</p>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-2xl bg-white p-3 text-center">
                    <p className="text-xs text-slate-500">ชั่วโมง</p>
                    <div className="mt-2 flex items-center justify-center gap-2">
                      <button
                        type="button"
                        onClick={() => adjustHour(-1)}
                        className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-slate-50 text-slate-700"
                        aria-label="ลดชั่วโมง"
                      >
                        <Minus size={16} />
                      </button>
                      <div className="min-w-[64px] rounded-xl bg-[#f8fafc] px-3 py-2 text-3xl font-bold text-slate-900">
                        {format(hour)}
                      </div>
                      <button
                        type="button"
                        onClick={() => adjustHour(1)}
                        className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-slate-50 text-slate-700"
                        aria-label="เพิ่มชั่วโมง"
                      >
                        <Plus size={16} />
                      </button>
                    </div>
                  </div>

                  <div className="rounded-2xl bg-white p-3 text-center">
                    <p className="text-xs text-slate-500">นาที</p>
                    <div className="mt-2 flex items-center justify-center gap-2">
                      <button
                        type="button"
                        onClick={() => adjustMinute(-5)}
                        className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-slate-50 text-slate-700"
                        aria-label="ลดนาที"
                      >
                        <Minus size={16} />
                      </button>
                      <div className="min-w-[64px] rounded-xl bg-[#f8fafc] px-3 py-2 text-3xl font-bold text-slate-900">
                        {format(minute)}
                      </div>
                      <button
                        type="button"
                        onClick={() => adjustMinute(5)}
                        className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-slate-50 text-slate-700"
                        aria-label="เพิ่มนาที"
                      >
                        <Plus size={16} />
                      </button>
                    </div>
                  </div>
                </div>

                <div className="mt-4 flex flex-wrap gap-2">
                  {QUICK_PRESETS.map((preset) => {
                    const isActive = preset.hour === hour && preset.minute === minute;
                    return (
                      <button
                        key={preset.label}
                        type="button"
                        onClick={() => {
                          setHour(preset.hour);
                          setMinute(preset.minute);
                        }}
                        className={`rounded-full border px-3 py-1.5 text-xs font-medium transition ${
                          isActive
                            ? "border-[#d88d80] bg-[#fff1e9] text-[#b46e44]"
                            : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                        }`}
                      >
                        {preset.label}
                      </button>
                    );
                  })}
                </div>
              </>
            )}

            <div className="mt-4 rounded-2xl bg-[#f7fbff] px-3 py-2 text-xs text-slate-600">
              <span className="inline-flex items-center gap-1 font-medium text-slate-700">
                <MoonStar size={14} />
                คำแนะนำ:
              </span>{" "}
              ผู้ใหญ่มักเหมาะกับการนอนประมาณ 7-9 ชั่วโมงต่อคืน
            </div>
          </section>

          <button
            type="button"
            onClick={() => void handleSave()}
            disabled={saving || loadingGoal}
            className={`w-full rounded-2xl py-3 font-semibold text-white transition ${
              saving || loadingGoal
                ? "cursor-not-allowed bg-slate-400"
                : "bg-[#d88d80] shadow-[0_14px_30px_rgba(216,141,128,0.35)] hover:brightness-105"
            }`}
          >
            {saving ? "กำลังบันทึก..." : loadingGoal ? "กำลังโหลด..." : "บันทึกเป้าหมายการนอน"}
          </button>

          <div className="rounded-2xl border border-white/70 bg-white/70 p-3 text-xs text-slate-500">
            <span className="inline-flex items-center gap-1 text-slate-700">
              <Sparkles size={14} />
              หมายเหตุ:
            </span>{" "}
            หลังบันทึกแล้ว ค่านี้จะใช้เป็นเป้าหมายรายวันเวลาให้คะแนนการนอน และอ้างอิงกับข้อมูลบันทึกใน
            daily_logs
          </div>
        </main>
      </div>
    </MobileShell>
  );
}

