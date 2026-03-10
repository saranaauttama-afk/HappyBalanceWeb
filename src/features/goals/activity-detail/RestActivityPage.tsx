import { BedDouble, ChevronRight, Droplets, Gauge, MoonStar, Smartphone } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import AppHeader from "../../../components/layout/AppHeader";
import MobileShell from "../../../components/layout/MobileShell";
import InfoCard from "../../../components/ui/InfoCard";
import { goalsService } from "../../../services/goals.service";
import { logsService } from "../../../services/logs.service";
import type { DailyLog, Goal } from "../../../types/models";
import { getCurrentUserId } from "../../../utils/authSession";
import { REST_TASKS } from "../tasks/restTasks";

type RestTaskEntry = {
  task: string;
  score: number;
};

function getLogTimestamp(log: DailyLog) {
  const createdAt = log.created_at ? new Date(log.created_at).getTime() : Number.NaN;
  if (Number.isFinite(createdAt)) return createdAt;

  const updatedAt = log.updated_at ? new Date(log.updated_at).getTime() : Number.NaN;
  if (Number.isFinite(updatedAt)) return updatedAt;

  const logDate = log.log_date ? new Date(log.log_date).getTime() : Number.NaN;
  if (Number.isFinite(logDate)) return logDate;

  return 0;
}

