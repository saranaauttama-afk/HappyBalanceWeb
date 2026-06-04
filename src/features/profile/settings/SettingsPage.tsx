import { Bell, ChevronRight, Droplets, MoonStar, Palette, Settings2, Smartphone } from "lucide-react";
import { Link } from "react-router-dom";
import AppHeader from "../../../components/layout/AppHeader";
import MobileShell from "../../../components/layout/MobileShell";
import InfoCard from "../../../components/ui/InfoCard";

const settingMenus = [
  {
    label: "การแจ้งเตือน",
    description: "กำหนดการแจ้งเตือนและการแจ้งเตือนต่างๆ",
    to: "/profile/settings/notifications",
    Icon: Bell,
    accent: "from-[#ffe8d1] via-[#fff5e8] to-white",
    iconBg: "bg-[#fff8ed]",
    iconColor: "text-[#d88d5c]",
  },
  {
    label: "รูปแบบการแสดงผล",
    description: "เลือกธีมและชุดสีของแอป",
    to: "/profile/settings/appearance",
    Icon: Palette,
    accent: "from-[#f3e8ff] via-[#faf5ff] to-white",
    iconBg: "bg-[#f9f5ff]",
    iconColor: "text-[#9333ea]",
  },
  {
    label: "เป้าหมายการนอนหลับ",
    description: "กำหนดจำนวนชั่วโมงการนอนหลับต่อวัน",
    to: "/profile/settings/sleep-goal",
    Icon: MoonStar,
    accent: "from-[#f2dbc7] via-[#f9ecd9] to-[#f4f8ff]",
    iconBg: "bg-[#fff3e7]",
    iconColor: "text-[#b9774e]",
  },
  {
    label: "เป้าหมายการดื่มน้ำ",
    description: "กำหนดเป้าหมายการดื่มน้ำต่อวัน",
    to: "/profile/settings/water-goal",
    Icon: Droplets,
    accent: "from-[#c7e8f5] via-[#dff4fb] to-[#f3fcff]",
    iconBg: "bg-[#e8f7ff]",
    iconColor: "text-[#3f7a96]",
  },
  {
    label: "จำกัดเวลาการใช้หน้าจอก่อนนอน",
    description: "กำหนดเวลาสูงสุดของการใช้หน้าจอก่อนเข้านอน",
    to: "/profile/settings/screen-time-goal",
    Icon: Smartphone,
    accent: "from-[#d6e5ff] via-[#e7f1ff] to-[#f5f9ff]",
    iconBg: "bg-[#edf4ff]",
    iconColor: "text-[#4a6da7]",
  },
];

const cardClassName =
  "border-white/70 bg-white/80 shadow-[0_18px_50px_rgba(31,47,61,0.12)] backdrop-blur";

