import { Activity, Brain, ChevronRight, Scale, Users } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import AppHeader from "../../../components/layout/AppHeader";
import CategoryRadarChart from "../../../components/charts/CategoryRadarChart";
import MobileShell from "../../../components/layout/MobileShell";
import InfoCard from "../../../components/ui/InfoCard";
import { goalsService } from "../../../services/goals.service";
import { logsService } from "../../../services/logs.service";
import type { Goal } from "../../../types/models";
import { getCurrentUserId } from "../../../utils/authSession";
import {
  getLogTimestamp as getMentalLogTimestamp,
  parsePositiveThinkingTaskNote,
} from "../task-detail/positiveThinkingTaskShared";
import { parseStressTaskNote } from "../task-detail/stressTaskShared";
import {
  getLogTimestamp as getSocialLogTimestamp,
  parseSocialTaskNote,
} from "../task-detail/socialTaskShared";
import {
  getLogTimestamp as getBalanceLogTimestamp,
  parseBalanceTaskNote,
} from "../task-detail/balanceTaskShared";
import { FAMILY_SOCIAL_BALANCE_TASKS } from "../tasks/familySocialBalanceTasks";
import { FAMILY_RELATIONSHIP_TASKS } from "../tasks/familyRelationshipTasks";
import { PERSONAL_LIFE_BALANCE_TASKS } from "../tasks/personalLifeBalanceTasks";
import { POSITIVE_THINKING_TASKS } from "../tasks/positiveThinkingTasks";
import { STRESS_TASKS } from "../tasks/stressTasks";
import { WORK_BALANCE_TASKS } from "../tasks/workBalanceTasks";
import { WORKPLACE_RELATIONSHIP_TASKS } from "../tasks/workplaceRelationshipTasks";

type ActivityItem = {
  label: string;
  subtitle: string;
  slug: string;
};

type CategoryConfig = {
  title: string;
  shortTitle: string;
  statusTitle: string;
  description: string;
  Icon: typeof Activity;
  iconColor: string;
  softCard: string;
  progressColor: string;
  activities: ActivityItem[];
};

type ActivityProgress = {
  currentValue: number;
  targetValue: number;
};