function parseRestTaskEntry(note: string): RestTaskEntry | null {
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

function getTaskStatus(score?: number) {
  if (score === undefined) {
    return {
      label: "ยังไม่บันทึก",
      chipClass: "bg-slate-100 text-slate-600",
    };
  }

  if (score >= 80) {
    return {
      label: "ดีมาก",
      chipClass: "bg-emerald-50 text-emerald-700",
    };
  }

  if (score >= 60) {
    return {
      label: "ดี",
      chipClass: "bg-sky-50 text-sky-700",
    };
  }

  if (score >= 40) {
    return {
      label: "กำลังพัฒนา",
      chipClass: "bg-amber-50 text-amber-700",
    };
  }

  return {
    label: "เริ่มต้น",
    chipClass: "bg-orange-50 text-orange-700",
  };
}

function formatThaiDate(value: Date) {
  return value.toLocaleDateString("th-TH", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export default function RestActivityPage() {
  const userId = getCurrentUserId();
  const [goals, setGoals] = useState<Goal[]>([]);
  const [logs, setLogs] = useState<DailyLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const [goalsResponse, logsResponse] = await Promise.all([
        goalsService.listGoals(userId ?? undefined),
        logsService.listDailyLogs(userId ?? undefined),
      ]);

      if (!goalsResponse.success) {
        throw new Error(goalsResponse.error || "ไม่สามารถโหลดข้อมูลเป้าหมายได้");
      }

      if (!logsResponse.success) {
        throw new Error(logsResponse.error || "ไม่สามารถโหลดข้อมูลบันทึกกิจกรรมได้");
      }

      setGoals(goalsResponse.data || []);
      setLogs(logsResponse.data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "เกิดข้อผิดพลาดที่ไม่ทราบสาเหตุ");
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  const restGoal = useMemo(() => {
    return goals.find((goal) => goal.category === "physical" && goal.activity === "rest") ?? null;
  }, [goals]);

  const taskScoreMap = useMemo(() => {
    const map = new Map<string, number>();

    [...logs]
      .sort((a, b) => getLogTimestamp(b) - getLogTimestamp(a))
      .forEach((log) => {
        const parsed = parseRestTaskEntry(String(log.note));
        if (!parsed) return;
        if (map.has(parsed.task)) return;
        map.set(parsed.task, parsed.score);
      });

    return map;
  }, [logs]);

  const latestAverageScore = useMemo(() => {
    const values = Array.from(taskScoreMap.values());
    if (values.length === 0) return 0;
    return Math.round(values.reduce((sum, value) => sum + value, 0) / values.length);
  }, [taskScoreMap]);

  const overallScore = useMemo(() => {
    const currentValue = Number(restGoal?.current_value) || 0;
    const targetValue = Number(restGoal?.target_value) || 0;
    if (targetValue > 0) {
      return Math.max(0, Math.min(100, Math.round((currentValue / targetValue) * 100)));
    }

    return latestAverageScore;
  }, [latestAverageScore, restGoal?.current_value, restGoal?.target_value]);

  const completedTaskCount = useMemo(() => {
    return REST_TASKS.filter((task) => {
      const score = taskScoreMap.get(task.slug);
      return score !== undefined && score >= 80;
    }).length;
  }, [taskScoreMap]);

  return (
    <MobileShell>
      <div className="relative min-h-screen overflow-hidden bg-[radial-gradient(circle_at_top_right,#fff6db_0%,#f7fdff_42%,#e8f7ef_100%)]">
        <div className="pointer-events-none absolute -left-20 top-14 h-56 w-56 rounded-full bg-[#ffc9a3]/20 blur-3xl" />
        <div className="pointer-events-none absolute -right-20 bottom-28 h-56 w-56 rounded-full bg-[#7dcdb8]/20 blur-3xl" />

        <AppHeader
          title="การพักผ่อน"
          showBack
          showBell
          variant="soft"
          subtitle={loading ? "กำลังโหลดข้อมูล..." : "ติดตามกิจกรรมพักผ่อนและคุณภาพการนอน"}
        />

        <main className="relative z-10 space-y-4 px-4 py-4">
          {error ? (
            <InfoCard className="rounded-3xl border-rose-200 bg-rose-50">
              <div className="space-y-3">
                <p className="text-sm text-rose-700">{error}</p>
                <button
                  type="button"
                  onClick={() => void loadData()}
                  className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-medium text-white"
                >
                  ลองใหม่
                </button>
              </div>
            </InfoCard>
          ) : null}

          <section className="relative overflow-hidden rounded-[28px] border border-white/80 bg-[linear-gradient(145deg,rgba(255,255,255,0.9)_0%,rgba(245,253,255,0.86)_48%,rgba(237,251,243,0.88)_100%)] p-5 shadow-[0_22px_48px_rgba(31,47,61,0.14)] backdrop-blur">
            <div className="pointer-events-none absolute -right-16 -top-16 h-44 w-44 rounded-full bg-[#9ad4be]/20 blur-3xl" />
            <p className="text-xs font-semibold tracking-[0.14em] text-[#255f54]">REST OVERVIEW</p>
            <h2 className="mt-2 text-2xl font-extrabold leading-tight text-slate-900">ความคืบหน้าด้านการพักผ่อน</h2>
            <p className="mt-1 text-sm text-slate-600">{formatThaiDate(new Date())}</p>

            <div className="mt-4 rounded-2xl border border-white/80 bg-white/75 p-3">
              <div className="mb-2 flex items-center justify-between text-xs text-slate-600">
                <span>คะแนนรวมกิจกรรมการพักผ่อน</span>
                <span className="font-semibold text-slate-900">{overallScore}%</span>
              </div>
              <div className="h-2 rounded-full bg-slate-200">
                <div
                  className="h-2 rounded-full bg-gradient-to-r from-[#7fc3a0] via-[#8cc2db] to-[#d88d80]"
                  style={{ width: `${overallScore}%` }}
                />
              </div>
            </div>

            <div className="mt-4 grid grid-cols-3 gap-2 text-center">
              <div className="rounded-2xl bg-[#eef7fd] px-2 py-3">
                <p className="text-xs text-slate-500">กิจกรรมทั้งหมด</p>
                <p className="text-lg font-bold text-slate-900">{REST_TASKS.length}</p>
              </div>
              <div className="rounded-2xl bg-[#ecfdf3] px-2 py-3">
                <p className="text-xs text-slate-500">ทำได้ดี</p>
                <p className="text-lg font-bold text-[#166534]">{completedTaskCount}</p>
              </div>
              <div className="rounded-2xl bg-[#fff7ed] px-2 py-3">
                <p className="text-xs text-slate-500">คะแนนล่าสุด</p>
                <p className="text-lg font-bold text-[#9a3412]">{latestAverageScore}%</p>
              </div>
            </div>
          </section>

          <InfoCard className="rounded-2xl border-white/70 bg-white/75 p-3 shadow-[0_12px_28px_rgba(31,47,61,0.08)] backdrop-blur">
            <div className="mb-2 flex items-center justify-between">
              <h3 className="text-sm font-semibold text-slate-800">ตั้งค่าเริ่มต้น</h3>
              <span className="text-xs text-slate-500">จุดกำหนดค่า</span>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <Link
                to="/goals/physical/rest/sleep/goal"
                className="flex items-center justify-between rounded-xl border border-[#f0d9d3] bg-[#fff6f2] px-2 py-2"
              >
                <span className="inline-flex items-center gap-1 text-[11px] font-medium text-[#8b4d35]">
                  <MoonStar size={13} />
                  นอน
                </span>
                <span className="text-[11px] font-semibold text-[#b46e44]">ตั้งค่า</span>
              </Link>

              <Link
                to="/profile/settings/water-goal"
                className="flex items-center justify-between rounded-xl border border-[#d7e7f1] bg-[#f2f9fd] px-2 py-2"
              >
                <span className="inline-flex items-center gap-1 text-[11px] font-medium text-[#2e6a8b]">
                  <Droplets size={13} />
                  น้ำ
                </span>
                <span className="text-[11px] font-semibold text-[#3f7a96]">Settings</span>
              </Link>

              <Link
                to="/goals/physical/rest/limit-screen-time/goal"
                className="flex items-center justify-between rounded-xl border border-[#e2e5f0] bg-[#f5f6fb] px-2 py-2"
              >
                <span className="inline-flex items-center gap-1 text-[11px] font-medium text-[#4d5670]">
                  <Smartphone size={13} />
                  หน้าจอ
                </span>
                <span className="text-[11px] font-semibold text-[#5f6a86]">ไม่เกิน</span>
              </Link>
            </div>
          </InfoCard>

          <section className="space-y-3">
            {REST_TASKS.map((task) => {
              const score = taskScoreMap.get(task.slug);
              const status = getTaskStatus(score);
              const Icon =
                task.slug === "sleep"
                  ? BedDouble
                  : task.slug === "drink-water"
                    ? Droplets
                    : task.slug === "limit-screen-time"
                      ? Smartphone
                      : Gauge;

              return (
                <Link key={task.slug} to={`/goals/physical/rest/${task.slug}`} className="block">
                  <InfoCard className="relative overflow-hidden rounded-3xl border-white/70 bg-white/80 shadow-[0_18px_40px_rgba(31,47,61,0.1)] backdrop-blur transition hover:-translate-y-0.5 hover:shadow-[0_20px_44px_rgba(31,47,61,0.14)]">
                    <div className="pointer-events-none absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-[#d8e8f6] via-[#ebf4fd] to-[#f8fcff]" />
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-white text-[#2e6a8b]">
                            <Icon size={17} />
                          </span>
                          <h3 className="text-base font-semibold text-slate-900">{task.label}</h3>
                        </div>

                        <p className="mt-2 text-sm text-slate-500">{score === undefined ? "ยังไม่มีการบันทึกล่าสุด" : `คะแนนล่าสุด ${score}%`}</p>

                        <div className="mt-3 h-2 rounded-full bg-slate-200">
                          <div
                            className="h-2 rounded-full bg-[#8cc2db] transition-all"
                            style={{ width: `${score ?? 0}%` }}
                          />
                        </div>

                        <div className="mt-2 flex items-center justify-between gap-2">
                          <p className="text-sm text-slate-500">แตะเพื่อบันทึกกิจกรรมและอัปเดตคะแนน</p>
                          <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${status.chipClass}`}>
                            {status.label}
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

