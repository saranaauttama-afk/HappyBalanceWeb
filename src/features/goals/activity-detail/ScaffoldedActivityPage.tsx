import { Activity, BadgeHelp, ChevronRight, Dumbbell, Heart, ShieldCheck, Sparkles } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import AppHeader from "../../../components/layout/AppHeader";
import MobileShell from "../../../components/layout/MobileShell";
import WeekNavBar from "../../../components/ui/WeekNavBar";
import { getCurrentUserId } from "../../../utils/authSession";
import { addDays, getStartOfWeek, isCurrentWeek, toDateKey } from "../../../utils/weekPeriod";
import { getScaffoldedActivityConfig } from "../tasks/scaffoldedActivityTasks";
import {
  getLogTimestamp,
  listScaffoldedTaskLogs,
  parseScaffoldedTaskNote,
} from "../task-detail/scaffoldedTaskShared";

function getActivityIcon(activitySlug?: string) {
  switch (activitySlug) {
    case "food-intake": return Activity;
    case "exercise": return Dumbbell;
    case "body-hygiene": return ShieldCheck;
    case "life-satisfaction": return Sparkles;
    case "self-worth": return Heart;
    default: return BadgeHelp;
  }
}

function getTaskStatus(score?: number) {
  if (score === undefined) return { label: "ยังไม่บันทึก", chipClass: "bg-slate-100 text-slate-600" };
  if (score >= 80) return { label: "ดีมาก", chipClass: "bg-emerald-50 text-emerald-700" };
  if (score >= 60) return { label: "ดี", chipClass: "bg-sky-50 text-sky-700" };
  if (score >= 40) return { label: "กำลังพัฒนา", chipClass: "bg-amber-50 text-amber-700" };
  if (score > 0) return { label: "เริ่มต้น", chipClass: "bg-orange-50 text-orange-700" };
  return { label: "รอบันทึก", chipClass: "bg-rose-50 text-rose-600" };
}

function formatThaiDate(dateString: string) {
  const date = new Date(dateString + "T00:00:00");
  if (Number.isNaN(date.getTime())) return dateString;
  return date.toLocaleDateString("th-TH", { year: "numeric", month: "short", day: "numeric" });
}

