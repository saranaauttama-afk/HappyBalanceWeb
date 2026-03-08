import { MoonStar } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import AppHeader from "../../../components/layout/AppHeader";
import MobileShell from "../../../components/layout/MobileShell";
import InfoCard from "../../../components/ui/InfoCard";
import TimeWheelPicker from "../../../components/ui/TimeWheelPicker";
import { profileService } from "../../../services/profile.service";
import { getCurrentUserId } from "../../../utils/authSession";

function pad(value: number) {
  return String(value).padStart(2, "0");
}

function toPositiveInt(value: unknown) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed <= 0) return 0;
  return Math.round(parsed);
}

export default function SleepGoalSettingsPage() {
  const userId = getCurrentUserId();
  const [sleepHour, setSleepHour] = useState(8);
  const [sleepMinute, setSleepMinute] = useState(0);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState("");

  const sleepLabel = useMemo(
    () => `${pad(sleepHour)}:${pad(sleepMinute)} ชั่วโมง`,
    [sleepHour, sleepMinute]
  );

  useEffect(() => {
    async function loadSetting() {
      try {
        setLoading(true);
        setError(null);

        const response = await profileService.getUser(userId ?? undefined);
        if (!response.success) {
          throw new Error(response.error || "ไม่สามารถโหลดเป้าหมายการนอนได้");
        }

        const totalMinutes = toPositiveInt(response.data?.sleep_goal_minutes);
        if (totalMinutes > 0) {
          const hour = Math.min(23, Math.floor(totalMinutes / 60));
          const minute = totalMinutes % 60;
          setSleepHour(hour);
          setSleepMinute(minute);
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

    const sleepGoalMinutes = sleepHour * 60 + sleepMinute;
    if (sleepGoalMinutes <= 0) {
      setError("กรุณาระบุเป้าหมายการนอนมากกว่า 0 นาที");
      return;
    }

    try {
      setSaving(true);
      const response = await profileService.updateProfile({
        id: userId ?? undefined,
        sleep_goal_minutes: sleepGoalMinutes,
      });

      if (!response.success) {
        throw new Error(response.error || "ไม่สามารถบันทึกเป้าหมายการนอนได้");
      }

      setSuccessMessage("บันทึกเป้าหมายการนอนเรียบร้อยแล้ว");
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
          title="เป้าหมายการนอนหลับ"
          subtitle="กำหนดเวลานอนที่เหมาะสมต่อวัน"
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
                <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-[#fff3e7] text-[#b9774e]">
                  <MoonStar size={18} />
                </span>

                <div>
                  <h1 className="text-lg font-semibold text-slate-900">เวลานอนเป้าหมาย</h1>
                  <p className="text-sm text-slate-500">แนะนำอย่างน้อย 7-8 ชั่วโมงต่อวัน</p>
                </div>
              </div>

              <div className="rounded-3xl bg-[linear-gradient(180deg,#fffdf8_0%,#f8fbff_100%)] px-3 py-5">
                {loading ? (
                  <p className="text-center text-sm text-slate-500">กำลังโหลดเป้าหมาย...</p>
                ) : (
                  <TimeWheelPicker
                    hour={sleepHour}
                    minute={sleepMinute}
                    onHourChange={setSleepHour}
                    onMinuteChange={setSleepMinute}
                  />
                )}
              </div>

              <div className="rounded-2xl bg-white/80 px-4 py-3 text-center">
                <p className="text-xs text-slate-500">เป้าหมายปัจจุบัน</p>
                <p className="mt-1 text-xl font-semibold text-slate-900">{sleepLabel}</p>
              </div>
            </div>
          </InfoCard>

          <button
            type="button"
            onClick={() => void handleSave()}
            disabled={loading || saving}
            className={`w-full rounded-2xl py-4 font-semibold text-white transition ${
              loading || saving
                ? "cursor-not-allowed bg-slate-300"
                : "bg-[#d88d80] shadow-[0_14px_30px_rgba(216,141,128,0.35)] hover:brightness-105"
            }`}
          >
            {saving ? "กำลังบันทึก..." : "บันทึกเป้าหมายการนอน"}
          </button>
        </main>
      </div>
    </MobileShell>
  );
}
