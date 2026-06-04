import { Bell, CheckCircle2, Info } from "lucide-react";
import { useEffect, useState } from "react";
import AppHeader from "../../../components/layout/AppHeader";
import MobileShell from "../../../components/layout/MobileShell";
import InfoCard from "../../../components/ui/InfoCard";

const cardClassName =
  "border-white/70 bg-white/80 shadow-[0_18px_50px_rgba(31,47,61,0.12)] backdrop-blur";

type NotificationSettings = {
  dailyReminder: boolean;
  taskReminder: boolean;
  weeklyReport: boolean;
  goalAchievement: boolean;
  counselingReminder: boolean;
};

export default function NotificationSettingsPage() {
  const [settings, setSettings] = useState<NotificationSettings>({
    dailyReminder: true,
    taskReminder: true,
    weeklyReport: true,
    goalAchievement: true,
    counselingReminder: true,
  });
  const [saving, setSaving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    // Load settings from localStorage
    const savedSettings = localStorage.getItem("notificationSettings");
    if (savedSettings) {
      try {
        setSettings(JSON.parse(savedSettings));
      } catch {
        // Use default settings
      }
    }
  }, []);

  function handleToggle(key: keyof NotificationSettings) {
    setSettings((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  }

  function handleSave() {
    setSaving(true);
    // Save to localStorage (in real app, would save to backend)
    localStorage.setItem("notificationSettings", JSON.stringify(settings));

    setTimeout(() => {
      setSaving(false);
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    }, 500);
  }

  const notificationOptions = [
    {
      key: "dailyReminder" as const,
      label: "การแจ้งเตือนรายวัน",
      description: "แจ้งเตือนให้บันทึกอารมณ์และกิจกรรมประจำวัน",
    },
    {
      key: "taskReminder" as const,
      label: "การแจ้งเตือนงาน",
      description: "แจ้งเตือนเมื่อถึงเวลาทำกิจกรรมที่กำหนดไว้",
    },
    {
      key: "weeklyReport" as const,
      label: "รายงานสัปดาห์",
      description: "ส่งสรุปความก้าวหน้าประจำสัปดาห์",
    },
    {
      key: "goalAchievement" as const,
      label: "ความสำเร็จของเป้าหมาย",
      description: "แจ้งเตือนเมื่อบรรลุเป้าหมายหรือได้รับคะแนน",
    },
    {
      key: "counselingReminder" as const,
      label: "นัดหมายให้คำปรึกษา",
      description: "แจ้งเตือนก่อนถึงเวลานัดหมายให้คำปรึกษา",
    },
  ];

  return (
    <MobileShell>
      <div className="relative min-h-screen overflow-hidden bg-[radial-gradient(circle_at_top_right,#fff6db_0%,#f7fdff_42%,#e8f7ef_100%)]">
        <div className="pointer-events-none absolute -left-20 top-10 h-56 w-56 rounded-full bg-[#ffc9a3]/20 blur-3xl" />
        <div className="pointer-events-none absolute -right-20 bottom-24 h-56 w-56 rounded-full bg-[#7dcdb8]/20 blur-3xl" />
        <div className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-white/45 to-transparent" />

        <AppHeader
          title="การแจ้งเตือน"
          subtitle="กำหนดการแจ้งเตือนที่คุณต้องการ"
          showBack
          showBell
          variant="soft"
          backTo="/profile/settings"
        />

        <main className="relative z-10 space-y-4 px-4 py-6">
          <InfoCard className={`${cardClassName} rounded-3xl`}>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-[#fff8ed] text-[#d88d5c]">
                  <Bell size={18} />
                </div>
                <p className="inline-flex rounded-full bg-[#fff8ed] px-3 py-1 text-xs font-semibold tracking-[0.12em] text-[#d88d5c]">
                  NOTIFICATIONS
                </p>
              </div>
              <h2 className="text-lg font-semibold text-slate-900">
                จัดการการแจ้งเตือน
              </h2>
              <p className="text-sm leading-6 text-slate-500">
                เลือกประเภทการแจ้งเตือนที่คุณต้องการรับ เพื่อไม่พลาดทุกความก้าวหน้าและกิจกรรมสำคัญ
              </p>
            </div>
          </InfoCard>

          <div className="space-y-3">
            {notificationOptions.map((option) => (
              <InfoCard
                key={option.key}
                className={`${cardClassName} relative overflow-hidden rounded-3xl`}
              >
                <div className="pointer-events-none absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-[#ffe8d1] via-[#fff5e8] to-white" />

                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    <h3 className="text-base font-semibold text-slate-900">
                      {option.label}
                    </h3>
                    <p className="mt-1 text-sm leading-6 text-slate-500">
                      {option.description}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleToggle(option.key)}
                    className={`relative h-7 w-12 flex-shrink-0 rounded-full transition ${
                      settings[option.key]
                        ? "bg-emerald-500"
                        : "bg-slate-300"
                    }`}
                    aria-label={`Toggle ${option.label}`}
                  >
                    <span
                      className={`absolute top-1 h-5 w-5 rounded-full bg-white shadow-md transition ${
                        settings[option.key]
                          ? "right-1"
                          : "left-1"
                      }`}
                    />
                  </button>
                </div>
              </InfoCard>
            ))}
          </div>

          <InfoCard className={`${cardClassName} rounded-2xl`}>
            <div className="flex items-start gap-3">
              <Info size={18} className="mt-0.5 flex-shrink-0 text-sky-500" />
              <div className="min-w-0 flex-1">
                <p className="text-xs leading-6 text-slate-600">
                  การแจ้งเตือนจะถูกส่งผ่านทางเว็บเบราว์เซอร์ คุณอาจต้องอนุญาตการแจ้งเตือนในเบราว์เซอร์ของคุณ
                </p>
              </div>
            </div>
          </InfoCard>

          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className={`w-full rounded-2xl bg-gradient-to-r from-[#d88d5c] to-[#c67d4e] px-6 py-3.5 font-semibold text-white shadow-lg transition hover:shadow-xl ${
              saving ? "cursor-not-allowed opacity-70" : ""
            }`}
          >
            {saving ? "กำลังบันทึก..." : "บันทึกการตั้งค่า"}
          </button>

          {showSuccess && (
            <InfoCard className={`${cardClassName} rounded-2xl border-emerald-200 bg-emerald-50/80`}>
              <div className="flex items-center gap-3">
                <CheckCircle2 size={20} className="flex-shrink-0 text-emerald-600" />
                <p className="text-sm font-medium text-emerald-700">
                  บันทึกการตั้งค่าเรียบร้อยแล้ว
                </p>
              </div>
            </InfoCard>
          )}
        </main>
      </div>
    </MobileShell>
  );
}
