import { Droplets } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import AppHeader from "../../../components/layout/AppHeader";
import MobileShell from "../../../components/layout/MobileShell";
import InfoCard from "../../../components/ui/InfoCard";
import { profileService } from "../../../services/profile.service";
import { getCurrentUserId } from "../../../utils/authSession";

function calculateWaterGoal(weightKg: number) {
  if (!weightKg || Number.isNaN(weightKg) || weightKg <= 0) {
    return 0;
  }

  return Math.round(weightKg * 2.2 * 30);
}

function toPositiveNumber(value: unknown) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed <= 0) return 0;
  return parsed;
}

export default function WaterGoalSettingsPage() {
  const userId = getCurrentUserId();
  const [weight, setWeight] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState("");

  const waterGoalMl = useMemo(() => {
    return calculateWaterGoal(Number(weight));
  }, [weight]);

  const waterGoalLiter = useMemo(() => {
    if (waterGoalMl <= 0) return "";
    return (waterGoalMl / 1000).toFixed(1);
  }, [waterGoalMl]);

  useEffect(() => {
    async function loadSetting() {
      try {
        setLoading(true);
        setError(null);

        const response = await profileService.getUser(userId ?? undefined);
        if (!response.success) {
          throw new Error(response.error || "ไม่สามารถโหลดเป้าหมายการดื่มน้ำได้");
        }

        const storedMl = toPositiveNumber(response.data?.water_goal_ml);
        if (storedMl > 0) {
          const estimatedWeight = storedMl / (2.2 * 30);
          setWeight(estimatedWeight.toFixed(1));
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "เกิดข้อผิดพลาดที่ไม่ทราบสาเหตุ");
      } finally {
        setLoading(false);
      }
    }

    void loadSetting();
  }, [userId]);

  async function handleSave() {
    setError(null);
    setSuccessMessage("");

    if (waterGoalMl <= 0) {
      setError("กรุณากรอกน้ำหนักเพื่อคำนวณเป้าหมายการดื่มน้ำ");
      return;
    }

    try {
      setSaving(true);
      const response = await profileService.updateProfile({
        id: userId ?? undefined,
        water_goal_ml: waterGoalMl,
      });

      if (!response.success) {
        throw new Error(response.error || "ไม่สามารถบันทึกเป้าหมายการดื่มน้ำได้");
      }

      setSuccessMessage("บันทึกเป้าหมายการดื่มน้ำเรียบร้อยแล้ว");
    } catch (err) {
      setError(err instanceof Error ? err.message : "เกิดข้อผิดพลาดที่ไม่ทราบสาเหตุ");
    } finally {
      setSaving(false);
    }
  }

  return (
    <MobileShell>
      <div className="relative min-h-screen overflow-hidden bg-[radial-gradient(circle_at_top_right,#fff6db_0%,#f7fdff_42%,#e8f7ef_100%)]">
        <div className="pointer-events-none absolute -left-20 top-10 h-56 w-56 rounded-full bg-[#ffc9a3]/20 blur-3xl" />
        <div className="pointer-events-none absolute -right-20 bottom-24 h-56 w-56 rounded-full bg-[#7dcdb8]/20 blur-3xl" />
        <div className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-white/45 to-transparent" />

        <AppHeader
          title="เป้าหมายการดื่มน้ำ"
          subtitle="คำนวณปริมาณน้ำที่เหมาะสมต่อวัน"
          showBack
          showBell
          variant="soft"
        />

        <main className="relative z-10 space-y-4 px-4 py-6">
          {error ? (
            <div className="rounded-2xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">
              {error}
            </div>
          ) : null}

          {successMessage ? (
            <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-700">
              {successMessage}
            </div>
          ) : null}

          <InfoCard className="rounded-3xl border-white/70 bg-white/85 shadow-[0_18px_50px_rgba(31,47,61,0.12)] backdrop-blur">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-[#e8f7ff] text-[#3f7a96]">
                  <Droplets size={18} />
                </span>

                <div>
                  <h1 className="text-lg font-semibold text-slate-900">คำนวณเป้าหมายการดื่มน้ำ</h1>
                  <p className="text-sm text-slate-500">ใส่น้ำหนักตัวเพื่อคำนวณปริมาณน้ำที่เหมาะสม</p>
                </div>
              </div>

              <div className="rounded-3xl bg-[linear-gradient(180deg,#eef8ff_0%,#f7fcff_100%)] p-4">
                <label htmlFor="weight-input" className="mb-2 block text-sm font-medium text-slate-700">
                  น้ำหนักตัว (กิโลกรัม)
                </label>
                <input
                  id="weight-input"
                  type="number"
                  min="1"
                  disabled={loading}
                  value={weight}
                  onChange={(e) => setWeight(e.target.value)}
                  placeholder="เช่น 60"
                  className={`w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none focus:border-[#73a8c3] ${
                    loading ? "cursor-not-allowed bg-slate-100 text-slate-400" : ""
                  }`}
                />
                <p className="mt-2 text-xs text-slate-500">สูตรคำนวณ: น้ำหนัก x 2.2 x 30</p>
              </div>

              <div className="rounded-2xl bg-white/80 px-4 py-4 text-center">
                <p className="text-xs text-slate-500">เป้าหมายรายวัน</p>
                <p className="mt-1 text-2xl font-semibold text-slate-900">
                  {waterGoalMl > 0 ? `${waterGoalMl.toLocaleString()} มิลลิลิตร` : "-"}
                </p>
                <p className="mt-1 text-sm text-slate-500">
                  {loading
                    ? "กำลังโหลดเป้าหมาย..."
                    : waterGoalLiter
                    ? `ประมาณ ${waterGoalLiter} ลิตร`
                    : "กรอกน้ำหนักเพื่อคำนวณ"}
                </p>
              </div>
            </div>
          </InfoCard>

          <button
            type="button"
            onClick={() => void handleSave()}
            disabled={loading || saving || waterGoalMl <= 0}
            className={`w-full rounded-2xl py-4 font-semibold text-white transition ${
              loading || saving || waterGoalMl <= 0
                ? "cursor-not-allowed bg-slate-300"
                : "bg-[#d88d80] shadow-[0_14px_30px_rgba(216,141,128,0.35)] hover:brightness-105"
            }`}
          >
            {saving ? "กำลังบันทึก..." : "บันทึกเป้าหมายการดื่มน้ำ"}
          </button>
        </main>
      </div>
    </MobileShell>
  );
}
