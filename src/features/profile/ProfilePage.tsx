import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import AppHeader from "../../components/layout/AppHeader";
import BottomNav from "../../components/layout/BottomNav";
import MobileShell from "../../components/layout/MobileShell";
import InfoCard from "../../components/ui/InfoCard";
import { profileService } from "../../services/profile.service";
import type { User } from "../../types/models";

const menuItems = [
  { label: "ข้อมูลส่วนตัว", to: "/profile/personal-info" },
  { label: "บันทึกการให้การปรึกษา", to: "/profile/counseling-record" },
  { label: "ผลประเมินภาวะสุขสมดุล", to: "/profile/evaluation-result" },
  { label: "การตั้งค่า", to: "/profile/settings" },
  { label: "ช่วยเหลือ", to: "/profile/help" },
];

export default function ProfilePage() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function loadUser() {
    try {
      setLoading(true);
      setError(null);

      const response = await profileService.getUser();

      if (!response.success) {
        throw new Error(response.error || "ไม่สามารถโหลดข้อมูลบัญชีผู้ใช้งานได้");
      }

      setUser(response.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "เกิดข้อผิดพลาดที่ไม่ทราบสาเหตุ");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadUser();
  }, []);

  const initials =
    user?.full_name
      ?.split(" ")
      .map((part) => part[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() || "HB";

  return (
    <MobileShell withBottomNav>
      <AppHeader title="บัญชี" showBell />

      <main className="space-y-4 px-4 py-4">
        {loading ? (
          <InfoCard>
            <p className="text-sm text-slate-500">กำลังโหลดข้อมูลบัญชี...</p>
          </InfoCard>
        ) : error ? (
          <InfoCard>
            <div className="space-y-3">
              <p className="text-sm text-rose-600">{error}</p>
              <button
                type="button"
                onClick={() => void loadUser()}
                className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-medium text-white"
              >
                ลองใหม่
              </button>
            </div>
          </InfoCard>
        ) : user ? (
          <InfoCard>
            <div className="flex items-center gap-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-slate-100 text-lg font-semibold text-slate-700">
                {initials}
              </div>

              <div className="min-w-0 flex-1">
                <h2 className="text-lg font-semibold text-slate-900">
                  {user.full_name || "บัญชีผู้ใช้งาน"}
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  {user.phone || "-"}
                </p>
              </div>
            </div>
          </InfoCard>
        ) : (
          <InfoCard>
            <p className="text-sm text-slate-500">ไม่พบข้อมูลบัญชีผู้ใช้งาน</p>
          </InfoCard>
        )}

        <div className="space-y-3">
          {menuItems.map((item) => (
            <Link key={item.to} to={item.to} className="block">
              <InfoCard>
                <div className="flex items-center justify-between">
                  <span className="font-medium text-slate-800">{item.label}</span>
                  <span className="text-sm text-slate-400">›</span>
                </div>
              </InfoCard>
            </Link>
          ))}
        </div>
      </main>

      <BottomNav />
    </MobileShell>
  );
}