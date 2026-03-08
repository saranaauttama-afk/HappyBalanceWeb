import { ChevronRight, Droplets, MoonStar } from "lucide-react";
import { Link } from "react-router-dom";
import AppHeader from "../../../components/layout/AppHeader";
import MobileShell from "../../../components/layout/MobileShell";
import InfoCard from "../../../components/ui/InfoCard";

const settingMenus = [
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
        />

        <main className="relative z-10 space-y-4 px-4 py-6">
          <InfoCard className={`${cardClassName} rounded-3xl`}>
            <div className="space-y-2">
              <p className="inline-flex rounded-full bg-[#e7f6f0] px-3 py-1 text-xs font-semibold tracking-[0.12em] text-[#1f6658]">
                DAILY SETTINGS
              </p>
              <h2 className="text-lg font-semibold text-slate-900">
                ปรับเป้าหมายให้เหมาะกับไลฟ์สไตล์ของคุณ
              </h2>
              <p className="text-sm leading-6 text-slate-500">
                ตั้งค่าเป้าหมายการนอนและการดื่มน้ำ เพื่อช่วยติดตามสุขสมดุลในทุกวันได้ง่ายขึ้น
              </p>
            </div>
          </InfoCard>

          <div className="space-y-3">
            {settingMenus.map((item) => (
              <Link key={item.to} to={item.to} className="group block">
                <InfoCard className={`${cardClassName} relative overflow-hidden rounded-3xl`}>
                  <div
                    className={`pointer-events-none absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${item.accent}`}
                  />

                  <div className="flex items-center justify-between gap-4">
                    <div className="flex min-w-0 items-start gap-3">
                      <div
                        className={`mt-0.5 inline-flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl ${item.iconBg} ${item.iconColor}`}
                      >
                        <item.Icon size={18} />
                      </div>

                      <div className="min-w-0 flex-1">
                        <h2 className="text-base font-semibold text-slate-900">
                          {item.label}
                        </h2>
                        <p className="mt-1 text-sm leading-6 text-slate-500">
                          {item.description}
                        </p>
                      </div>
                    </div>

                    <ChevronRight
                      size={18}
                      className="text-slate-400 transition group-hover:translate-x-0.5"
                    />
                  </div>
                </InfoCard>
              </Link>
            ))}
          </div>
        </main>
      </div>
    </MobileShell>
  );
}
