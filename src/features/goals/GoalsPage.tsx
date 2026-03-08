import { Link } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import AppHeader from "../../components/layout/AppHeader";
import BottomNav from "../../components/layout/BottomNav";
import MobileShell from "../../components/layout/MobileShell";
import InfoCard from "../../components/ui/InfoCard";
import { goalsService } from "../../services/goals.service";
import type { Goal } from "../../types/models";
import WellbeingRadarChart from "../../components/charts/WellbeingRadarChart";
import { calculateWellbeingScores } from "../../utils/wellbeing";
import { getCurrentUserId } from "../../utils/authSession";

const categoryConfig = [
  {
    key: "physical",
    label: "สุขภาวะทางกาย",
    subtitle: "การดูแลร่างกายและกิจวัตรประจำวัน",
  },
  {
    key: "mental",
    label: "สุขภาวะทางใจ",
    subtitle: "การดูแลอารมณ์และความรู้สึก",
  },
  {
    key: "social",
    label: "สุขภาวะทางสังคม",
    subtitle: "ความสัมพันธ์และการอยู่ร่วมกับผู้อื่น",
  },
  {
    key: "balance",
    label: "ความพอใจในสุขสมดุลระหว่างการทำงาน ครอบครัว สังคม และชีวิตส่วนตัว",
    subtitle: "ความสมดุลของบทบาทต่าง ๆ ในชีวิต",
  },
];

type CategorySummary = {
  key: string;
  label: string;
  subtitle: string;
  count: number;
  progress: number;
  statusText: string;
};

function getStatusText(score: number) {
  if (score >= 80) return "ดีมาก";
  if (score >= 60) return "ดี";
  if (score >= 40) return "ปานกลาง";
  if (score > 0) return "ควรพัฒนา";
  return "ยังไม่มีข้อมูล";
}

export default function GoalsPage() {
  const userId = getCurrentUserId();
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const scores = useMemo(() => calculateWellbeingScores(goals), [goals]);

  async function loadGoals() {
    try {
      setLoading(true);
      setError(null);

      const response = await goalsService.listGoals(userId ?? undefined);

      if (!response.success) {
        throw new Error(response.error || "ไม่สามารถโหลดข้อมูลเป้าหมายได้");
      }

      setGoals(response.data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "เกิดข้อผิดพลาดที่ไม่ทราบสาเหตุ");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadGoals();
  }, [userId]);

  const summaries = useMemo<CategorySummary[]>(() => {
    return categoryConfig.map((category) => {
      const items = goals.filter((goal) => goal.category === category.key);

      const progress =
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
        key: category.key,
        label: category.label,
        subtitle: category.subtitle,
        count: items.length,
        progress,
        statusText: getStatusText(progress),
      };
    });
  }, [goals]);

  return (
    <MobileShell withBottomNav>
      <AppHeader title="เป้าหมาย" showBell />

      <main className="space-y-4 px-4 py-4">
        {loading ? (
          <InfoCard>
            <p className="text-sm text-slate-500">กำลังโหลดข้อมูลเป้าหมาย...</p>
          </InfoCard>
        ) : error ? (
          <InfoCard>
            <div className="space-y-3">
              <p className="text-sm text-rose-600">{error}</p>
              <button
                type="button"
                onClick={() => void loadGoals()}
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
                  <h2 className="mt-1 text-lg font-semibold text-slate-900">
                    สถานะภาวะสุขสมดุลของคุณ
                  </h2>
                </div>

                <WellbeingRadarChart
                  physical={scores.physical}
                  mental={scores.mental}
                  social={scores.social}
                  balance={scores.balance}
                />
              </div>
            </InfoCard>

            {summaries.map((category) => (
              <Link
                key={category.key}
                to={`/goals/${category.key}`}
                className="block"
              >
                <InfoCard>
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0 flex-1">
                      <h3 className="text-base font-semibold leading-6 text-slate-900">
                        {category.label}
                      </h3>

                      <p className="mt-1 text-sm leading-6 text-slate-500">
                        {category.subtitle}
                      </p>

                      <div className="mt-3 h-2 rounded-full bg-slate-100">
                        <div
                          className="h-2 rounded-full bg-slate-900 transition-all"
                          style={{ width: `${category.progress}%` }}
                        />
                      </div>

                      <p className="mt-2 text-sm text-slate-500">
                        {category.count} กิจกรรม • {category.progress}% • {category.statusText}
                      </p>
                    </div>

                    <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700">
                      ดูรายละเอียด
                    </span>
                  </div>
                </InfoCard>
              </Link>
            ))}

            {goals.length === 0 ? (
              <InfoCard>
                <p className="text-sm leading-6 text-slate-500">
                  ยังไม่มีข้อมูลเป้าหมายในระบบ
                </p>
              </InfoCard>
            ) : null}
          </>
        )}
      </main>

      <BottomNav />
    </MobileShell>
  );
}
