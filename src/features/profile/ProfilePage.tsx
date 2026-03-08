import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import AppHeader from "../../components/layout/AppHeader";
import BottomNav from "../../components/layout/BottomNav";
import MobileShell from "../../components/layout/MobileShell";
import InfoCard from "../../components/ui/InfoCard";
import { profileService } from "../../services/profile.service";
import type { User } from "../../types/models";
import { getCurrentUserId } from "../../utils/authSession";

const menuItems = [
  {
    label: "ข้อมูลส่วนตัว",
    subtitle: "จัดการข้อมูลพื้นฐานของบัญชีผู้ใช้งาน",
    to: "/profile/personal-info",
  },
  {
    label: "บันทึกการให้การปรึกษา",
    subtitle: "ดูประวัติและรายละเอียดการรับคำปรึกษา",
    to: "/profile/counseling-record",
  },
  {
    label: "ผลประเมินภาวะสุขสมดุล",
    subtitle: "ติดตามผลประเมินและพัฒนาการของคุณ",
    to: "/profile/evaluation-result",
  },
  {
    label: "การตั้งค่า",
    subtitle: "กำหนดเป้าหมายและการใช้งานแอป",
    to: "/profile/settings",
  },
  {
    label: "ช่วยเหลือ",
    subtitle: "คำถามที่พบบ่อยและช่องทางติดต่อ",
    to: "/profile/help",
  },
];

const cardClassName =
  "border-white/70 bg-white/80 shadow-[0_18px_50px_rgba(31,47,61,0.12)] backdrop-blur";

export default function ProfilePage() {
  const userId = getCurrentUserId();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function loadUser() {
    try {
      setLoading(true);
      setError(null);

      const response = await profileService.getUser(userId ?? undefined);

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
  }, [userId]);

  const initials =
    user?.full_name
      ?.split(" ")
      .map((part) => part[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() || "HB";

  return (
    <MobileShell>
      <div className="relative flex min-h-screen flex-col overflow-hidden bg-[radial-gradient(circle_at_top_right,#fff6db_0%,#f7fdff_42%,#e8f7ef_100%)]">
        <div className="pointer-events-none absolute -left-20 top-10 h-56 w-56 rounded-full bg-[#ffc9a3]/20 blur-3xl" />
        <div className="pointer-events-none absolute -right-20 bottom-24 h-56 w-56 rounded-full bg-[#7dcdb8]/20 blur-3xl" />
        <div className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-white/45 to-transparent" />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-[#fff4e8]/65 to-transparent" />

        <AppHeader
          title="บัญชี"
          subtitle="จัดการข้อมูลและการตั้งค่า"
          showBell
          variant="soft"
        />

        <main className="relative z-10 flex-1 space-y-4 px-4 py-4">
          {loading ? (
            <InfoCard className={cardClassName}>
              <p className="text-sm text-slate-500">กำลังโหลดข้อมูลบัญชี...</p>
            </InfoCard>
          ) : error ? (
            <InfoCard className={cardClassName}>
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
            <InfoCard className={`${cardClassName} rounded-3xl`}>
              <div className="space-y-4">
                <p className="inline-flex rounded-full bg-[#e7f6f0] px-3 py-1 text-xs font-semibold tracking-[0.12em] text-[#1f6658]">
                  HAPPY BALANCE MEMBER
                </p>

                <div className="flex items-center gap-4">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[linear-gradient(135deg,#f8c6a3_0%,#d7f2e8_100%)] text-lg font-bold text-[#1f2f3d] ring-2 ring-white/80">
                    {initials}
                  </div>

                  <div className="min-w-0 flex-1">
                    <h2 className="truncate text-lg font-semibold text-slate-900">
                      {user.full_name || "บัญชีผู้ใช้งาน"}
                    </h2>
                    <p className="mt-1 truncate text-sm text-slate-500">{user.phone || "-"}</p>
                    <p className="truncate text-sm text-slate-500">{user.email || "-"}</p>
                  </div>
                </div>
              </div>
            </InfoCard>
          ) : (
            <InfoCard className={cardClassName}>
              <p className="text-sm text-slate-500">ไม่พบข้อมูลบัญชีผู้ใช้งาน</p>
            </InfoCard>
          )}

          <div className="space-y-3">
            {menuItems.map((item) => (
              <Link key={item.to} to={item.to} className="group block">
                <InfoCard className={cardClassName}>
                  <div className="flex items-center justify-between gap-4">
                    <div className="min-w-0 flex-1">
                      <span className="text-sm font-semibold text-slate-800">{item.label}</span>
                      <p className="mt-1 text-xs leading-5 text-slate-500">{item.subtitle}</p>
                    </div>
                    <span className="text-sm text-slate-400 transition group-hover:translate-x-0.5">›</span>
                  </div>
                </InfoCard>
              </Link>
            ))}
          </div>
        </main>

        <BottomNav variant="soft" />
      </div>
    </MobileShell>
  );
}
