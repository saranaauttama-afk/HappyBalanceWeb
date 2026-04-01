import { ChevronRight } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import AppHeader from "../../../components/layout/AppHeader";
import MobileShell from "../../../components/layout/MobileShell";
import { getCurrentUserId } from "../../../utils/authSession";
import { getScaffoldedActivityConfig } from "../tasks/scaffoldedActivityTasks";
import {
  getLogTimestamp,
  listScaffoldedTaskLogs,
  parseScaffoldedTaskNote,
} from "../task-detail/scaffoldedTaskShared";

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

  const [completion, setCompletion] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const activeConfig = config;
    const activeCategory = resolvedCategory;

    if (!activeConfig || !activeCategory) {
      setCompletion({});
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
          userId ?? undefined
        );
        if (!response.success) {
          if (!cancelled) setCompletion({});
          return;
        }

        const completionByTask = new Map<string, boolean>();
        [...(response.data || [])]
          .sort((a, b) => getLogTimestamp(b) - getLogTimestamp(a))
          .forEach((log) => {
            const parsed = parseScaffoldedTaskNote(
              String(log.note),
              safeCategory,
              safeConfig.activity
            );
            if (!parsed || completionByTask.has(parsed.task)) return;
            completionByTask.set(parsed.task, parsed.score > 0);
          });

        if (!cancelled) {
          setCompletion(Object.fromEntries(completionByTask));
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void loadCompletion();

    return () => {
      cancelled = true;
    };
  }, [config, resolvedCategory, userId]);

  const tasks = useMemo(
    () =>
      config?.tasks.map((task) => ({
        ...task,
        completed: completion[task.slug] ?? false,
      })) ?? [],
    [completion, config]
  );

  if (!config || !resolvedCategory) {
    return (
      <MobileShell>
        <AppHeader title="ไม่พบกิจกรรม" showBack />
        <main className="p-6 text-center text-slate-500">ไม่พบกิจกรรมที่ต้องการ</main>
      </MobileShell>
    );
  }

  const completedCount = tasks.filter((task) => task.completed).length;
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

        <main className="relative z-10 space-y-4 px-4 py-4">
          <section className="relative overflow-hidden rounded-[28px] border border-white/80 p-5 shadow-[0_22px_48px_rgba(31,47,61,0.14)]">
            <div className="pointer-events-none absolute inset-0">
              <img src={config.heroImage} alt="" className="h-full w-full object-cover" />
              <div className="absolute inset-0 bg-[linear-gradient(125deg,rgba(255,255,255,0.95)_8%,rgba(255,255,255,0.82)_42%,rgba(255,245,224,0.64)_72%,rgba(227,249,239,0.54)_100%)]" />
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.52)_0%,rgba(255,255,255,0)_26%)]" />
            </div>

            <div className="relative z-10">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-xs font-semibold tracking-[0.14em] text-[#255f54]">{config.heroEyebrow}</p>
                  <p className="mt-2 text-2xl font-extrabold leading-tight text-slate-900">{config.heroHeadline}</p>
                  <p className="mt-2 max-w-[22rem] text-sm leading-6 text-slate-600">{config.subtitle}</p>
                </div>

                <div className="inline-flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-white/80 bg-white/80 text-2xl shadow-[0_12px_28px_rgba(31,47,61,0.12)] backdrop-blur">
                  {config.heroBadge}
                </div>
              </div>

              <div className="mt-6 flex items-center gap-4">
                <div className="inline-flex h-24 w-24 items-center justify-center rounded-full bg-[radial-gradient(circle_at_30%_28%,#f8f0a1_0%,#eddc4c_52%,#d5c033_100%)] text-4xl font-extrabold text-slate-900 shadow-[inset_0_10px_22px_rgba(255,255,255,0.28),0_12px_24px_rgba(0,0,0,0.16)]">
                  {completedCount}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="mb-1 flex items-center justify-between text-xs text-slate-500">
                    <span>ความคืบหน้าของหัวข้อนี้</span>
                    <span className="font-semibold text-slate-700">{progressPercent}%</span>
                  </div>
                  <div className="h-2 rounded-full bg-white/80">
                    <div
                      className="h-2 rounded-full bg-gradient-to-r from-[#7fc3a0] via-[#8cc2db] to-[#d88d80]"
                      style={{ width: `${progressPercent}%` }}
                    />
                  </div>
                  <p className="mt-2 text-sm font-semibold text-slate-800">
                    ทำได้แล้ว {completedCount} / {totalCount} หัวข้อ
                  </p>
                </div>
              </div>
            </div>
          </section>

          <section className="space-y-3">
            {tasks.map((task) => (
              <Link
                key={task.slug}
                to={`/goals/${resolvedCategory}/${config.activity}/${task.slug}`}
                className="block"
              >
                <div className="relative overflow-hidden rounded-3xl border border-white/70 bg-white/80 px-4 py-4 shadow-[0_14px_32px_rgba(31,47,61,0.1)] backdrop-blur transition hover:-translate-y-0.5 hover:shadow-[0_18px_40px_rgba(31,47,61,0.14)]">
                  <div className="pointer-events-none absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-[#d8e8f6] via-[#ebf4fd] to-[#f8fcff]" />

                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <h3 className="text-lg font-semibold leading-7 text-slate-900">{task.label}</h3>
                      <p className="mt-1 text-sm text-slate-500">{task.subtitle}</p>

                      <div className="mt-3 flex flex-wrap items-center gap-2">
                        <span
                          className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                            loading
                              ? "bg-slate-100 text-slate-500"
                              : task.completed
                                ? "bg-emerald-50 text-emerald-700"
                              : "bg-slate-100 text-slate-600"
                          }`}
                        >
                          {loading ? (
                            <span className="inline-flex items-center gap-1.5">
                              <span className="h-3 w-3 animate-spin rounded-full border-2 border-slate-300 border-t-slate-500" />
                              กำลังโหลด
                            </span>
                          ) : task.completed ? (
                            "บันทึกแล้ว"
                          ) : (
                            "รอบันทึก"
                          )}
                        </span>
                        <span className="rounded-full bg-[#eef8fd] px-2.5 py-1 text-xs font-medium text-[#2e6a8b]">
                          {config.taskTypeLabel}
                        </span>
                      </div>
                    </div>

                    <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-white text-slate-400">
                      <ChevronRight size={16} />
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </section>
        </main>
      </div>
    </MobileShell>
  );
}
