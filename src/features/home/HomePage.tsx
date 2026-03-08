import { useEffect, useMemo, useState } from "react";
import AppHeader from "../../components/layout/AppHeader";
import BottomNav from "../../components/layout/BottomNav";
import MobileShell from "../../components/layout/MobileShell";
import InfoCard from "../../components/ui/InfoCard";
import { goalsService } from "../../services/goals.service";
import { profileService } from "../../services/profile.service";
import type { Goal, User } from "../../types/models";
import WellbeingRadarChart from "../../components/charts/WellbeingRadarChart";
import { calculateWellbeingScores } from "../../utils/wellbeing";
import { getCurrentUserId } from "../../utils/authSession";

export default function HomePage() {
  const userId = getCurrentUserId();
  const [user, setUser] = useState<User | null>(null);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const scores = useMemo(() => calculateWellbeingScores(goals), [goals]);

  async function loadHomeData() {
    try {
      setLoading(true);
      setError(null);

      const [userResponse, goalsResponse] = await Promise.all([
        profileService.getUser(userId ?? undefined),
        goalsService.listGoals(userId ?? undefined),
      ]);

      if (!userResponse.success) {
        throw new Error(userResponse.error || "ไม่สามารถโหลดข้อมูลผู้ใช้ได้");
      }

      if (!goalsResponse.success) {
        throw new Error(goalsResponse.error || "ไม่สามารถโหลดข้อมูลเป้าหมายได้");
      }

      setUser(userResponse.data);
      setGoals(goalsResponse.data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "เกิดข้อผิดพลาดที่ไม่ทราบสาเหตุ");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadHomeData();
  }, [userId]);

  const goalSummary = useMemo(() => {
    const active = goals.filter((goal) => goal.status === "active").length;
    const completed = goals.filter((goal) => goal.status === "completed").length;

    return {
      total: goals.length,
      active,
      completed,
    };
  }, [goals]);

  const topArticles = [
    {
      id: 1,
      title: "แนวทางสร้างสุข",
      description: "แนวทางการดูแลสุขภาวะและความสมดุลในการใช้ชีวิตประจำวัน",
    },
    {
      id: 2,
      title: "ข่าวสาร และบทความ",
      description: "บทความด้านจิตวิทยาและการพัฒนาตนเองสำหรับผู้ใช้งาน",
    },
  ];

  const scoreItems = [
    { label: "กาย", value: scores.physical, color: "bg-[#f6fbff] text-[#214e68]" },
    { label: "ใจ", value: scores.mental, color: "bg-[#f8fff8] text-[#21583f]" },
    { label: "สังคม", value: scores.social, color: "bg-[#fff9f3] text-[#6a4828]" },
    { label: "สมดุล", value: scores.balance, color: "bg-[#fff4f6] text-[#7b2e47]" },
  ];

  return (
    <MobileShell withBottomNav>
      <div className="min-h-screen bg-[radial-gradient(circle_at_top_right,#fff6db_0%,#f7fdff_42%,#e8f7ef_100%)]">
        <AppHeader
          title="หน้าหลัก"
          showBell
          subtitle={loading ? "กำลังโหลดข้อมูล..." : user ? `สวัสดี, ${user.full_name}` : "สวัสดี"}
        />

        <main className="space-y-4 px-4 py-4">
          {loading ? (
            <InfoCard>
              <p className="text-sm text-slate-500">กำลังโหลดข้อมูลหน้าหลัก...</p>
            </InfoCard>
          ) : error ? (
            <InfoCard>
              <div className="space-y-3">
                <p className="text-sm text-rose-600">{error}</p>
                <button
                  type="button"
                  onClick={() => void loadHomeData()}
                  className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-medium text-white"
                >
                  ลองใหม่
                </button>
              </div>
            </InfoCard>
          ) : (
            <>
              <section className="rounded-3xl border border-white/70 bg-white/80 p-5 shadow-[0_18px_50px_rgba(31,47,61,0.14)] backdrop-blur">
                <p className="text-xs font-semibold tracking-[0.12em] text-[#1f6658]">HAPPY BALANCE</p>
                <h2 className="mt-2 text-2xl font-extrabold text-slate-900">ภาพรวมสุขสมดุลวันนี้</h2>
                <p className="mt-1 text-sm text-slate-600">
                  {new Date().toLocaleDateString("th-TH", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </p>

                <div className="mt-4 grid grid-cols-3 gap-2 text-center">
                  <div className="rounded-2xl bg-[#f8fafc] px-2 py-3">
                    <p className="text-xs text-slate-500">ทั้งหมด</p>
                    <p className="text-lg font-bold text-slate-900">{goalSummary.total}</p>
                  </div>
                  <div className="rounded-2xl bg-[#ecfdf3] px-2 py-3">
                    <p className="text-xs text-slate-500">กำลังทำ</p>
                    <p className="text-lg font-bold text-[#166534]">{goalSummary.active}</p>
                  </div>
                  <div className="rounded-2xl bg-[#fff7ed] px-2 py-3">
                    <p className="text-xs text-slate-500">สำเร็จ</p>
                    <p className="text-lg font-bold text-[#9a3412]">{goalSummary.completed}</p>
                  </div>
                </div>
              </section>

              <InfoCard>
                <div className="space-y-3">
                  <div>
                    <h3 className="text-base font-semibold text-slate-900">สถานะภาวะสุขสมดุลของคุณ</h3>
                  </div>

                  <WellbeingRadarChart
                    physical={scores.physical}
                    mental={scores.mental}
                    social={scores.social}
                    balance={scores.balance}
                  />

                  <div className="grid grid-cols-2 gap-2">
                    {scoreItems.map((item) => (
                      <div key={item.label} className={`rounded-xl px-3 py-2 ${item.color}`}>
                        <p className="text-xs">{item.label}</p>
                        <p className="text-lg font-bold">{item.value}%</p>
                      </div>
                    ))}
                  </div>
                </div>
              </InfoCard>

              <InfoCard>
                <div className="space-y-3">
                  <div>
                    <h3 className="text-base font-semibold text-slate-900">ข่าวสาร และบทความ</h3>
                    <p className="mt-1 text-sm text-slate-500">
                      บทความด้านจิตวิทยาและแนวทางการพัฒนาสุขภาวะของผู้ใช้งาน
                    </p>
                  </div>

                  <div className="space-y-3">
                    {topArticles.map((article) => (
                      <div key={article.id} className="rounded-xl bg-slate-50 px-4 py-4">
                        <p className="font-medium text-slate-900">{article.title}</p>
                        <p className="mt-1 text-sm leading-6 text-slate-500">{article.description}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </InfoCard>
            </>
          )}
        </main>

        <BottomNav />
      </div>
    </MobileShell>
  );
}