const CATEGORY_MAP: Record<string, CategoryConfig> = {
  physical: {
    title: "สุขภาวะทางกาย",
    shortTitle: "สุขภาวะทางกาย",
    statusTitle: "สถานะสุขภาวะทางกาย",
    description: "เลือกกิจกรรมด้านร่างกาย แล้วบันทึกค่ารายวันเพื่ออัปเดตคะแนนหมวดนี้",
    Icon: Activity,
    iconColor: "text-[#2e6a8b]",
    softCard: "bg-[#eef7fd]",
    progressColor: "bg-[#8cc2db]",
    activities: [
      {
        label: "การพักผ่อน",
        subtitle: "ดูรายละเอียดกิจกรรมด้านการพักผ่อน",
        slug: "rest",
      },
      {
        label: "การรับประทานอาหาร",
        subtitle: "ดูรายละเอียดกิจกรรมด้านการรับประทานอาหาร",
        slug: "food-intake",
      },
      {
        label: "การออกกำลังกาย",
        subtitle: "ดูรายละเอียดกิจกรรมด้านการออกกำลังกาย",
        slug: "exercise",
      },
      {
        label: "การดูแลรักษาความสะอาดของร่างกาย",
        subtitle: "ดูรายละเอียดกิจกรรมด้านการดูแลสุขอนามัย",
        slug: "body-hygiene",
      },
    ],
  },
  mental: {
    title: "สุขภาวะทางใจ",
    shortTitle: "สุขภาวะทางใจ",
    statusTitle: "สถานะสุขภาวะทางใจ",
    description: "ติดตามการดูแลใจของคุณผ่านกิจกรรมที่ออกแบบไว้ในแต่ละมิติ",
    Icon: Brain,
    iconColor: "text-[#2f7b56]",
    softCard: "bg-[#eef8f2]",
    progressColor: "bg-[#7fc3a0]",
    activities: [
      {
        label: "การมองโลกในแง่บวก",
        subtitle: "ดูรายละเอียดกิจกรรมด้านการมองโลกในแง่บวก",
        slug: "positive-thinking",
      },
      {
        label: "ระดับความเครียด",
        subtitle: "ดูรายละเอียดกิจกรรมด้านความเครียด",
        slug: "stress-level",
      },
      {
        label: "ระดับความพึงพอใจในชีวิต",
        subtitle: "ดูรายละเอียดกิจกรรมด้านความพึงพอใจในชีวิต",
        slug: "life-satisfaction",
      },
      {
        label: "การรู้สึกมีคุณค่าในตนเอง",
        subtitle: "ดูรายละเอียดกิจกรรมด้านคุณค่าในตนเอง",
        slug: "self-worth",
      },
    ],
  },
  social: {
    title: "สุขภาวะทางสังคม",
    shortTitle: "สุขภาวะทางสังคม",
    statusTitle: "สถานะสุขภาวะทางสังคม",
    description: "พัฒนาความสัมพันธ์รอบตัว และติดตามความเปลี่ยนแปลงผ่านคะแนนกิจกรรม",
    Icon: Users,
    iconColor: "text-[#8a5a3a]",
    softCard: "bg-[#fff6ef]",
    progressColor: "bg-[#d7b08f]",
    activities: [
      {
        label: "ความสัมพันธ์ระหว่างสมาชิกในครอบครัว",
        subtitle: "ดูรายละเอียดกิจกรรมด้านความสัมพันธ์ในครอบครัว",
        slug: "family-relationship",
      },
      {
        label: "การมีส่วนร่วมในชุมชนและสังคมรอบข้าง",
        subtitle: "ดูรายละเอียดกิจกรรมด้านการมีส่วนร่วมในสังคม",
        slug: "community-participation",
      },
      {
        label: "ความสัมพันธ์ในที่ทำงาน",
        subtitle: "ดูรายละเอียดกิจกรรมด้านความสัมพันธ์ในที่ทำงาน",
        slug: "workplace-relationship",
      },
    ],
  },
  balance: {
    title: "ความพอใจในสุขสมดุลระหว่างการทำงาน ครอบครัว สังคม และชีวิตส่วนตัว",
    shortTitle: "สุขสมดุลชีวิต",
    statusTitle: "สถานะสุขสมดุลชีวิต",
    description: "ติดตามความสมดุลของบทบาทชีวิต เพื่อดูภาพรวมที่สมดุลมากขึ้นในแต่ละเดือน",
    Icon: Scale,
    iconColor: "text-[#7a2a48]",
    softCard: "bg-[#fff1f6]",
    progressColor: "bg-[#d79bb4]",
    activities: [
      {
        label: "สมดุลระหว่างการทำงาน",
        subtitle: "ดูรายละเอียดกิจกรรมด้านสมดุลระหว่างการทำงาน",
        slug: "work-balance",
      },
      {
        label: "สมดุลระหว่างครอบครัวและสังคม",
        subtitle: "ดูรายละเอียดกิจกรรมด้านสมดุลระหว่างครอบครัวและสังคม",
        slug: "family-social-balance",
      },
      {
        label: "สมดุลระหว่างชีวิตส่วนตัว",
        subtitle: "ดูรายละเอียดกิจกรรมด้านสมดุลระหว่างชีวิตส่วนตัว",
        slug: "personal-life-balance",
      },
    ],
  },
};

function getActivityScore(goal?: Goal) {
  if (!goal) return 0;
  const current = Number(goal.current_value) || 0;
  const target = Number(goal.target_value) || 0;
  if (target <= 0) return 0;
  return Math.round(Math.min(current / target, 1) * 100);
}

function getActivityScoreFromProgress(progress?: ActivityProgress) {
  if (!progress) return 0;
  if (progress.targetValue <= 0) return 0;
  return Math.round(Math.min(progress.currentValue / progress.targetValue, 1) * 100);
}

function getScoreStatus(score: number) {
  if (score >= 80) return "ดีมาก";
  if (score >= 60) return "ดี";
  if (score >= 40) return "กำลังพัฒนา";
  if (score > 0) return "เริ่มต้น";
  return "ยังไม่มีข้อมูล";
}

function getScoreChip(score: number) {
  if (score >= 80) return "bg-emerald-50 text-emerald-700";
  if (score >= 60) return "bg-sky-50 text-sky-700";
  if (score >= 40) return "bg-amber-50 text-amber-700";
  if (score > 0) return "bg-orange-50 text-orange-700";
  return "bg-slate-100 text-slate-600";
}