export default function ScaffoldedActivityPage() {
  const { category, activity } = useParams<{
    category?: string;
    activity?: string;
  }>();
  const userId = getCurrentUserId();
  const config =
    category === "physical" || category === "mental"
      ? getScaffoldedActivityConfig(category, activity)
      : undefined;
  const resolvedCategory = config?.category;

  const weekStartDate = useMemo(() => {
    const saved = sessionStorage.getItem("goals-week");
    if (saved) return getStartOfWeek(new Date(saved + "T00:00:00"));
    return getStartOfWeek(new Date());
  }, []);
  const weekStartKey = toDateKey(weekStartDate);
  const weekEndDate = addDays(weekStartDate, 6);
  const weekEndKey = toDateKey(weekEndDate);
  const isViewingCurrentWeek = isCurrentWeek(weekStartKey);

  const [scoreMap, setScoreMap] = useState<Record<string, number>>({});
  const [latestLogDate, setLatestLogDate] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const Icon = getActivityIcon(activity);

  useEffect(() => {
    const activeConfig = config;
    const activeCategory = resolvedCategory;

    if (!activeConfig || !activeCategory) {
      setScoreMap({});
      setLatestLogDate(null);
      setLoading(false);
      return;
    }

    const safeConfig: NonNullable<typeof config> = activeConfig;
    const safeCategory: "physical" | "mental" = activeCategory;

    let cancelled = false;

    async function loadCompletion() {
      try {
        setLoading(true);

        const response = await listScaffoldedTaskLogs(
          safeCategory,
          safeConfig.activity,
          userId ?? undefined,
          undefined,
          true,
          weekStartKey,
          weekEndKey
        );
        if (!response.success) {
          if (!cancelled) {
            setScoreMap({});
            setLatestLogDate(null);
          }
          return;
        }

        const sorted = [...(response.data || [])].sort(
          (a, b) => getLogTimestamp(b) - getLogTimestamp(a)
        );

        const byTask = new Map<string, number>();
        let latestDate: string | null = null;

        sorted.forEach((log) => {
          const d = String(log.log_date ?? "").slice(0, 10);
          if (d < weekStartKey || d > weekEndKey) return;
          const parsed = parseScaffoldedTaskNote(
            String(log.note),
            safeCategory,
            safeConfig.activity
          );
          if (!parsed || byTask.has(parsed.task)) return;
          byTask.set(parsed.task, parsed.score);
          if (!latestDate || log.log_date > latestDate) latestDate = log.log_date;
        });

        if (!cancelled) {
          setScoreMap(Object.fromEntries(byTask));
          setLatestLogDate(latestDate);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void loadCompletion();

    return () => {
      cancelled = true;
    };
  }, [config, resolvedCategory, userId, weekStartKey, weekEndKey]);

  const tasks = useMemo(
    () =>
      config?.tasks.map((task) => ({
        ...task,
        score: scoreMap[task.slug] as number | undefined,
      })) ?? [],
    [scoreMap, config]
  );

  if (!config || !resolvedCategory) {
    return (
      <MobileShell>
        <AppHeader title="ไม่พบกิจกรรม" showBack />
        <main className="p-6 text-center text-slate-500">ไม่พบกิจกรรมที่ต้องการ</main>
      </MobileShell>
    );
  }

  const completedCount = tasks.filter((t) => (t.score ?? -1) >= 80).length;
  const totalCount = tasks.length;
  const progressPercent = totalCount === 0 ? 0 : Math.round((completedCount / totalCount) * 100);

  return (
    <MobileShell>
      <div className="relative min-h-screen overflow-hidden bg-[radial-gradient(circle_at_top_right,#fff6db_0%,#f7fdff_42%,#e8f7ef_100%)]">
        <div className="pointer-events-none absolute -left-20 top-14 h-56 w-56 rounded-full bg-[#ffc9a3]/20 blur-3xl" />
        <div className="pointer-events-none absolute -right-20 bottom-28 h-56 w-56 rounded-full bg-[#7dcdb8]/20 blur-3xl" />

        <AppHeader
          title={config.title}
          showBack
          showBell
          variant="soft"
          subtitle={config.subtitle}
        />
        <WeekNavBar
          weekStartDate={weekStartDate}
          weekEndDate={weekEndDate}
          isCurrentWeek={isViewingCurrentWeek}
        />

        <main className="relative z-10 space-y-4 px-4 py-4">
          {/* Hero card */}
          <section className="relative overflow-hidden rounded-[28px] border border-white/80 p-5 shadow-[0_22px_48px_rgba(31,47,61,0.14)]">
            <div className="pointer-events-none absolute inset-0">
              <img src={config.heroImage} alt="" className="h-full w-full object-cover" />
              <div className="absolute inset-0 bg-[linear-gradient(125deg,rgba(255,255,255,0.95)_8%,rgba(255,255,255,0.82)_42%,rgba(255,245,224,0.64)_72%,rgba(227,249,239,0.54)_100%)]" />
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.52)_0%,rgba(255,255,255,0)_26%)]" />
              <div className="absolute inset-x-0 bottom-0 h-32 bg-[linear-gradient(180deg,rgba(255,255,255,0)_0%,rgba(255,255,255,0.3)_48%,rgba(255,255,255,0.72)_100%)]" />
            </div>

            <div className="relative z-10">
              <p className="text-xs font-semibold tracking-[0.14em] text-[#255f54]">{config.heroEyebrow}</p>
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="mt-2 text-2xl font-extrabold leading-tight text-slate-900">{config.heroHeadline}</p>
                  <p className="mt-2 max-w-88 text-sm leading-6 text-slate-600">{config.subtitle}</p>
                </div>
                <div className="inline-flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-white/80 bg-white/80 text-2xl shadow-[0_12px_28px_rgba(31,47,61,0.12)] backdrop-blur">
                  {config.heroBadge}
                </div>
              </div>

              <div className="mt-6 flex items-center gap-4">
                <div className="inline-flex h-24 w-24 items-center justify-center rounded-full bg-[radial-gradient(circle_at_30%_28%,#fff4a8_0%,#f4e46c_44%,#e3d24b_100%)] text-4xl font-extrabold text-slate-900 shadow-[inset_0_10px_22px_rgba(255,255,255,0.42),0_12px_24px_rgba(160,138,46,0.18)]">
                  {completedCount}
                </div>
                <div className="min-w-0 flex-1 rounded-3xl border border-white/60 bg-white/55 px-4 py-3 shadow-[0_10px_24px_rgba(31,47,61,0.08)] backdrop-blur-sm">
                  <div className="mb-1 flex items-center justify-between text-xs text-slate-600">
                    <span>ความคืบหน้าของหัวข้อนี้</span>
                    <span className="font-semibold text-slate-900">{progressPercent}%</span>
                  </div>
                  <div className="h-2 rounded-full bg-white/80">
                    <div
                      className="h-2 rounded-full bg-linear-to-r from-[#7fc3a0] via-[#8cc2db] to-[#d88d80]"
                      style={{ width: `${progressPercent}%` }}
                    />
                  </div>
                  <p className="mt-2 text-sm font-semibold text-slate-800">
                    ทำได้ดี {completedCount} / {totalCount} หัวข้อ
                  </p>
                </div>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-2">
                <div className="rounded-2xl border border-white/70 bg-white/60 px-3 py-3">
                  <p className="text-xs text-slate-500">บันทึกล่าสุด</p>
                  <p className="mt-1 text-sm font-semibold text-slate-800">
                    {latestLogDate ? formatThaiDate(latestLogDate) : "ยังไม่มีข้อมูล"}
                  </p>
                </div>
                <div className="rounded-2xl border border-white/70 bg-white/60 px-3 py-3">
                  <p className="text-xs text-slate-500">กิจกรรมทั้งหมด</p>
                  <p className="mt-1 text-lg font-bold text-slate-900">{totalCount}</p>
                </div>
              </div>
            </div>
          </section>

          {/* Task list */}
          <section className="space-y-3">
            {tasks.map((task) => {
              const status = getTaskStatus(task.score);
              return (
                <Link
                  key={task.slug}
                  to={`/goals/${resolvedCategory}/${config.activity}/${task.slug}`}
                  className="block"
                >
                  <div className="relative overflow-hidden rounded-3xl border border-white/70 bg-white/80 px-4 py-4 shadow-[0_14px_32px_rgba(31,47,61,0.1)] backdrop-blur transition hover:-translate-y-0.5 hover:shadow-[0_18px_40px_rgba(31,47,61,0.14)]">
                    <div className="pointer-events-none absolute inset-x-0 top-0 h-1 bg-linear-to-r from-[#d8e8f6] via-[#ebf4fd] to-[#f8fcff]" />

                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white text-[#2e6a8b]">
                            <Icon size={17} />
                          </span>
                          <h3 className="text-base font-semibold text-slate-900">{task.label}</h3>
                        </div>

                        <p className="mt-2 text-sm text-slate-500">{task.subtitle}</p>

                        <div className="mt-3 h-2 rounded-full bg-slate-200">
                          <div
                            className="h-2 rounded-full bg-[#8cc2db] transition-all"
                            style={{ width: `${task.score ?? 0}%` }}
                          />
                        </div>

                        <div className="mt-2 flex items-center justify-between gap-2">
                          <span
                            className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                              loading ? "bg-slate-100 text-slate-500" : status.chipClass
                            }`}
                          >
                            {loading ? (
                              <span className="inline-flex items-center gap-1.5">
                                <span className="h-3 w-3 animate-spin rounded-full border-2 border-slate-300 border-t-slate-500" />
                                กำลังโหลด
                              </span>
                            ) : (
                              status.label
                            )}
                          </span>
                          <p className="text-sm text-slate-500">
                            {loading
                              ? "กำลังโหลดข้อมูลล่าสุด..."
                              : task.score === undefined
                                ? "ยังไม่มีการบันทึกล่าสุด"
                                : `คะแนนล่าสุด ${task.score}%`}
                          </p>
                        </div>
                      </div>

                      <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-white text-slate-400">
                        <ChevronRight size={16} />
                      </span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </section>
        </main>
      </div>
    </MobileShell>
  );
}