export default function SettingsPage() {
  return (
    <MobileShell>
      <div className="relative min-h-screen overflow-hidden bg-[radial-gradient(circle_at_top_right,#fff6db_0%,#f7fdff_42%,#e8f7ef_100%)]">
        <div className="pointer-events-none absolute -left-20 top-10 h-56 w-56 rounded-full bg-[#ffc9a3]/20 blur-3xl" />
        <div className="pointer-events-none absolute -right-20 bottom-24 h-56 w-56 rounded-full bg-[#7dcdb8]/20 blur-3xl" />
        <div className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-white/45 to-transparent" />

        <AppHeader
          title="การตั้งค่า"
          subtitle="ตั้งค่าเป้าหมายประจำวันของคุณ"
          showBack
          showBell
          variant="soft"
          backTo="/profile"
        />

        <main className="relative z-10 space-y-4 px-4 py-6">
          <InfoCard className={`${cardClassName} rounded-3xl`}>
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <div className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-400 to-emerald-600 text-white shadow-lg shadow-emerald-200">
                  <Settings2 size={20} />
                </div>
                <p className="inline-flex rounded-full bg-[#e7f6f0] px-3 py-1 text-xs font-semibold tracking-[0.12em] text-[#1f6658]">
                  SETTINGS
                </p>
              </div>
              <h2 className="text-xl font-bold text-slate-900">
                ปรับแต่งให้เหมาะกับคุณ
              </h2>
              <p className="text-sm leading-6 text-slate-500">
                กำหนดการแจ้งเตือน รูปแบบการแสดงผล และเป้าหมายประจำวัน เพื่อประสบการณ์ที่ดีที่สุด
              </p>

              <div className="mt-4 grid grid-cols-3 gap-3 rounded-2xl bg-gradient-to-br from-slate-50 to-white p-3">
                <div className="text-center">
                  <p className="text-xs text-slate-500">การตั้งค่า</p>
                  <p className="mt-1 text-lg font-bold text-slate-900">{settingMenus.length}</p>
                </div>
                <div className="text-center">
                  <p className="text-xs text-slate-500">แอป</p>
                  <p className="mt-1 text-lg font-bold text-emerald-600">2</p>
                </div>
                <div className="text-center">
                  <p className="text-xs text-slate-500">เป้าหมาย</p>
                  <p className="mt-1 text-lg font-bold text-sky-600">3</p>
                </div>
              </div>
            </div>
          </InfoCard>

          <div className="space-y-2">
            <h3 className="px-1 text-sm font-semibold text-slate-700">การตั้งค่าแอป</h3>
            <div className="space-y-3">
              {settingMenus.slice(0, 2).map((item) => (
                <Link key={item.to} to={item.to} className="group block">
                  <InfoCard className={`${cardClassName} relative overflow-hidden rounded-3xl transition hover:shadow-xl hover:-translate-y-0.5`}>
                    <div
                      className={`pointer-events-none absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${item.accent}`}
                    />

                    <div className="flex items-center justify-between gap-4">
                      <div className="flex min-w-0 items-start gap-3">
                        <div
                          className={`mt-0.5 inline-flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl shadow-sm ${item.iconBg} ${item.iconColor}`}
                        >
                          <item.Icon size={20} />
                        </div>

                        <div className="min-w-0 flex-1">
                          <h2 className="text-base font-semibold text-slate-900">{item.label}</h2>
                          <p className="mt-1 text-sm leading-6 text-slate-500">{item.description}</p>
                        </div>
                      </div>

                      <ChevronRight
                        size={18}
                        className="text-slate-400 transition group-hover:translate-x-1 group-hover:text-slate-600"
                      />
                    </div>
                  </InfoCard>
                </Link>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <h3 className="px-1 text-sm font-semibold text-slate-700">เป้าหมายประจำวัน</h3>
            <div className="space-y-3">
              {settingMenus.slice(2).map((item) => (
                <Link key={item.to} to={item.to} className="group block">
                  <InfoCard className={`${cardClassName} relative overflow-hidden rounded-3xl transition hover:shadow-xl hover:-translate-y-0.5`}>
                    <div
                      className={`pointer-events-none absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${item.accent}`}
                    />

                    <div className="flex items-center justify-between gap-4">
                      <div className="flex min-w-0 items-start gap-3">
                        <div
                          className={`mt-0.5 inline-flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl shadow-sm ${item.iconBg} ${item.iconColor}`}
                        >
                          <item.Icon size={20} />
                        </div>

                        <div className="min-w-0 flex-1">
                          <h2 className="text-base font-semibold text-slate-900">{item.label}</h2>
                          <p className="mt-1 text-sm leading-6 text-slate-500">{item.description}</p>
                        </div>
                      </div>

                      <ChevronRight
                        size={18}
                        className="text-slate-400 transition group-hover:translate-x-1 group-hover:text-slate-600"
                      />
                    </div>
                  </InfoCard>
                </Link>
              ))}
            </div>
          </div>
        </main>
      </div>
    </MobileShell>
  );
}
