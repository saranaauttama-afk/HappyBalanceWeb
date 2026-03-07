import { useEffect, useMemo, useState } from "react";
import AppHeader from "../../components/layout/AppHeader";
import BottomNav from "../../components/layout/BottomNav";
import MobileShell from "../../components/layout/MobileShell";
import InfoCard from "../../components/ui/InfoCard";
import { goalsService } from "../../services/goals.service";
import { profileService } from "../../services/profile.service";
import type { Goal, User } from "../../types/models";

const categories = [
  {
    key: "physical",
    label: "สุขภาวะทางกาย",
    description: "Physical Wellbeing",
  },
  {
    key: "mental",
    label: "สุขภาวะทางใจ",
    description: "Mental Wellbeing",
  },
  {
    key: "social",
    label: "สุขภาวะทางสังคม",
    description: "Social Wellbeing",
  },
  {
    key: "balance",
    label: "ความพอใจในสุขสมดุลระหว่างการทำงาน ครอบครัว สังคม และชีวิตส่วนตัว",
    description: "Balance Satisfaction",
  },
];

function getStatusText(score: number) {
  if (score >= 80) return "ดีมาก";
  if (score >= 60) return "ดี";
  if (score >= 40) return "ปานกลาง";
  if (score > 0) return "ควรพัฒนา";
  return "ยังไม่มีข้อมูล";
}

export default function HomePage() {
  const [user, setUser] = useState<User | null>(null);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function loadHomeData() {
    try {
      setLoading(true);
      setError(null);

      const [userResponse, goalsResponse] = await Promise.all([
        profileService.getUser(),
        goalsService.listGoals(),
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
  }, []);

  const categoryStats = useMemo(() => {
    return categories.map((category) => {
      const items = goals.filter((goal) => goal.category === category.key);

      const score =
        items.length === 0
          ? 0
          : Math.round(
              (items.reduce((sum, item) => {
                const current = Number(item.current_value) || 0;
                const target = Number(item.target_value) || 0;
                if (target <= 0) return sum;
                return sum + Math.min(current / target, 1);
              }, 0) /
                items.length) *
                100
            );

      return {
        ...category,
        score,
        statusText: getStatusText(score),
      };
    });
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

  return (
    <MobileShell withBottomNav>
      <AppHeader
        title="หน้าหลัก"
        subtitle={
          loading
            ? "กำลังโหลดข้อมูล..."
            : user
            ? `สวัสดี, ${user.full_name}`
            : "สวัสดี"
        }
        showBell
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
            <InfoCard>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-slate-500">สถานะภาวะสุขสมดุลของคุณ</p>
                  <h2 className="mt-1 text-lg font-semibold text-slate-900">
                    Your Balance Wellbeing Status
                  </h2>
                </div>

                <div className="rounded-2xl bg-slate-50 p-4">
                  <div className="grid grid-cols-2 gap-3">
                    {categoryStats.map((item) => (
                      <div
                        key={item.key}
                        className="rounded-xl border border-slate-200 bg-white p-3"
                      >
                        <p className="text-sm font-medium leading-5 text-slate-900">
                          {item.label}
                        </p>
                        <p className="mt-2 text-2xl font-bold text-slate-900">
                          {item.score}
                        </p>
                        <p className="text-xs text-slate-500">
                          {item.statusText}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </InfoCard>

            <InfoCard>
              <div className="space-y-3">
                <div>
                  <h3 className="text-base font-semibold text-slate-900">
                    ข่าวสาร และบทความ
                  </h3>
                  <p className="mt-1 text-sm text-slate-500">
                    บทความด้านจิตวิทยาและแนวทางการพัฒนาสุขภาวะของผู้ใช้งาน
                  </p>
                </div>

                <div className="space-y-3">
                  {topArticles.map((article) => (
                    <div
                      key={article.id}
                      className="rounded-xl bg-slate-50 px-4 py-4"
                    >
                      <p className="font-medium text-slate-900">{article.title}</p>
                      <p className="mt-1 text-sm leading-6 text-slate-500">
                        {article.description}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </InfoCard>
          </>
        )}
      </main>

      <BottomNav />
    </MobileShell>
  );
}