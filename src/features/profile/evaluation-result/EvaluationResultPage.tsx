import {
  Activity,
  Brain,
  ChevronDown,
  ChevronUp,
  LoaderCircle,
  Scale,
  Users,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import AppHeader from "../../../components/layout/AppHeader";
import MobileShell from "../../../components/layout/MobileShell";
import InfoCard from "../../../components/ui/InfoCard";
import WellbeingRadarChart from "../../../components/charts/WellbeingRadarChart";
import { logsService } from "../../../services/logs.service";
import { getCurrentUserId } from "../../../utils/authSession";
import {
  getLogTimestamp as getMentalLogTimestamp,
  parsePositiveThinkingTaskNote,
} from "../../goals/task-detail/positiveThinkingTaskShared";
import { parseStressTaskNote } from "../../goals/task-detail/stressTaskShared";
import {
  getLogTimestamp as getSocialLogTimestamp,
  parseSocialTaskNote,
} from "../../goals/task-detail/socialTaskShared";
import {
  getLogTimestamp as getBalanceLogTimestamp,
  parseBalanceTaskNote,
} from "../../goals/task-detail/balanceTaskShared";
import {
  getLogTimestamp as getScaffoldedLogTimestamp,
  parseScaffoldedTaskNote,
} from "../../goals/task-detail/scaffoldedTaskShared";
import { FAMILY_SOCIAL_BALANCE_TASKS } from "../../goals/tasks/familySocialBalanceTasks";
import { FAMILY_RELATIONSHIP_TASKS } from "../../goals/tasks/familyRelationshipTasks";
import { PERSONAL_LIFE_BALANCE_TASKS } from "../../goals/tasks/personalLifeBalanceTasks";
import { POSITIVE_THINKING_TASKS } from "../../goals/tasks/positiveThinkingTasks";
import { REST_TASKS } from "../../goals/tasks/restTasks";
import { getScaffoldedActivityConfig } from "../../goals/tasks/scaffoldedActivityTasks";
import { STRESS_TASKS } from "../../goals/tasks/stressTasks";
import { WORK_BALANCE_TASKS } from "../../goals/tasks/workBalanceTasks";
import { WORKPLACE_RELATIONSHIP_TASKS } from "../../goals/tasks/workplaceRelationshipTasks";

type CategoryKey = "physical" | "mental" | "social" | "balance";

type ActivityDetail = {
  slug: string;
  label: string;
  subtitle: string;
  score: number;
};

type CategoryDetail = {
  key: CategoryKey;
  label: string;
  subtitle: string;
  Icon: typeof Activity;
  accentClass: string;
  chipClass: string;
  softClass: string;
  score: number;
  activities: ActivityDetail[];
};

const CATEGORY_META: Record<
  CategoryKey,
  {
    label: string;
    subtitle: string;
    Icon: typeof Activity;
    accentClass: string;
    chipClass: string;
    softClass: string;
  }
> = {
  physical: {
    label: "สุขภาวะทางกาย",
    subtitle: "การนอน อาหาร การขยับร่างกาย และการดูแลตัวเอง",
    Icon: Activity,
    accentClass: "bg-[#8cc2db]",
    chipClass: "bg-[#eef7fd] text-[#2e6a8b]",
    softClass: "bg-[#f4fbff]",
  },
  mental: {
    label: "สุขภาวะทางใจ",
    subtitle: "มุมมอง ความเครียด ความพึงพอใจ และคุณค่าในตัวเอง",
    Icon: Brain,
    accentClass: "bg-[#7fc3a0]",
    chipClass: "bg-[#eef8f2] text-[#2f7b56]",
    softClass: "bg-[#f4fcf7]",
  },
  social: {
    label: "สุขภาวะทางสังคม",
    subtitle: "ครอบครัว ชุมชน และความสัมพันธ์ในที่ทำงาน",
    Icon: Users,
    accentClass: "bg-[#d7b08f]",
    chipClass: "bg-[#fff6ef] text-[#8a5a3a]",
    softClass: "bg-[#fffaf6]",
  },
  balance: {
    label: "สุขสมดุลชีวิต",
    subtitle: "สมดุลงาน ครอบครัว สังคม และเวลาส่วนตัว",
    Icon: Scale,
    accentClass: "bg-[#d79bb4]",
    chipClass: "bg-[#fff1f6] text-[#7a2a48]",
    softClass: "bg-[#fff7fa]",
  },
};

const PHYSICAL_ACTIVITY_META = [
  {
    slug: "rest",
    label: "การพักผ่อน",
    subtitle: "ดูจังหวะการนอนและพฤติกรรมก่อนนอน",
  },
  {
    slug: "food-intake",
    label: "การรับประทานอาหาร",
    subtitle: "ติดตามพฤติกรรมการกินพื้นฐานในแต่ละวัน",
  },
  {
    slug: "exercise",
    label: "การออกกำลังกาย",
    subtitle: "เช็กการขยับตัวและการเคลื่อนไหวของร่างกาย",
  },
  {
    slug: "body-hygiene",
    label: "การดูแลรักษาความสะอาดของร่างกาย",
    subtitle: "ดูความสม่ำเสมอของกิจวัตรดูแลตัวเอง",
  },
] as const;

const MENTAL_ACTIVITY_META = [
  {
    slug: "positive-thinking",
    label: "การมองโลกในแง่บวก",
    subtitle: "ฝึกมองสิ่งรอบตัวในด้านที่ช่วยให้ใจเบาขึ้น",
  },
  {
    slug: "stress-level",
    label: "ระดับความเครียด",
    subtitle: "ติดตามกิจกรรมที่ช่วยลดความเครียดระหว่างวัน",
  },
  {
    slug: "life-satisfaction",
    label: "ระดับความพึงพอใจในชีวิต",
    subtitle: "สำรวจความรู้สึกพอใจกับชีวิตในภาพรวม",
  },
  {
    slug: "self-worth",
    label: "การรู้สึกมีคุณค่าในตนเอง",
    subtitle: "สังเกตการมองเห็นคุณค่าและการยอมรับตัวเอง",
  },
] as const;

const SOCIAL_ACTIVITY_META = [
  {
    slug: "family-relationship",
    label: "ความสัมพันธ์ระหว่างสมาชิกในครอบครัว",
    subtitle: "บรรยากาศในบ้านและการสื่อสารที่ดีต่อกัน",
  },
  {
    slug: "community-participation",
    label: "การมีส่วนร่วมในชุมชนและสังคมรอบข้าง",
    subtitle: "การเปิดใจมีส่วนร่วมกับผู้คนและกิจกรรมรอบตัว",
  },
  {
    slug: "workplace-relationship",
    label: "ความสัมพันธ์ในที่ทำงาน",
    subtitle: "ความร่วมมือและความสบายใจในการทำงานร่วมกับผู้อื่น",
  },
] as const;

const BALANCE_ACTIVITY_META = [
  {
    slug: "work-balance",
    label: "สมดุลระหว่างการทำงาน",
    subtitle: "จังหวะงานที่พอดี ไม่หนักจนเกินไป",
  },
  {
    slug: "family-social-balance",
    label: "สมดุลระหว่างครอบครัวและสังคม",
    subtitle: "แบ่งเวลาให้ความสัมพันธ์สำคัญอย่างเหมาะสม",
  },
  {
    slug: "personal-life-balance",
    label: "สมดุลระหว่างชีวิตส่วนตัว",
    subtitle: "เว้นพื้นที่ให้ตัวเองและกิจกรรมที่เติมพลัง",
  },
] as const;

function formatThaiDate(value: Date) {
  return value.toLocaleDateString("th-TH", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function getStatusText(score: number) {
  if (score >= 80) return "ดีมาก";
  if (score >= 60) return "ดี";
  if (score >= 40) return "กำลังพัฒนา";
  if (score > 0) return "เริ่มต้น";
  return "ยังไม่มีข้อมูล";
}

function getStatusChip(score: number) {
  if (score >= 80) return "bg-emerald-50 text-emerald-700";
  if (score >= 60) return "bg-sky-50 text-sky-700";
  if (score >= 40) return "bg-amber-50 text-amber-700";
  if (score > 0) return "bg-orange-50 text-orange-700";
  return "bg-slate-100 text-slate-600";
}

function averageFromScores(scores: number[], divisor?: number) {
  const total = scores.reduce((sum, score) => sum + score, 0);
  const count = divisor ?? scores.length;
  if (count <= 0) return 0;
  return Math.round(total / count);
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

export default function EvaluationResultPage() {
  const userId = getCurrentUserId();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expanded, setExpanded] = useState<CategoryKey | null>(null);
  const [categories, setCategories] = useState<CategoryDetail[]>([]);

  useEffect(() => {
    let cancelled = false;

    async function loadEvaluation() {
      try {
        setLoading(true);
        setError(null);

        const [restResponse, physicalResponse, mentalResponse, socialResponse, balanceResponse] =
          await Promise.all([
            logsService.listRestTaskLogs(userId ?? undefined, {
              limit: 480,
              forceRefresh: true,
            }),
            logsService.listDailyLogs(userId ?? undefined, {
              entry_type: "physical_task",
              category: "physical",
              limit: 480,
              forceRefresh: true,
            }),
            logsService.listMentalTaskLogs(userId ?? undefined, {
              limit: 480,
              forceRefresh: true,
            }),
            logsService.listSocialTaskLogs(userId ?? undefined, {
              limit: 480,
              forceRefresh: true,
            }),
            logsService.listBalanceTaskLogs(userId ?? undefined, {
              limit: 480,
              forceRefresh: true,
            }),
          ]);

        if (
          !restResponse.success ||
          !physicalResponse.success ||
          !mentalResponse.success ||
          !socialResponse.success ||
          !balanceResponse.success
        ) {
          throw new Error("ไม่สามารถโหลดผลประเมินภาวะสุขสมดุลได้");
        }

        const restLatestByTask = new Map<string, number>();
        [...(restResponse.data || [])]
          .sort((a, b) => getScaffoldedLogTimestamp(b) - getScaffoldedLogTimestamp(a))
          .forEach((log) => {
            const parsed = parseRestTaskScore(String(log.note));
            if (!parsed || restLatestByTask.has(parsed.task)) return;
            restLatestByTask.set(parsed.task, parsed.score);
          });

        const physicalLatestByActivity = new Map<string, Map<string, number>>();
        [...(physicalResponse.data || [])]
          .sort((a, b) => getScaffoldedLogTimestamp(b) - getScaffoldedLogTimestamp(a))
          .forEach((log) => {
            const parsed = parsePhysicalTaskActivity(String(log.note));
            if (!parsed) return;
            const latestByTask = physicalLatestByActivity.get(parsed.activity) ?? new Map<string, number>();
            if (!latestByTask.has(parsed.task)) {
              latestByTask.set(parsed.task, parsed.score);
            }
            physicalLatestByActivity.set(parsed.activity, latestByTask);
          });

        const physicalActivities: ActivityDetail[] = PHYSICAL_ACTIVITY_META.map((activity) => {
          if (activity.slug === "rest") {
            return {
              ...activity,
              score: averageFromScores(Array.from(restLatestByTask.values()), REST_TASKS.length),
            };
          }

          const taskCount = getScaffoldedActivityConfig("physical", activity.slug)?.tasks.length ?? 0;
          const scores = Array.from(physicalLatestByActivity.get(activity.slug)?.values() || []);
          return {
            ...activity,
            score: averageFromScores(scores, taskCount),
          };
        });

        const positiveLatestByTask = new Map<string, number>();
        const stressLatestByTask = new Map<string, number>();
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

            for (const activity of ["life-satisfaction", "self-worth"] as const) {
              const parsed = parseScaffoldedTaskNote(String(log.note), "mental", activity);
              if (!parsed) continue;
              const latestByTask =
                scaffoldedMentalLatestByActivity.get(activity) ?? new Map<string, number>();
              if (!latestByTask.has(parsed.task)) {
                latestByTask.set(parsed.task, parsed.score);
              }
              scaffoldedMentalLatestByActivity.set(activity, latestByTask);
              break;
            }
          });

        const mentalActivities: ActivityDetail[] = MENTAL_ACTIVITY_META.map((activity) => {
          if (activity.slug === "positive-thinking") {
            return {
              ...activity,
              score: averageFromScores(
                Array.from(positiveLatestByTask.values()),
                POSITIVE_THINKING_TASKS.length
              ),
            };
          }

          if (activity.slug === "stress-level") {
            return {
              ...activity,
              score: averageFromScores(
                Array.from(stressLatestByTask.values()),
                STRESS_TASKS.length
              ),
            };
          }

          const taskCount = getScaffoldedActivityConfig("mental", activity.slug)?.tasks.length ?? 0;
          const scores = Array.from(scaffoldedMentalLatestByActivity.get(activity.slug)?.values() || []);
          return {
            ...activity,
            score: averageFromScores(scores, taskCount),
          };
        });

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

        const socialActivities: ActivityDetail[] = SOCIAL_ACTIVITY_META.map((activity) => ({
          ...activity,
          score: averageFromScores(
            Array.from(socialLatestByActivity.get(activity.slug)?.values() || []),
            socialActivityTaskCount[activity.slug] ?? 0
          ),
        }));

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

        const balanceActivities: ActivityDetail[] = BALANCE_ACTIVITY_META.map((activity) => ({
          ...activity,
          score: averageFromScores(
            Array.from(balanceLatestByActivity.get(activity.slug)?.values() || []),
            balanceActivityTaskCount[activity.slug] ?? 0
          ),
        }));

        const nextCategories: CategoryDetail[] = [
          {
            key: "physical",
            ...CATEGORY_META.physical,
            score: averageFromScores(physicalActivities.map((item) => item.score)),
            activities: physicalActivities,
          },
          {
            key: "mental",
            ...CATEGORY_META.mental,
            score: averageFromScores(mentalActivities.map((item) => item.score)),
            activities: mentalActivities,
          },
          {
            key: "social",
            ...CATEGORY_META.social,
            score: averageFromScores(socialActivities.map((item) => item.score)),
            activities: socialActivities,
          },
          {
            key: "balance",
            ...CATEGORY_META.balance,
            score: averageFromScores(balanceActivities.map((item) => item.score)),
            activities: balanceActivities,
          },
        ];

        if (!cancelled) {
          setCategories(nextCategories);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "เกิดข้อผิดพลาดที่ไม่ทราบสาเหตุ");
          setCategories([]);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void loadEvaluation();

    return () => {
      cancelled = true;
    };
  }, [userId]);

  const overallProgress = useMemo(() => {
    if (categories.length === 0) return 0;
    return averageFromScores(categories.map((category) => category.score));
  }, [categories]);

  return (
    <MobileShell>
      <div className="relative min-h-screen overflow-hidden bg-[radial-gradient(circle_at_top_right,#fff6db_0%,#f7fdff_42%,#e8f7ef_100%)]">
        <div className="pointer-events-none absolute -left-20 top-10 h-56 w-56 rounded-full bg-[#ffc9a3]/20 blur-3xl" />
        <div className="pointer-events-none absolute -right-20 bottom-24 h-56 w-56 rounded-full bg-[#7dcdb8]/20 blur-3xl" />
        <div className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-white/45 to-transparent" />

        <AppHeader
          title="ผลประเมินภาวะสุขสมดุล"
          subtitle={loading ? "กำลังสรุปข้อมูลจากทั้ง 4 ด้าน..." : "สรุปภาพรวมและกดดูรายละเอียดของแต่ละด้านได้ในหน้าเดียว"}
          showBack
          showBell
          variant="soft"
        />

        <main className="relative z-10 space-y-4 px-4 py-6">
          {error ? (
            <InfoCard className="rounded-3xl border-rose-200 bg-rose-50/90">
              <div className="space-y-3">
                <p className="text-sm text-rose-700">{error}</p>
              </div>
            </InfoCard>
          ) : null}

          <section className="relative overflow-hidden rounded-[30px] border border-white/80 bg-[linear-gradient(145deg,rgba(255,255,255,0.94)_0%,rgba(247,252,255,0.92)_46%,rgba(238,248,242,0.9)_100%)] p-5 shadow-[0_24px_52px_rgba(31,47,61,0.14)] backdrop-blur">
            <div className="pointer-events-none absolute -left-12 top-16 h-36 w-36 rounded-full bg-[#ffd8bf]/22 blur-3xl" />
            <div className="pointer-events-none absolute -right-10 -top-12 h-44 w-44 rounded-full bg-[#9ad4be]/18 blur-3xl" />

            <div className="relative z-10">
              <p className="text-xs font-semibold tracking-[0.16em] text-[#255f54]">WELLBEING EVALUATION</p>
              <h2 className="mt-2 text-2xl font-extrabold leading-tight text-slate-900">ภาพรวมภาวะสุขสมดุลของคุณ</h2>
              <p className="mt-1 text-sm text-slate-500">อัปเดตล่าสุด {formatThaiDate(new Date())}</p>

              <div className="mt-4 rounded-2xl border border-white/85 bg-white/76 p-3 shadow-[0_12px_28px_rgba(31,47,61,0.08)] backdrop-blur-sm">
                <div className="mb-2 flex items-center justify-between text-xs text-slate-600">
                  <span>คะแนนเฉลี่ยทั้ง 4 ด้าน</span>
                  <span className="font-semibold text-slate-900">{overallProgress}%</span>
                </div>
                <div className="h-2 rounded-full bg-slate-200/90">
                  <div
                    className="h-2 rounded-full bg-gradient-to-r from-[#7fc3a0] via-[#8cc2db] to-[#d79bb4]"
                    style={{ width: `${overallProgress}%` }}
                  />
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

              {loading ? (
                <div className="flex items-center gap-3 rounded-2xl bg-slate-50 p-4 text-sm text-slate-500">
                  <LoaderCircle size={18} className="animate-spin text-slate-400" />
                  <span>กำลังประมวลผลคะแนนจริงจากบันทึกล่าสุด...</span>
                </div>
              ) : (
                <WellbeingRadarChart
                  physical={categories.find((item) => item.key === "physical")?.score ?? 0}
                  mental={categories.find((item) => item.key === "mental")?.score ?? 0}
                  social={categories.find((item) => item.key === "social")?.score ?? 0}
                  balance={categories.find((item) => item.key === "balance")?.score ?? 0}
                />
              )}
            </div>
          </InfoCard>

          <section className="space-y-3">
            {categories.map((category) => {
              const isOpen = expanded === category.key;
              return (
                <InfoCard
                  key={category.key}
                  className="overflow-hidden rounded-3xl border-white/70 bg-white/82 shadow-[0_18px_40px_rgba(31,47,61,0.1)] backdrop-blur"
                >
                  <button
                    type="button"
                    onClick={() => setExpanded((prev) => (prev === category.key ? null : category.key))}
                    className="flex w-full items-start justify-between gap-3 text-left"
                  >
                    <div className="flex min-w-0 flex-1 items-start gap-3">
                      <span
                        className={`inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl ${category.softClass}`}
                      >
                        <category.Icon size={20} className="text-slate-700" />
                      </span>
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="text-base font-semibold text-slate-900">{category.label}</h3>
                          <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${category.chipClass}`}>
                            {category.score}% • {getStatusText(category.score)}
                          </span>
                        </div>
                        <p className="mt-1 text-sm leading-6 text-slate-500">{category.subtitle}</p>
                        <div className="mt-3 h-2 rounded-full bg-slate-200">
                          <div
                            className={`h-2 rounded-full ${category.accentClass}`}
                            style={{ width: `${category.score}%` }}
                          />
                        </div>
                      </div>
                    </div>

                    <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white text-slate-400 shadow-[0_8px_18px_rgba(31,47,61,0.08)]">
                      {isOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                    </span>
                  </button>

                  {isOpen ? (
                    <div className="mt-4 space-y-3 border-t border-slate-100 pt-4">
                      {category.activities.map((activity) => (
                        <div key={activity.slug} className="rounded-2xl border border-slate-100 bg-slate-50/90 p-4">
                          <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0 flex-1">
                              <p className="text-sm font-semibold text-slate-900">{activity.label}</p>
                              <p className="mt-1 text-xs leading-6 text-slate-500">{activity.subtitle}</p>
                            </div>
                            <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${getStatusChip(activity.score)}`}>
                              {activity.score}%
                            </span>
                          </div>
                          <div className="mt-3 h-2 rounded-full bg-slate-200">
                            <div
                              className={`h-2 rounded-full ${category.accentClass}`}
                              style={{ width: `${activity.score}%` }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : null}
                </InfoCard>
              );
            })}
          </section>
        </main>
      </div>
    </MobileShell>
  );
}
