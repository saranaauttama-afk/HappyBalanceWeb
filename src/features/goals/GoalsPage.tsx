import {
  Activity,
  Brain,
  ChevronRight,
  LoaderCircle,
  Lock,
  Scale,
  Users,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import AppHeader from "../../components/layout/AppHeader";
import WeekNavBar from "../../components/ui/WeekNavBar";
import BottomNav from "../../components/layout/BottomNav";
import WellbeingRadarChart from "../../components/charts/WellbeingRadarChart";
import MobileShell from "../../components/layout/MobileShell";
import InfoCard from "../../components/ui/InfoCard";
import { goalsService } from "../../services/goals.service";
import { logsService } from "../../services/logs.service";
import type { Goal } from "../../types/models";
import { getCurrentUserId } from "../../utils/authSession";
import { settingsService, type CategoryEnabled } from "../../services/settings.service";
import { toDateKey, getStartOfMonth, getEndOfMonth, isCurrentMonth, toMonthKey, addMonths } from '../../utils/weekPeriod';
import {
  getLogTimestamp as getMentalLogTimestamp,
  parsePositiveThinkingTaskNote,
} from "./task-detail/positiveThinkingTaskShared";
import { parseStressTaskNote } from "./task-detail/stressTaskShared";
import {
  getLogTimestamp as getSocialLogTimestamp,
  parseSocialTaskNote,
} from "./task-detail/socialTaskShared";
import {
  getLogTimestamp as getBalanceLogTimestamp,
  parseBalanceTaskNote,
} from "./task-detail/balanceTaskShared";
import {
  getLogTimestamp as getScaffoldedLogTimestamp,
  parseScaffoldedTaskNote,
} from "./task-detail/scaffoldedTaskShared";
import { FAMILY_SOCIAL_BALANCE_TASKS } from "./tasks/familySocialBalanceTasks";
import { FAMILY_RELATIONSHIP_TASKS } from "./tasks/familyRelationshipTasks";
import { PERSONAL_LIFE_BALANCE_TASKS } from "./tasks/personalLifeBalanceTasks";
import { POSITIVE_THINKING_TASKS } from "./tasks/positiveThinkingTasks";
import { REST_TASKS } from "./tasks/restTasks";
import { getScaffoldedActivityConfig } from "./tasks/scaffoldedActivityTasks";
import { STRESS_TASKS } from "./tasks/stressTasks";
import { WORK_BALANCE_TASKS } from "./tasks/workBalanceTasks";
import { WORKPLACE_RELATIONSHIP_TASKS } from "./tasks/workplaceRelationshipTasks";

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

type CategoryLiveScore = Record<CategoryKey, number>;

function getStatusText(score: number) {
  if (score >= 80) return "ดีมาก";
  if (score >= 60) return "ดี";
  if (score >= 40) return "ปานกลาง";
  if (score > 0) return "ควรพัฒนา";
  return "ยังไม่มีข้อมูล";
}


function parseRestTaskScore(note: string) {
  if (!note) return null;

  try {
    const parsed = JSON.parse(note) as {
      entry_type?: string;
      category?: string;
      activity?: string;
      task?: string;
      score?: number;
    };

    if (parsed.entry_type !== "rest_task") return null;
    if (parsed.category !== "physical") return null;
    if (parsed.activity !== "rest") return null;
    if (!parsed.task) return null;

    const score = Number(parsed.score);
    if (!Number.isFinite(score)) return null;

    return {
      task: parsed.task,
      score: Math.max(0, Math.min(100, Math.round(score))),
    };
  } catch {
    return null;
  }
}

function parsePhysicalTaskActivity(note: string) {
  if (!note) return null;

  try {
    const parsed = JSON.parse(note) as {
      entry_type?: string;
      category?: string;
      activity?: string;
      task?: string;
      score?: number;
    };

    if (parsed.entry_type !== "physical_task") return null;
    if (parsed.category !== "physical") return null;
    if (!parsed.activity || !parsed.task) return null;

    const score = Number(parsed.score);
    if (!Number.isFinite(score)) return null;

    return {
      activity: parsed.activity,
      task: parsed.task,
      score: Math.max(0, Math.min(100, Math.round(score))),
    };
  } catch {
    return null;
  }
}

export default function GoalsPage() {
  const userId = getCurrentUserId();
  const [weekStartDate, setWeekStartDate] = useState(() => {
    const saved = sessionStorage.getItem("goals-month");
    if (saved) return getStartOfMonth(new Date(saved + "-01T00:00:00"));
    return getStartOfMonth(new Date());
  });
  const weekStartKey = toDateKey(weekStartDate);
  const monthKey = toMonthKey(weekStartDate);
  const weekEndDate = getEndOfMonth(weekStartDate);
  const isViewingCurrentWeek = isCurrentMonth(monthKey);

  useEffect(() => {
    sessionStorage.setItem("goals-month", monthKey);
  }, [weekStartKey]);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [liveScores, setLiveScores] = useState<CategoryLiveScore | null>(null);
  const [liveScoresLoading, setLiveScoresLoading] = useState(true);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [categoryEnabled, setCategoryEnabled] = useState<CategoryEnabled>({
    physical: true, mental: true, social: true, balance: true,
  });

  useEffect(() => {
    settingsService.getCategorySettings().then(({ data }) => setCategoryEnabled(data.categoryEnabled));
  }, []);
  const snapshotImage =
    "https://images.unsplash.com/photo-1490750967868-88aa4486c946?auto=format&fit=crop&w=1400&q=80";

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

  useEffect(() => {
    let cancelled = false;

    async function loadLiveScores() {
      try {
        if (!cancelled) {
          setLiveScoresLoading(true);
        }

        const [restResponse, physicalResponse, mentalResponse, socialResponse, balanceResponse] =
          await Promise.all([
            logsService.listRestTaskLogs(userId ?? undefined, {
              limit: 480,
              forceRefresh: true,
              from: weekStartKey,
              to: toDateKey(weekEndDate),
            }),
            logsService.listDailyLogs(userId ?? undefined, {
              entry_type: "physical_task",
              category: "physical",
              from: weekStartKey,
              to: toDateKey(weekEndDate),
              limit: 480,
              forceRefresh: true,
            }),
            logsService.listMentalTaskLogs(userId ?? undefined, {
              limit: 480,
              forceRefresh: true,
              from: weekStartKey,
              to: toDateKey(weekEndDate),
            }),
            logsService.listSocialTaskLogs(userId ?? undefined, {
              limit: 480,
              forceRefresh: true,
              from: weekStartKey,
              to: toDateKey(weekEndDate),
            }),
            logsService.listBalanceTaskLogs(userId ?? undefined, {
              limit: 480,
              forceRefresh: true,
              from: weekStartKey,
              to: toDateKey(weekEndDate),
            }),
          ]);

        if (
          !restResponse.success ||
          !physicalResponse.success ||
          !mentalResponse.success ||
          !socialResponse.success ||
          !balanceResponse.success
        ) {
          if (!cancelled) {
            setLiveScores(null);
          }
          return;
        }

        const restLatestByTask = new Map<string, number>();
        [...(restResponse.data || [])]
          .sort((a, b) => getScaffoldedLogTimestamp(b) - getScaffoldedLogTimestamp(a))
          .forEach((log) => {
            const parsed = parseRestTaskScore(String(log.note));
            if (!parsed || restLatestByTask.has(parsed.task)) return;
            restLatestByTask.set(parsed.task, parsed.score);
          });

        const physicalActivityKeys = ["food-intake", "exercise", "body-hygiene"] as const;
        const physicalTaskCounts = Object.fromEntries(
          physicalActivityKeys.map((activityKey) => [
            activityKey,
            getScaffoldedActivityConfig("physical", activityKey)?.tasks.length ?? 0,
          ])
        ) as Record<(typeof physicalActivityKeys)[number], number>;

        const physicalLatestByActivity = new Map<string, Map<string, number>>();
        [...(physicalResponse.data || [])]
          .sort((a, b) => getScaffoldedLogTimestamp(b) - getScaffoldedLogTimestamp(a))
          .forEach((log) => {
            const parsed = parsePhysicalTaskActivity(String(log.note));
            const activityKey = String(parsed?.activity || "");
            if (!physicalActivityKeys.includes(activityKey as (typeof physicalActivityKeys)[number])) {
              return;
            }

            const latestByTask = physicalLatestByActivity.get(activityKey) ?? new Map<string, number>();
            if (!parsed || latestByTask.has(parsed.task)) return;
            latestByTask.set(parsed.task, parsed.score);
            physicalLatestByActivity.set(activityKey, latestByTask);
          });

        const physicalActivityScores = [
          Math.round(
            Array.from(restLatestByTask.values()).reduce((sum, score) => sum + score, 0) /
              Math.max(REST_TASKS.length, 1)
          ),
          ...physicalActivityKeys.map((activityKey) =>
            Math.round(
              Array.from(physicalLatestByActivity.get(activityKey)?.values() || []).reduce(
                (sum, score) => sum + score,
                0
              ) / Math.max(physicalTaskCounts[activityKey], 1)
            )
          ),
        ];

        const positiveLatestByTask = new Map<string, number>();
        const stressLatestByTask = new Map<string, number>();
        const scaffoldedMentalActivityKeys = ["life-satisfaction", "self-worth"] as const;
        const scaffoldedMentalTaskCounts = Object.fromEntries(
          scaffoldedMentalActivityKeys.map((activityKey) => [
            activityKey,
            getScaffoldedActivityConfig("mental", activityKey)?.tasks.length ?? 0,
          ])
        ) as Record<(typeof scaffoldedMentalActivityKeys)[number], number>;
        const scaffoldedMentalLatestByActivity = new Map<string, Map<string, number>>();

        [...(mentalResponse.data || [])]
          .sort((a, b) => getMentalLogTimestamp(b) - getMentalLogTimestamp(a))
          .forEach((log) => {
            const positiveEntry = parsePositiveThinkingTaskNote(String(log.note));
            if (positiveEntry && !positiveLatestByTask.has(positiveEntry.task)) {
              positiveLatestByTask.set(positiveEntry.task, positiveEntry.score);
              return;
            }

            const stressEntry = parseStressTaskNote(String(log.note));
            if (stressEntry && !stressLatestByTask.has(stressEntry.task)) {
              stressLatestByTask.set(stressEntry.task, stressEntry.score);
              return;
            }

            for (const activityKey of scaffoldedMentalActivityKeys) {
              const parsed = parseScaffoldedTaskNote(String(log.note), "mental", activityKey);
              if (!parsed) continue;
              const latestByTask =
                scaffoldedMentalLatestByActivity.get(activityKey) ?? new Map<string, number>();
              if (!latestByTask.has(parsed.task)) {
                latestByTask.set(parsed.task, parsed.score);
              }
              scaffoldedMentalLatestByActivity.set(activityKey, latestByTask);
              break;
            }
          });

        const mentalActivityScores = [
          Math.round(
            Array.from(positiveLatestByTask.values()).reduce((sum, score) => sum + score, 0) /
              Math.max(POSITIVE_THINKING_TASKS.length, 1)
          ),
          Math.round(
            Array.from(stressLatestByTask.values()).reduce((sum, score) => sum + score, 0) /
              Math.max(STRESS_TASKS.length, 1)
          ),
          ...scaffoldedMentalActivityKeys.map((activityKey) =>
            Math.round(
              Array.from(scaffoldedMentalLatestByActivity.get(activityKey)?.values() || []).reduce(
                (sum, score) => sum + score,
                0
              ) / Math.max(scaffoldedMentalTaskCounts[activityKey], 1)
            )
          ),
        ];

        const socialActivityTaskCount: Record<string, number> = {
          "family-relationship": FAMILY_RELATIONSHIP_TASKS.length,
          "community-participation": 1,
          "workplace-relationship": WORKPLACE_RELATIONSHIP_TASKS.length,
        };
        const socialLatestByActivity = new Map<string, Map<string, number>>();
        [...(socialResponse.data || [])]
          .sort((a, b) => getSocialLogTimestamp(b) - getSocialLogTimestamp(a))
          .forEach((log) => {
            const parsed = parseSocialTaskNote(String(log.note));
            if (!parsed) return;
            const latestByTask = socialLatestByActivity.get(parsed.activity) ?? new Map<string, number>();
            if (!latestByTask.has(parsed.task)) {
              latestByTask.set(parsed.task, parsed.score);
            }
            socialLatestByActivity.set(parsed.activity, latestByTask);
          });

        const socialActivityScores = Object.entries(socialActivityTaskCount).map(
          ([activityKey, totalTaskCount]) =>
            Math.round(
              Array.from(socialLatestByActivity.get(activityKey)?.values() || []).reduce(
                (sum, score) => sum + score,
                0
              ) / Math.max(totalTaskCount, 1)
            )
        );

        const balanceActivityTaskCount: Record<string, number> = {
          "family-social-balance": FAMILY_SOCIAL_BALANCE_TASKS.length,
          "work-balance": WORK_BALANCE_TASKS.length,
          "personal-life-balance": PERSONAL_LIFE_BALANCE_TASKS.length,
        };
        const balanceLatestByActivity = new Map<string, Map<string, number>>();
        [...(balanceResponse.data || [])]
          .sort((a, b) => getBalanceLogTimestamp(b) - getBalanceLogTimestamp(a))
          .forEach((log) => {
            const parsed = parseBalanceTaskNote(String(log.note));
            if (!parsed) return;
            const latestByTask = balanceLatestByActivity.get(parsed.activity) ?? new Map<string, number>();
            if (!latestByTask.has(parsed.task)) {
              latestByTask.set(parsed.task, parsed.score);
            }
            balanceLatestByActivity.set(parsed.activity, latestByTask);
          });

        const balanceActivityScores = Object.entries(balanceActivityTaskCount).map(
          ([activityKey, totalTaskCount]) =>
            Math.round(
              Array.from(balanceLatestByActivity.get(activityKey)?.values() || []).reduce(
                (sum, score) => sum + score,
                0
              ) / Math.max(totalTaskCount, 1)
            )
        );

        const nextScores: CategoryLiveScore = {
          physical: Math.round(
            physicalActivityScores.reduce((sum, score) => sum + score, 0) / physicalActivityScores.length
          ),
          mental: Math.round(
            mentalActivityScores.reduce((sum, score) => sum + score, 0) / mentalActivityScores.length
          ),
          social: Math.round(
            socialActivityScores.reduce((sum, score) => sum + score, 0) / socialActivityScores.length
          ),
          balance: Math.round(
            balanceActivityScores.reduce((sum, score) => sum + score, 0) / balanceActivityScores.length
          ),
        };

        if (!cancelled) {
          setLiveScores(nextScores);
        }
      } catch {
        if (!cancelled) {
          setLiveScores(null);
        }
      } finally {
        if (!cancelled) {
          setLiveScoresLoading(false);
        }
      }
    }

    void loadLiveScores();

    return () => {
      cancelled = true;
    };
  }, [weekStartKey, userId]);

  const summaries = useMemo<CategorySummary[]>(() => {
    return categoryConfig.map((category) => {
      const items = goals.filter((goal) => goal.category === category.key);
      const progress = liveScores?.[category.key] ?? 0;

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
  }, [goals, liveScores]);

  const overallProgress = useMemo(() => {
    if (summaries.length === 0) return 0;
    return Math.round(
      summaries.reduce((sum, category) => sum + category.progress, 0) / summaries.length
    );
  }, [summaries]);

  const scoreItems = [
    { label: "\u0e01\u0e32\u0e22", value: liveScores?.physical ?? 0, style: "bg-[#eef7fd] text-[#2e6a8b]" },
    { label: "\u0e43\u0e08", value: liveScores?.mental ?? 0, style: "bg-[#eef8f2] text-[#2f7b56]" },
    { label: "\u0e2a\u0e31\u0e07\u0e04\u0e21", value: liveScores?.social ?? 0, style: "bg-[#fff6ef] text-[#8a5a3a]" },
    { label: "\u0e2a\u0e21\u0e14\u0e38\u0e25", value: liveScores?.balance ?? 0, style: "bg-[#fff1f6] text-[#7a2a48]" },
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
        <WeekNavBar
          monthDate={weekStartDate} isCurrentMonth={isViewingCurrentWeek}
          isPrevDisabled={toDateKey(weekStartDate) <= toDateKey(getStartOfMonth(new Date(new Date().getFullYear(), 3, 1)))}
          onPrev={() => setWeekStartDate((prev) => addMonths(prev, -1))}
          onNext={() => { if (!isViewingCurrentWeek) setWeekStartDate((prev) => addMonths(prev, 1)); }}
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
                <img
                  src={snapshotImage}
                  alt=""
                  className="pointer-events-none absolute inset-0 h-full w-full object-cover opacity-24"
                />
                <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(135deg,rgba(255,255,255,0.94)_10%,rgba(248,252,255,0.88)_44%,rgba(239,250,245,0.8)_100%)]" />
                <div className="pointer-events-none absolute -right-16 -top-16 h-44 w-44 rounded-full bg-[#9ad4be]/20 blur-3xl" />
                <div className="pointer-events-none absolute -left-10 bottom-4 h-32 w-32 rounded-full bg-white/35 blur-3xl" />

                <div className="relative z-10">
                  <p className="text-xs font-semibold tracking-[0.14em] text-[#255f54]">GOALS SNAPSHOT</p>
                  <h2 className="mt-2 text-2xl font-extrabold leading-tight text-slate-900">สถานะเป้าหมายสุขสมดุล</h2>

                  <div className="mt-4 rounded-2xl border border-white/85 bg-white/76 p-3 shadow-[0_12px_28px_rgba(31,47,61,0.08)] backdrop-blur-sm">
                    <div className="mb-2 flex items-center justify-between text-xs text-slate-600">
                      <span>ความคืบหน้าโดยรวม</span>
                      <span className="font-semibold text-slate-900">{overallProgress}%</span>
                    </div>
                    <div className="h-2 rounded-full bg-slate-200/90">
                      <div
                        className="h-2 rounded-full bg-gradient-to-r from-[#7fc3a0] via-[#8cc2db] to-[#d88d80]"
                        style={{ width: `${overallProgress}%` }}
                      />
                    </div>
                  </div>

                  <div className="mt-4 grid grid-cols-3 gap-2 text-center">
                    <div className="rounded-2xl border border-white/75 bg-[#f8fafc]/86 px-2 py-3 shadow-[0_10px_24px_rgba(31,47,61,0.06)] backdrop-blur-sm">
                      <p className="text-xs text-slate-500">หมวดทั้งหมด</p>
                      <p className="text-lg font-bold text-slate-900">{summaries.length}</p>
                    </div>
                    <div className="rounded-2xl border border-white/75 bg-[#ecfdf3]/88 px-2 py-3 shadow-[0_10px_24px_rgba(31,47,61,0.06)] backdrop-blur-sm">
                      <p className="text-xs text-slate-500">กิจกรรมทั้งหมด</p>
                      <p className="text-lg font-bold text-[#166534]">{goals.length}</p>
                    </div>
                    <div className="rounded-2xl border border-white/75 bg-[#fff7ed]/88 px-2 py-3 shadow-[0_10px_24px_rgba(31,47,61,0.06)] backdrop-blur-sm">
                      <p className="text-xs text-slate-500">อัปเดตล่าสุด</p>
                      <p className="text-xs font-bold text-[#9a3412]">วันนี้</p>
                    </div>
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

                  {liveScoresLoading ? (
                    <div className="flex items-center gap-3 rounded-2xl bg-slate-50 p-4 text-sm text-slate-500">
                      <LoaderCircle size={18} className="animate-spin text-slate-400" />
                      <span>กำลังอัปเดตคะแนนจริงจากบันทึกล่าสุด...</span>
                    </div>
                  ) : (
                    <WellbeingRadarChart
                      physical={liveScores?.physical ?? 0}
                      mental={liveScores?.mental ?? 0}
                      social={liveScores?.social ?? 0}
                      balance={liveScores?.balance ?? 0}
                    />
                  )}

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
                {summaries.map((category) => {
                  const enabled = categoryEnabled[category.key];
                  const cardContent = (
                    <InfoCard className={`relative overflow-hidden rounded-3xl border-white/70 bg-white/80 shadow-[0_18px_40px_rgba(31,47,61,0.1)] backdrop-blur ${enabled ? "transition hover:-translate-y-0.5 hover:shadow-[0_20px_44px_rgba(31,47,61,0.14)]" : "grayscale"}`}>
                      <div className="pointer-events-none absolute inset-x-0 top-0 h-1 bg-linear-to-r from-[#d8e8f6] via-[#ebf4fd] to-[#f8fcff]" />
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <span className={`inline-flex h-8 w-8 items-center justify-center rounded-lg bg-white ${enabled ? category.iconColor : "text-slate-400"}`}>
                              <category.Icon size={17} />
                            </span>
                            <h3 className={`text-base font-semibold ${enabled ? "text-slate-900" : "text-slate-400"}`}>{category.label}</h3>
                          </div>

                          <p className="mt-2 text-sm text-slate-500">{category.subtitle}</p>

                          <div className="mt-3 h-2 rounded-full bg-slate-200">
                            {enabled && (
                              <div
                                className={`h-2 rounded-full ${category.progressColor} transition-all ${liveScoresLoading ? "animate-pulse opacity-60" : ""}`}
                                style={{ width: `${category.progress}%` }}
                              />
                            )}
                          </div>

                          <div className="mt-2 flex items-center justify-between gap-2">
                            <p className="text-sm text-slate-400">
                              {enabled ? (liveScoresLoading ? "กำลังคำนวณจากบันทึกล่าสุด" : `${category.count} กิจกรรม`) : "ปิดใช้งานชั่วคราว"}
                            </p>
                            {enabled ? (
                              liveScoresLoading ? (
                                <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600">
                                  <LoaderCircle size={12} className="animate-spin" />
                                  กำลังโหลด
                                </span>
                              ) : (
                                <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${category.chipStyle}`}>
                                  {category.progress}% • {category.statusText}
                                </span>
                              )
                            ) : (
                              <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-400">
                                <Lock size={10} />
                                ปิดอยู่
                              </span>
                            )}
                          </div>
                        </div>

                        <span className={`inline-flex h-8 w-8 items-center justify-center rounded-lg bg-white ${enabled ? "text-slate-400" : "text-slate-300"}`}>
                          {enabled ? <ChevronRight size={16} /> : <Lock size={15} />}
                        </span>
                      </div>
                    </InfoCard>
                  );

                  return enabled ? (
                    <Link key={category.key} to={`/goals/${category.key}`} className="block">
                      {cardContent}
                    </Link>
                  ) : (
                    <div key={category.key} className="block cursor-not-allowed opacity-60">
                      {cardContent}
                    </div>
                  );
                })}
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