function formatThaiDate(value: Date) {
  return value.toLocaleDateString("th-TH", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export default function GoalCategoryPage() {
  const { category } = useParams<{ category: string }>();
  const config = CATEGORY_MAP[category ?? "physical"] ?? CATEGORY_MAP.physical;
  const userId = getCurrentUserId();

  const [goals, setGoals] = useState<Goal[]>([]);
  const [liveActivityProgress, setLiveActivityProgress] = useState<Record<string, ActivityProgress>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

    async function loadLiveActivityProgress() {
      if (!category || !["mental", "social", "balance"].includes(category)) {
        setLiveActivityProgress({});
        return;
      }

      try {
        if (category === "mental") {
          const response = await logsService.listMentalTaskLogs(userId ?? undefined, {
            limit: 480,
            forceRefresh: true,
          });

          if (!response.success) {
            if (!cancelled) setLiveActivityProgress({});
            return;
          }

          const positiveLatestByTask = new Map<string, number>();
          const stressLatestByTask = new Map<string, number>();

          [...(response.data || [])]
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
              }
            });

          const positiveScore = Math.round(
            Array.from(positiveLatestByTask.values()).reduce((sum, score) => sum + score, 0) /
              Math.max(POSITIVE_THINKING_TASKS.length, 1)
          );
          const stressScore = Math.round(
            Array.from(stressLatestByTask.values()).reduce((sum, score) => sum + score, 0) /
              Math.max(STRESS_TASKS.length, 1)
          );

          if (!cancelled) {
            setLiveActivityProgress({
              "positive-thinking": { currentValue: positiveScore, targetValue: 100 },
              "stress-level": { currentValue: stressScore, targetValue: 100 },
            });
          }
          return;
        }

        if (category === "social") {
          const response = await logsService.listSocialTaskLogs(userId ?? undefined, {
            limit: 480,
            forceRefresh: true,
          });

          if (!response.success) {
            if (!cancelled) setLiveActivityProgress({});
            return;
          }

          const activityTaskCount: Record<string, number> = {
            "family-relationship": FAMILY_RELATIONSHIP_TASKS.length,
            "community-participation": 1,
            "workplace-relationship": WORKPLACE_RELATIONSHIP_TASKS.length,
          };
          const latestByActivity = new Map<string, Map<string, number>>();

          [...(response.data || [])]
            .sort((a, b) => getSocialLogTimestamp(b) - getSocialLogTimestamp(a))
            .forEach((log) => {
              const parsed = parseSocialTaskNote(String(log.note));
              if (!parsed) return;

              const latestByTask = latestByActivity.get(parsed.activity) ?? new Map<string, number>();
              if (!latestByTask.has(parsed.task)) {
                latestByTask.set(parsed.task, parsed.score);
              }
              latestByActivity.set(parsed.activity, latestByTask);
            });

          const nextProgress = Object.fromEntries(
            Object.entries(activityTaskCount).map(([activityKey, totalTaskCount]) => {
              const totalScore = Array.from(latestByActivity.get(activityKey)?.values() || []).reduce(
                (sum, score) => sum + score,
                0
              );
              return [
                activityKey,
                {
                  currentValue: Math.round(totalScore / Math.max(totalTaskCount, 1)),
                  targetValue: 100,
                },
              ];
            })
          ) as Record<string, ActivityProgress>;

          if (!cancelled) {
            setLiveActivityProgress(nextProgress);
          }
          return;
        }

        const response = await logsService.listBalanceTaskLogs(userId ?? undefined, {
          limit: 480,
          forceRefresh: true,
        });

        if (!response.success) {
          if (!cancelled) setLiveActivityProgress({});
          return;
        }

        const activityTaskCount: Record<string, number> = {
          "family-social-balance": FAMILY_SOCIAL_BALANCE_TASKS.length,
          "work-balance": WORK_BALANCE_TASKS.length,
          "personal-life-balance": PERSONAL_LIFE_BALANCE_TASKS.length,
        };
        const latestByActivity = new Map<string, Map<string, number>>();

        [...(response.data || [])]
          .sort((a, b) => getBalanceLogTimestamp(b) - getBalanceLogTimestamp(a))
          .forEach((log) => {
            const parsed = parseBalanceTaskNote(String(log.note));
            if (!parsed) return;

            const latestByTask = latestByActivity.get(parsed.activity) ?? new Map<string, number>();
            if (!latestByTask.has(parsed.task)) {
              latestByTask.set(parsed.task, parsed.score);
            }
            latestByActivity.set(parsed.activity, latestByTask);
          });

        const nextProgress = Object.fromEntries(
          Object.entries(activityTaskCount).map(([activityKey, totalTaskCount]) => {
            const totalScore = Array.from(latestByActivity.get(activityKey)?.values() || []).reduce(
              (sum, score) => sum + score,
              0
            );
            return [
              activityKey,
              {
                currentValue: Math.round(totalScore / Math.max(totalTaskCount, 1)),
                targetValue: 100,
              },
            ];
          })
        ) as Record<string, ActivityProgress>;

        if (!cancelled) {
          setLiveActivityProgress(nextProgress);
        }
      } catch {
        if (!cancelled) {
          setLiveActivityProgress({});
        }
      }
    }

    void loadLiveActivityProgress();

    return () => {
      cancelled = true;
    };
  }, [category, userId]);

  const categoryGoals = useMemo(() => {
    return goals.filter((goal) => goal.category === (category ?? "physical"));
  }, [category, goals]);

  const goalByActivity = useMemo(() => {
    const map = new Map<string, Goal>();
    categoryGoals.forEach((goal) => {
      map.set(goal.activity, goal);
    });
    return map;
  }, [categoryGoals]);

  const chartItems = useMemo(() => {
    return config.activities.map((activity) => {
      const matchedGoal = goalByActivity.get(activity.slug);
      const liveProgress = liveActivityProgress[activity.slug];
      return {
        label: activity.label,
        score: liveProgress ? getActivityScoreFromProgress(liveProgress) : getActivityScore(matchedGoal),
      };
    });
  }, [config.activities, goalByActivity, liveActivityProgress]);

  const overallScore = useMemo(() => {
    if (chartItems.length === 0) return 0;
    return Math.round(chartItems.reduce((sum, item) => sum + item.score, 0) / chartItems.length);
  }, [chartItems]);

  const completedCount = useMemo(() => {
    return chartItems.filter((item) => item.score >= 100).length;
  }, [chartItems]);

  return (
    <MobileShell>
      <div className="relative min-h-screen overflow-hidden bg-[radial-gradient(circle_at_top_right,#fff6db_0%,#f7fdff_42%,#e8f7ef_100%)]">
        <div className="pointer-events-none absolute -left-20 top-14 h-56 w-56 rounded-full bg-[#ffc9a3]/20 blur-3xl" />
        <div className="pointer-events-none absolute -right-20 bottom-28 h-56 w-56 rounded-full bg-[#7dcdb8]/20 blur-3xl" />

        <AppHeader
          title={config.shortTitle}
          showBack
          showBell
          variant="soft"
          subtitle={loading ? "กำลังโหลดข้อมูล..." : "เลือกกิจกรรมเพื่ออัปเดตคะแนน"}
        />

        <main className="relative z-10 space-y-4 px-4 py-4">
          {error ? (
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
          ) : null}

          <section className="relative overflow-hidden rounded-[30px] border border-white/80 bg-[linear-gradient(145deg,rgba(255,255,255,0.94)_0%,rgba(247,252,255,0.92)_46%,rgba(238,248,242,0.9)_100%)] p-5 shadow-[0_24px_52px_rgba(31,47,61,0.14)] backdrop-blur">
            <div className="pointer-events-none absolute -left-12 top-16 h-36 w-36 rounded-full bg-[#ffd8bf]/22 blur-3xl" />
            <div className="pointer-events-none absolute -right-10 -top-12 h-44 w-44 rounded-full bg-[#9ad4be]/18 blur-3xl" />
            <div className="pointer-events-none absolute bottom-0 right-0 translate-x-8 translate-y-8 opacity-[0.08]">
              <config.Icon size={196} strokeWidth={1.5} className={config.iconColor} />
            </div>

            <div className="relative z-10 flex items-start justify-between gap-3">
              <div className="flex min-w-0 items-start gap-3">
                <span
                  className={`inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-white/80 bg-white/90 shadow-[0_10px_24px_rgba(31,47,61,0.08)] ${config.iconColor}`}
                >
                  <config.Icon size={22} />
                </span>
                <div className="min-w-0">
                  <p className="text-xs font-semibold tracking-[0.16em] text-[#255f54]">CATEGORY OVERVIEW</p>
                  <h2 className="mt-1 text-[1.75rem] font-extrabold leading-tight text-slate-900">{config.shortTitle}</h2>
                  <p className="mt-1 text-sm font-medium text-slate-500">{formatThaiDate(new Date())}</p>
                </div>
              </div>

              <div className="rounded-full border border-white/80 bg-white/80 px-3 py-1.5 text-[11px] font-semibold text-slate-600 shadow-[0_8px_18px_rgba(31,47,61,0.08)] backdrop-blur">
                อัปเดตวันนี้
              </div>
            </div>

            <p className="relative z-10 mt-4 max-w-[30rem] text-sm leading-7 text-slate-600">{config.description}</p>

            <div className="relative z-10 mt-5 grid grid-cols-3 gap-3 text-center">
              <div className="rounded-[22px] border border-white/80 bg-white/72 px-2 py-3 shadow-[0_10px_24px_rgba(31,47,61,0.06)] backdrop-blur">
                <p className="text-[11px] font-semibold tracking-[0.08em] text-slate-400">กิจกรรม</p>
                <p className="mt-2 text-[1.7rem] font-extrabold leading-none text-slate-900">{config.activities.length}</p>
              </div>
              <div className="rounded-[22px] border border-white/80 bg-[#eef8f2]/88 px-2 py-3 shadow-[0_10px_24px_rgba(31,47,61,0.06)] backdrop-blur">
                <p className="text-[11px] font-semibold tracking-[0.08em] text-slate-400">สำเร็จ</p>
                <p className="mt-2 text-[1.7rem] font-extrabold leading-none text-[#166534]">{completedCount}</p>
              </div>
              <div className="rounded-[22px] border border-white/80 bg-[#fff7ed]/88 px-2 py-3 shadow-[0_10px_24px_rgba(31,47,61,0.06)] backdrop-blur">
                <p className="text-[11px] font-semibold tracking-[0.08em] text-slate-400">คะแนนเฉลี่ย</p>
                <p className="mt-2 text-[1.7rem] font-extrabold leading-none text-[#9a3412]">{overallScore}%</p>
              </div>
            </div>

          </section>

          <InfoCard className="rounded-3xl border-white/70 bg-white/80 shadow-[0_18px_40px_rgba(31,47,61,0.1)] backdrop-blur">
            <div className="space-y-3">
              <h3 className="text-base font-semibold text-slate-900">{config.statusTitle}</h3>

              {loading ? (
                <div className="rounded-2xl bg-slate-50 p-4 text-sm text-slate-500">กำลังโหลดข้อมูลสุขภาวะ...</div>
              ) : (
                <CategoryRadarChart items={chartItems} />
              )}

              <div className={`rounded-2xl px-3 py-2 text-xs ${config.softCard} text-slate-700`}>
                เมื่อบันทึกค่าที่หน้ากิจกรรม คะแนนจะสะท้อนในกราฟหมวดนี้ และกลับไปแสดงบนกราฟหลักหน้าเป้าหมาย
              </div>
            </div>
          </InfoCard>

          <section className="space-y-3">
            {config.activities.map((activity) => {
              const matchedGoal = goalByActivity.get(activity.slug);
              const liveProgress = liveActivityProgress[activity.slug];
              const score = liveProgress
                ? getActivityScoreFromProgress(liveProgress)
                : getActivityScore(matchedGoal);
              const statusText = getScoreStatus(score);
              const currentValue = liveProgress?.currentValue ?? (Number(matchedGoal?.current_value) || 0);
              const targetValue = liveProgress?.targetValue ?? (Number(matchedGoal?.target_value) || 0);

              return (
                <Link key={activity.slug} to={`/goals/${category}/${activity.slug}`} className="block">
                  <InfoCard className="relative overflow-hidden rounded-3xl border-white/70 bg-white/80 shadow-[0_18px_40px_rgba(31,47,61,0.1)] backdrop-blur transition hover:-translate-y-0.5 hover:shadow-[0_20px_44px_rgba(31,47,61,0.14)]">
                    <div className="pointer-events-none absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-[#d8e8f6] via-[#ebf4fd] to-[#f8fcff]" />
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        <h3 className="text-base font-semibold leading-6 text-slate-900">{activity.label}</h3>
                        <p className="mt-1 text-sm leading-6 text-slate-500">{activity.subtitle}</p>

                        <div className="mt-3 h-2 rounded-full bg-slate-200">
                          <div
                            className={`h-2 rounded-full ${config.progressColor} transition-all`}
                            style={{ width: `${score}%` }}
                          />
                        </div>

                        <div className="mt-2 flex items-center justify-between gap-2">
                          <p className="text-sm text-slate-500">
                            {matchedGoal
                              ? `ความคืบหน้า ${currentValue}/${targetValue || "-"}`
                              : "ยังไม่ตั้งเป้าหมาย"}
                          </p>
                          <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${getScoreChip(score)}`}>
                            {score}% • {statusText}
                          </span>
                        </div>
                      </div>

                      <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-white text-slate-400">
                        <ChevronRight size={16} />
                      </span>
                    </div>
                  </InfoCard>
                </Link>
              );
            })}
          </section>
        </main>
      </div>
    </MobileShell>
  );
}
