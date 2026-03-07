import { Link } from "react-router-dom";
import AppHeader from "../../../components/layout/AppHeader";
import MobileShell from "../../../components/layout/MobileShell";
import InfoCard from "../../../components/ui/InfoCard";

const settingMenus = [
  {
    label: "เป้าหมายการนอนหลับ",
    description: "กำหนดจำนวนชั่วโมงการนอนหลับต่อวัน",
    to: "/profile/settings/sleep-goal",
  },
  {
    label: "เป้าหมายการดื่มน้ำ",
    description: "กำหนดเป้าหมายการดื่มน้ำต่อวัน",
    to: "/profile/settings/water-goal",
  },
];

export default function SettingsPage() {
  return (
    <MobileShell>
      <AppHeader title="การตั้งค่า" showBack showBell />

      <main className="space-y-4 px-4 py-6">
        {settingMenus.map((item) => (
          <Link key={item.to} to={item.to} className="block">
            <InfoCard>
              <div className="flex items-center justify-between gap-4">
                <div className="min-w-0 flex-1">
                  <h2 className="text-base font-semibold text-slate-900">
                    {item.label}
                  </h2>
                  <p className="mt-1 text-sm leading-6 text-slate-500">
                    {item.description}
                  </p>
                </div>

                <span className="text-sm text-slate-400">›</span>
              </div>
            </InfoCard>
          </Link>
        ))}
      </main>
    </MobileShell>
  );
}