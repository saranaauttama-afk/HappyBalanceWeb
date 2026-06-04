import { CheckCircle2, Monitor, Moon, Palette, Sun } from "lucide-react";
import { useEffect, useState } from "react";
import AppHeader from "../../../components/layout/AppHeader";
import MobileShell from "../../../components/layout/MobileShell";
import InfoCard from "../../../components/ui/InfoCard";

const cardClassName =
  "border-white/70 bg-white/80 shadow-[0_18px_50px_rgba(31,47,61,0.12)] backdrop-blur";

type Theme = "light" | "dark" | "system";
type ColorScheme = "default" | "blue" | "purple" | "green";

export default function AppearanceSettingsPage() {
  const [theme, setTheme] = useState<Theme>("light");
  const [colorScheme, setColorScheme] = useState<ColorScheme>("default");
  const [saving, setSaving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    // Load settings from localStorage
    const savedTheme = localStorage.getItem("theme") as Theme | null;
    const savedColorScheme = localStorage.getItem("colorScheme") as ColorScheme | null;

    if (savedTheme) setTheme(savedTheme);
    if (savedColorScheme) setColorScheme(savedColorScheme);
  }, []);

  function handleSave() {
    setSaving(true);
    localStorage.setItem("theme", theme);
    localStorage.setItem("colorScheme", colorScheme);

    // Apply theme (in real app, would apply to root element)
    // document.documentElement.setAttribute('data-theme', theme);
    // document.documentElement.setAttribute('data-color-scheme', colorScheme);

    setTimeout(() => {
      setSaving(false);
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    }, 500);
  }

  const themeOptions = [
    {
      value: "light" as const,
      label: "สว่าง",
      description: "ใช้ธีมสีสว่างตลอดเวลา",
      Icon: Sun,
      bg: "bg-amber-50",
      iconColor: "text-amber-600",
    },
    {
      value: "dark" as const,
      label: "มืด",
      description: "ใช้ธีมสีมืดตลอดเวลา",
      Icon: Moon,
      bg: "bg-slate-700",
      iconColor: "text-slate-200",
    },
    {
      value: "system" as const,
      label: "ตามระบบ",
      description: "ปรับตามการตั้งค่าของอุปกรณ์",
      Icon: Monitor,
      bg: "bg-sky-50",
      iconColor: "text-sky-600",
    },
  ];

  const colorSchemeOptions = [
    {
      value: "default" as const,
      label: "ค่าเริ่มต้น",
      colors: ["#f8c6a3", "#d7f2e8", "#f9e6a8"],
    },
    {
      value: "blue" as const,
      label: "น้ำเงิน",
      colors: ["#93c5fd", "#60a5fa", "#3b82f6"],
    },
    {
      value: "purple" as const,
      label: "ม่วง",
      colors: ["#d8b4fe", "#c084fc", "#a855f7"],
    },
    {
      value: "green" as const,
      label: "เขียว",
      colors: ["#86efac", "#4ade80", "#22c55e"],
    },
  ];

  return (
    <MobileShell>
      <div className="relative min-h-screen overflow-hidden bg-[radial-gradient(circle_at_top_right,#fff6db_0%,#f7fdff_42%,#e8f7ef_100%)]">
        <div className="pointer-events-none absolute -left-20 top-10 h-56 w-56 rounded-full bg-[#ffc9a3]/20 blur-3xl" />
        <div className="pointer-events-none absolute -right-20 bottom-24 h-56 w-56 rounded-full bg-[#7dcdb8]/20 blur-3xl" />
        <div className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-white/45 to-transparent" />

        <AppHeader
          title="รูปแบบการแสดงผล"
          subtitle="กำหนดธีมและสีของแอป"
          showBack
          showBell
          variant="soft"
          backTo="/profile/settings"
        />

        <main className="relative z-10 space-y-4 px-4 py-6">
          <InfoCard className={`${cardClassName} rounded-3xl`}>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-[#f3e8ff] text-[#9333ea]">
                  <Palette size={18} />
                </div>
                <p className="inline-flex rounded-full bg-[#f3e8ff] px-3 py-1 text-xs font-semibold tracking-[0.12em] text-[#9333ea]">
                  APPEARANCE
                </p>
              </div>
              <h2 className="text-lg font-semibold text-slate-900">
                ปรับแต่งรูปแบบ
              </h2>
              <p className="text-sm leading-6 text-slate-500">
                เลือกธีมและชุดสีที่เหมาะกับสไตล์ของคุณ
              </p>
            </div>
          </InfoCard>

          {/* Theme Selection */}
          <div className="space-y-2">
            <h3 className="px-1 text-sm font-semibold text-slate-700">ธีมสี</h3>
            <div className="space-y-2">
              {themeOptions.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setTheme(option.value)}
                  className="block w-full text-left"
                >
                  <InfoCard
                    className={`${cardClassName} relative overflow-hidden rounded-3xl transition hover:shadow-xl ${
                      theme === option.value ? "ring-2 ring-emerald-500" : ""
                    }`}
                  >
                    <div
                      className={`pointer-events-none absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${
                        theme === option.value
                          ? "from-emerald-400 via-emerald-300 to-emerald-200"
                          : "from-slate-200 via-slate-100 to-white"
                      }`}
                    />

                    <div className="flex items-center justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <div
                          className={`inline-flex h-10 w-10 items-center justify-center rounded-xl ${option.bg}`}
                        >
                          <option.Icon size={20} className={option.iconColor} />
                        </div>
                        <div>
                          <h4 className="text-base font-semibold text-slate-900">
                            {option.label}
                          </h4>
                          <p className="text-sm text-slate-500">{option.description}</p>
                        </div>
                      </div>

                      {theme === option.value && (
                        <CheckCircle2 size={22} className="flex-shrink-0 text-emerald-600" />
                      )}
                    </div>
                  </InfoCard>
                </button>
              ))}
            </div>
          </div>

          {/* Color Scheme Selection */}
          <div className="space-y-2">
            <h3 className="px-1 text-sm font-semibold text-slate-700">ชุดสี</h3>
            <div className="grid grid-cols-2 gap-3">
              {colorSchemeOptions.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setColorScheme(option.value)}
                  className="block w-full"
                >
                  <InfoCard
                    className={`${cardClassName} relative overflow-hidden rounded-3xl transition hover:shadow-xl ${
                      colorScheme === option.value ? "ring-2 ring-emerald-500" : ""
                    }`}
                  >
                    <div className="space-y-3">
                      <div className="flex gap-1">
                        {option.colors.map((color, index) => (
                          <div
                            key={index}
                            className="h-8 flex-1 rounded-lg"
                            style={{ backgroundColor: color }}
                          />
                        ))}
                      </div>

                      <div className="flex items-center justify-between">
                        <p className="text-sm font-semibold text-slate-800">
                          {option.label}
                        </p>
                        {colorScheme === option.value && (
                          <CheckCircle2 size={18} className="text-emerald-600" />
                        )}
                      </div>
                    </div>
                  </InfoCard>
                </button>
              ))}
            </div>
          </div>

          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className={`w-full rounded-2xl bg-gradient-to-r from-[#9333ea] to-[#7e22ce] px-6 py-3.5 font-semibold text-white shadow-lg transition hover:shadow-xl ${
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
