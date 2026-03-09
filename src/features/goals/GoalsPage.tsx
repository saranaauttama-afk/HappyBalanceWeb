import {
  Activity,
  Brain,
  ChevronRight,
  Scale,
  Users,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import AppHeader from "../../components/layout/AppHeader";
import BottomNav from "../../components/layout/BottomNav";
import WellbeingRadarChart from "../../components/charts/WellbeingRadarChart";
import MobileShell from "../../components/layout/MobileShell";
import InfoCard from "../../components/ui/InfoCard";
import { goalsService } from "../../services/goals.service";
import type { Goal } from "../../types/models";
import { getCurrentUserId } from "../../utils/authSession";
import { calculateWellbeingScores } from "../../utils/wellbeing";

type CategoryKey = "physical" | "mental" | "social" | "balance";

type CategoryConfig = {
  key: CategoryKey;
  label: string;
  subtitle: string;
  Icon: typeof Activity;
  iconColor: string;
  progressColor: string;
  chipStyle: string;
};

const categoryConfig: CategoryConfig[] = [
  {
    key: "physical",
    label: "สุขภาวะทางกาย",
    subtitle: "ดูแลร่างกายและกิจวัตรประจำวัน",
    Icon: Activity,
    iconColor: "text-[#2e6a8b]",
    progressColor: "bg-[#8cc2db]",
    chipStyle: "bg-[#eef7fd] text-[#2e6a8b]",
  },
  {
    key: "mental",
    label: "สุขภาวะทางใจ",
    subtitle: "จัดการอารมณ์ ความเครียด และความคิด",
    Icon: Brain,
    iconColor: "text-[#2f7b56]",
    progressColor: "bg-[#7fc3a0]",
    chipStyle: "bg-[#eef8f2] text-[#2f7b56]",
  },
  {
    key: "social",
    label: "สุขภาวะทางสังคม",
    subtitle: "สร้างความสัมพันธ์และการมีส่วนร่วม",
    Icon: Users,
    iconColor: "text-[#8a5a3a]",
    progressColor: "bg-[#d7b08f]",
    chipStyle: "bg-[#fff6ef] text-[#8a5a3a]",
  },
  {
    key: "balance",
    label: "สุขสมดุลชีวิต",
    subtitle: "สมดุลงาน ครอบครัว สังคม และเวลาส่วนตัว",
    Icon: Scale,
    iconColor: "text-[#7a2a48]",
    progressColor: "bg-[#d79bb4]",
    chipStyle: "bg-[#fff1f6] text-[#7a2a48]",
  },
];

type CategorySummary = {
  key: CategoryKey;
  label: string;
  subtitle: string;
  count: number;
  progress: number;
  statusText: string;
  Icon: typeof Activity;
  iconColor: string;
  progressColor: string;
  chipStyle: string;
};

function getStatusText(score: number) {
  if (score >= 80) return "ดีมาก";
  if (score >= 60) return "ดี";
  if (score >= 40) return "ปานกลาง";
  if (score > 0) return "ควรพัฒนา";
  return "ยังไม่มีข้อมูล";
}

function formatThaiDate(value: Date) {
  return value.toLocaleDateString("th-TH", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export default function GoalsPage() {
  const userId = getCurrentUserId();
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const scores = useMemo(() => calculateWellbeingScores(goals), [goals]);

  const loadGoals = useCallback(async () => {
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
  }, [userId]);

  useEffect(() => {
    void loadGoals();
  }, [loadGoals]);

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
        Icon: category.Icon,
        iconColor: category.iconColor,
        progressColor: category.progressColor,
        chipStyle: category.chipStyle,
      };
    });
  }, [goals]);

  const overallProgress = useMemo(() => {
    if (summaries.length === 0) return 0;
    return Math.round(
      summaries.reduce((sum, category) => sum + category.progress, 0) / summaries.length
    );
  }, [summaries]);

  const scoreItems = [
    { label: "กาย", value: scores.physical, style: "bg-[#eef7fd] text-[#2e6a8b]" },
    { label: "ใจ", value: scores.mental, style: "bg-[#eef8f2] text-[#2f7b56]" },
    { label: "สังคม", value: scores.social, style: "bg-[#fff6ef] text-[#8a5a3a]" },
    { label: "สมดุล", value: scores.balance, style: "bg-[#fff1f6] text-[#7a2a48]" },
  ];

  return (
    <MobileShell>
      <div className="relative min-h-screen overflow-hidden bg-[radial-gradient(circle_at_top_right,#fff6db_0%,#f7fdff_42%,#e8f7ef_100%)]">
        <div className="pointer-events-none absolute -left-20 top-14 h-56 w-56 rounded-full bg-[#ffc9a3]/20 blur-3xl" />
        <div className="pointer-events-none absolute -right-20 bottom-28 h-56 w-56 rounded-full bg-[#7dcdb8]/20 blur-3xl" />

        <AppHeader
          title="เป้าหมาย"
          showBell
          variant="soft"
          subtitle={loading ? "กำลังโหลดข้อมูล..." : "เลือกหมวดเพื่อบันทึกและติดตามผล"}
        />

        <main className="relative z-10 space-y-4 px-4 py-4">
          {loading ? (
            <>
              <InfoCard className="rounded-3xl border-white/70 bg-white/80">
                <p className="text-sm text-slate-500">กำลังโหลดข้อมูลเป้าหมาย...</p>
              </InfoCard>
              <InfoCard className="rounded-3xl border-white/70 bg-white/80">
                <p className="text-sm text-slate-500">กำลังเตรียมภาพรวมสุขสมดุล...</p>
              </InfoCard>
            </>
          ) : error ? (
            <InfoCard className="rounded-3xl border-rose-200 bg-rose-50">
              <div className="space-y-3">
                <p className="text-sm text-rose-700">{error}</p>
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
              <section className="relative overflow-hidden rounded-[28px] border border-white/80 bg-[linear-gradient(145deg,rgba(255,255,255,0.9)_0%,rgba(245,253,255,0.86)_48%,rgba(237,251,243,0.88)_100%)] p-5 shadow-[0_22px_48px_rgba(31,47,61,0.14)] backdrop-blur">
                <div className="pointer-events-none absolute -right-16 -top-16 h-44 w-44 rounded-full bg-[#9ad4be]/20 blur-3xl" />
                <p className="text-xs font-semibold tracking-[0.14em] text-[#255f54]">GOALS SNAPSHOT</p>
                <h2 className="mt-2 text-2xl font-extrabold leading-tight text-slate-900">สถานะเป้าหมายสุขสมดุล</h2>
                <p className="mt-1 text-sm text-slate-600">{formatThaiDate(new Date())}</p>

                <div className="mt-4 rounded-2xl border border-white/80 bg-white/75 p-3">
                  <div className="mb-2 flex items-center justify-between text-xs text-slate-600">
                    <span>ความคืบหน้าโดยรวม</span>
                    <span className="font-semibold text-slate-900">{overallProgress}%</span>
                  </div>
                  <div className="h-2 rounded-full bg-slate-200">
                    <div
                      className="h-2 rounded-full bg-gradient-to-r from-[#7fc3a0] via-[#8cc2db] to-[#d88d80]"
                      style={{ width: `${overallProgress}%` }}
                    />
                  </div>
                </div>

                <div className="mt-4 grid grid-cols-3 gap-2 text-center">
                  <div className="rounded-2xl bg-[#f8fafc] px-2 py-3">
                    <p className="text-xs text-slate-500">หมวดทั้งหมด</p>
                    <p className="text-lg font-bold text-slate-900">{summaries.length}</p>
                  </div>
                  <div className="rounded-2xl bg-[#ecfdf3] px-2 py-3">
                    <p className="text-xs text-slate-500">กิจกรรมทั้งหมด</p>
                    <p className="text-lg font-bold text-[#166534]">{goals.length}</p>
                  </div>
                  <div className="rounded-2xl bg-[#fff7ed] px-2 py-3">
                    <p className="text-xs text-slate-500">อัปเดตล่าสุด</p>
                    <p className="text-xs font-bold text-[#9a3412]">วันนี้</p>
                  </div>
                </div>
              </section>

              <InfoCard className="rounded-3xl border-white/70 bg-white/80 shadow-[0_18px_40px_rgba(31,47,61,0.1)] backdrop-blur">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-base font-semibold text-slate-900">กราฟสุขสมดุลหลัก</h3>
                    <span className="rounded-full bg-[#f5fbff] px-3 py-1 text-xs font-semibold text-[#315d75]">
                      เฉลี่ย {overallProgress}%
                    </span>
                  </div>

                  <WellbeingRadarChart
                    physical={scores.physical}
                    mental={scores.mental}
                    social={scores.social}
                    balance={scores.balance}
                  />

                  <div className="grid grid-cols-2 gap-2">
                    {scoreItems.map((item) => (
                      <div key={item.label} className={`rounded-xl px-3 py-2 ${item.style}`}>
                        <p className="text-xs">{item.label}</p>
                        <p className="text-lg font-bold">{item.value}%</p>
                      </div>
                    ))}
                  </div>
                </div>
              </InfoCard>

              <section className="space-y-3">
                {summaries.map((category) => (
                  <Link key={category.key} to={`/goals/${category.key}`} className="block">
                    <InfoCard className="relative overflow-hidden rounded-3xl border-white/70 bg-white/80 shadow-[0_18px_40px_rgba(31,47,61,0.1)] backdrop-blur transition hover:-translate-y-0.5 hover:shadow-[0_20px_44px_rgba(31,47,61,0.14)]">
                      <div className="pointer-events-none absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-[#d8e8f6] via-[#ebf4fd] to-[#f8fcff]" />
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <span
                              className={`inline-flex h-8 w-8 items-center justify-center rounded-lg bg-white ${category.iconColor}`}
                            >
                              <category.Icon size={17} />
                            </span>
                            <h3 className="text-base font-semibold text-slate-900">{category.label}</h3>
                          </div>

                          <p className="mt-2 text-sm text-slate-500">{category.subtitle}</p>

                          <div className="mt-3 h-2 rounded-full bg-slate-200">
                            <div
                              className={`h-2 rounded-full ${category.progressColor} transition-all`}
                              style={{ width: `${category.progress}%` }}
                            />
                          </div>

                          <div className="mt-2 flex items-center justify-between gap-2">
                            <p className="text-sm text-slate-500">{category.count} กิจกรรม</p>
                            <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${category.chipStyle}`}>
                              {category.progress}% • {category.statusText}
                            </span>
                          </div>
                        </div>

                        <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-white text-slate-400">
                          <ChevronRight size={16} />
                        </span>
                      </div>
                    </InfoCard>
                  </Link>
                ))}
              </section>

              {goals.length === 0 ? (
                <InfoCard className="rounded-3xl border-amber-200 bg-amber-50/80">
                  <p className="text-sm leading-6 text-amber-800">
                    ยังไม่มีข้อมูลเป้าหมายในระบบ คุณสามารถเลือกหมวดเพื่อเริ่มตั้งเป้าหมายได้เลย
                  </p>
                </InfoCard>
              ) : null}
            </>
          )}
        </main>

        <BottomNav variant="soft" />
      </div>
    </MobileShell>
  );
}
