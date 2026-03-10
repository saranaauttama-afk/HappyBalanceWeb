import { Minus, Plus, Sparkles, Smartphone } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import AppHeader from "../../../components/layout/AppHeader";
import MobileShell from "../../../components/layout/MobileShell";
import { goalsService } from "../../../services/goals.service";
import type { Goal } from "../../../types/models";
import { getCurrentUserId } from "../../../utils/authSession";

const QUICK_PRESETS = [30, 45, 60, 90];

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

export default function ScreenTimeGoalPage() {
  const userId = getCurrentUserId();

  const [targetMinutes, setTargetMinutes] = useState(60);
  const [hasLoadedGoal, setHasLoadedGoal] = useState(false);
  const [existingGoalId, setExistingGoalId] = useState<string | null>(null);
  const [loadingGoal, setLoadingGoal] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState("");

  const loadGoal = useCallback(async () => {
    try {
      setLoadingGoal(true);
      setError(null);

      const response = await goalsService.listGoals(userId ?? undefined);
      if (!response.success) {
        throw new Error(response.error || "ไม่สามารถโหลดเป้าหมายได้");
      }

      const goals = response.data || [];
      const screenGoal = findLatestGoal(
        goals,
        (goal) => goal.category === "physical" && goal.activity === "limit-screen-time"
      );

      const savedTarget = Number(screenGoal?.target_value);
      if (Number.isFinite(savedTarget) && savedTarget > 0) {
        setTargetMinutes(Math.max(5, Math.round(savedTarget)));
      }

      setExistingGoalId(screenGoal?.id ?? null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "เกิดข้อผิดพลาดที่ไม่ทราบสาเหตุ");
    } finally {
      setLoadingGoal(false);
      setHasLoadedGoal(true);
    }
  }, [userId]);

  useEffect(() => {
    void loadGoal();
  }, [loadGoal]);

  async function handleSave() {
    setError(null);
    setSuccessMessage("");

    try {
      setSaving(true);

      const response = existingGoalId
        ? await goalsService.updateGoal({
            id: existingGoalId,
            category: "physical",
            activity: "limit-screen-time",
            target_value: targetMinutes,
            status: "active",
          })
        : await goalsService.createGoal({
            user_id: userId ?? undefined,
            category: "physical",
            activity: "limit-screen-time",
            current_value: 0,
            target_value: targetMinutes,
            status: "active",
          });

      if (!response.success) {
        throw new Error(response.error || "ไม่สามารถบันทึกเป้าหมายได้");
      }

      if (!existingGoalId && response.data?.id) {
        setExistingGoalId(response.data.id);
      }

      setSuccessMessage("บันทึกเป้าหน้าจอเรียบร้อย");
      await loadGoal();
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
        <div className="pointer-events-none absolute -left-20 top-14 h-56 w-56 rounded-full bg-[#d3e9ff]/30 blur-3xl" />
        <div className="pointer-events-none absolute -right-20 bottom-28 h-56 w-56 rounded-full bg-[#7dcdb8]/20 blur-3xl" />

        <AppHeader title="เป้าหน้าจอก่อนนอน" showBack showBell variant="soft" />

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

          <section className="rounded-3xl border border-white/70 bg-white/80 p-4 shadow-[0_18px_40px_rgba(31,47,61,0.1)] backdrop-blur">
            <div className="flex items-center gap-2 text-slate-900">
              <Smartphone size={18} />
              <h2 className="text-base font-semibold">ตั้งเป้าไม่เกิน (นาที/วัน)</h2>
            </div>

            <div className="mt-3 rounded-2xl bg-[#f2f9fd] px-3 py-3 text-center">
              {isInitialLoading ? (
                <div className="mx-auto h-8 w-24 animate-pulse rounded-lg bg-[#d3e7f2]" />
              ) : (
                <p className="text-2xl font-bold text-[#2e6a8b]">{targetMinutes} นาที</p>
              )}
            </div>

            <div className="mt-3 flex items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => setTargetMinutes((prev) => Math.max(prev - 5, 5))}
                className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 bg-slate-50 text-slate-700"
                aria-label="ลดเป้าหมายหน้าจอ"
              >
                <Minus size={16} />
              </button>

              <input
                type="number"
                min={5}
                max={240}
                value={targetMinutes}
                onChange={(event) => {
                  const next = Number(event.target.value);
                  if (!Number.isFinite(next)) return;
                  setTargetMinutes(Math.max(5, Math.round(next)));
                }}
                className="w-28 rounded-xl border border-slate-200 bg-[#f8fafc] px-3 py-2 text-center text-2xl font-bold text-slate-900"
              />

              <button
                type="button"
                onClick={() => setTargetMinutes((prev) => Math.min(prev + 5, 240))}
                className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 bg-slate-50 text-slate-700"
                aria-label="เพิ่มเป้าหมายหน้าจอ"
              >
                <Plus size={16} />
              </button>
            </div>

            <div className="mt-3 flex flex-wrap gap-2">
              {QUICK_PRESETS.map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => setTargetMinutes(preset)}
                  className={`rounded-full border px-3 py-1.5 text-xs font-medium ${
                    targetMinutes === preset
                      ? "border-[#6ea8c5] bg-[#e9f5fb] text-[#1f6a8c]"
                      : "border-slate-200 bg-white text-slate-600"
                  }`}
                >
                  {preset} นาที
                </button>
              ))}
            </div>
          </section>

          <button
            type="button"
            onClick={() => void handleSave()}
            disabled={saving || loadingGoal}
            className={`w-full rounded-2xl py-3 font-semibold text-white ${
              saving || loadingGoal ? "cursor-not-allowed bg-slate-400" : "bg-[#6ea8c5]"
            }`}
          >
            {saving ? "กำลังบันทึก..." : loadingGoal ? "กำลังโหลด..." : "บันทึกเป้าหมาย"}
          </button>

          <div className="rounded-2xl border border-white/70 bg-white/70 p-3 text-xs text-slate-500">
            <span className="inline-flex items-center gap-1 text-slate-700">
              <Sparkles size={14} />
              หมายเหตุ:
            </span>{" "}
            ใช้ข้อความสั้น: เป้าหน้าจอไม่เกินก่อนนอน
          </div>
        </main>
      </div>
    </MobileShell>
  );
}
