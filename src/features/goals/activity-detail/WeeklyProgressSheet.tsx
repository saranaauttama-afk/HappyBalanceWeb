import { X, TrendingUp } from "lucide-react";
import { useEffect, useState } from "react";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { logsService } from "../../../services/logs.service";
import type { DailyLog } from "../../../types/models";
import { getCurrentUserId } from "../../../utils/authSession";
import { toDateKey, getStartOfMonth, addDays } from '../../../utils/weekPeriod';
import {
  parseBalanceTaskNote,
  parsePersonalBalanceDailyNote,
} from "../task-detail/balanceTaskShared";
import { parsePositiveThinkingTaskNote } from "../task-detail/positiveThinkingTaskShared";
import { parseSocialTaskNote } from "../task-detail/socialTaskShared";
import { parseStressTaskNote } from "../task-detail/stressTaskShared";
import { FAMILY_RELATIONSHIP_TASKS } from "../tasks/familyRelationshipTasks";
import { FAMILY_SOCIAL_BALANCE_TASKS } from "../tasks/familySocialBalanceTasks";
import { PERSONAL_LIFE_BALANCE_TASKS } from "../tasks/personalLifeBalanceTasks";
import { POSITIVE_THINKING_TASKS } from "../tasks/positiveThinkingTasks";
import { STRESS_TASKS } from "../tasks/stressTasks";
import { WORK_BALANCE_TASKS } from "../tasks/workBalanceTasks";
import { WORKPLACE_RELATIONSHIP_TASKS } from "../tasks/workplaceRelationshipTasks";

const TOTAL_TASKS: Record<string, number> = {
  "positive-thinking": POSITIVE_THINKING_TASKS.length,
  "stress-level": STRESS_TASKS.length,
  "family-relationship": FAMILY_RELATIONSHIP_TASKS.length,
  "community-participation": 1,
  "workplace-relationship": WORKPLACE_RELATIONSHIP_TASKS.length,
  "family-social-balance": FAMILY_SOCIAL_BALANCE_TASKS.length,
  "work-balance": WORK_BALANCE_TASKS.length,
  "personal-life-balance": PERSONAL_LIFE_BALANCE_TASKS.length,
};

type Props = {
  open: boolean;
  onClose: () => void;
  category: string;
  activity: string;
  title: string;
};

type WeekPoint = {
  label: string;
  score: number;
};

function getLogTimestamp(log: DailyLog) {
  const t = log.created_at ? new Date(String(log.created_at)).getTime() : Number.NaN;
  if (Number.isFinite(t)) return t;
  const u = log.updated_at ? new Date(String(log.updated_at)).getTime() : Number.NaN;
  if (Number.isFinite(u)) return u;
  return log.log_date ? new Date(String(log.log_date) + "T00:00:00").getTime() : 0;
}

function parseLog(
  log: DailyLog,
  category: string,
  activity: string
): { task: string; score: number } | null {
  const note = String(log.note ?? "");
  if (category === "mental" && activity === "positive-thinking") {
    const p = parsePositiveThinkingTaskNote(note);
    return p ? { task: p.task, score: p.score } : null;
  }
  if (category === "mental" && activity === "stress-level") {
    const p = parseStressTaskNote(note);
    return p ? { task: p.task, score: p.score } : null;
  }
  if (category === "social") {
    const p = parseSocialTaskNote(note);
    return p && p.activity === activity ? { task: p.task, score: p.score } : null;
  }
  if (category === "balance") {
    const p = parseBalanceTaskNote(note);
    return p && p.activity === activity ? { task: p.task, score: p.score } : null;
  }
  return null;
}

async function loadAllLogs(
  userId: string | null,
  category: string,
  activity: string
): Promise<DailyLog[]> {
  const uid = userId ?? undefined;
  if (category === "mental") {
    const res = await logsService.listMentalTaskLogs(uid, { activity, limit: 500 });
    return res.success ? (res.data ?? []) : [];
  }
  if (category === "social") {
    const res = await logsService.listSocialTaskLogs(uid, { activity, limit: 500 });
    return res.success ? (res.data ?? []) : [];
  }
  if (category === "balance") {
    const res = await logsService.listBalanceTaskLogs(uid, { activity, limit: 500 });
    return res.success ? (res.data ?? []) : [];
  }
  return [];
}

export default function WeeklyProgressSheet({
  open,
  onClose,
  category,
  activity,
  title,
}: Props) {
  const userId = getCurrentUserId();
  const [data, setData] = useState<WeekPoint[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open) return;

    let cancelled = false;

    async function load() {
      setLoading(true);
      try {
        const logs = await loadAllLogs(userId ?? null, category, activity);
        const currentWeekStart = getStartOfMonth(new Date());
        const totalTasks = TOTAL_TASKS[activity] ?? 1;

        const points: WeekPoint[] = [];
        for (let i = 7; i >= 0; i--) {
          const weekStart = addDays(currentWeekStart, -i * 7);
          const weekEnd = addDays(weekStart, 6);
          const startKey = toDateKey(weekStart);
          const endKey = toDateKey(weekEnd);

          const weekLogs = logs.filter((log) => {
            const d = String(log.log_date ?? "").slice(0, 10);
            return d >= startKey && d <= endKey;
          });

          let score: number;

          if (activity === "personal-life-balance") {
            // New daily format: average score across logged days in week
            const latestByDate = new Map<string, number>();
            for (const log of weekLogs) {
              const parsed = parsePersonalBalanceDailyNote(String(log.note ?? ""));
              if (!parsed) continue;
              const dateKey = String(log.log_date ?? "").slice(0, 10);
              const ts = getLogTimestamp(log);
              const existing = latestByDate.get(dateKey);
              if (existing === undefined || ts > (existing as unknown as number)) {
                latestByDate.set(dateKey, parsed.score);
              }
            }
            const scores = Array.from(latestByDate.values());
            score = scores.length === 0
              ? 0
              : Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
          } else {
            // Standard task-dedup approach
            const latestByTask = new Map<string, { score: number; ts: number }>();
            for (const log of weekLogs) {
              const parsed = parseLog(log, category, activity);
              if (!parsed) continue;
              const ts = getLogTimestamp(log);
              const existing = latestByTask.get(parsed.task);
              if (!existing || ts > existing.ts) {
                latestByTask.set(parsed.task, { score: parsed.score, ts });
              }
            }
            const completedCount = Array.from(latestByTask.values()).filter(
              (v) => v.score > 0
            ).length;
            score = Math.round((completedCount / totalTasks) * 100);
          }
          const label = weekStart.toLocaleDateString("th-TH", {
            day: "numeric",
            month: "short",
          });
          points.push({ label, score });
        }

        if (!cancelled) setData(points);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, [open, category, activity, userId]);

  return (
    <>
      <div
        className={`fixed inset-0 z-40 bg-black/40 transition-opacity duration-300 ${
          open ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
        onClick={onClose}
      />
      <div
        className={`fixed inset-x-0 bottom-0 z-50 flex max-h-[75vh] flex-col rounded-t-3xl bg-white shadow-[0_-8px_48px_rgba(0,0,0,0.2)] transition-transform duration-300 ${
          open ? "translate-y-0" : "translate-y-full"
        }`}
      >
        <div className="flex shrink-0 items-center justify-between border-b border-slate-100 px-5 pb-3 pt-5">
          <div className="flex items-center gap-2">
            <div className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
              <TrendingUp size={15} />
            </div>
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">
                ความก้าวหน้ารายสัปดาห์
              </p>
              <h2 className="text-sm font-bold text-slate-900">{title}</h2>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200"
          >
            <X size={16} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-2 pb-8 pt-5">
          {loading ? (
            <div className="flex h-44 items-center justify-center">
              <p className="text-sm text-slate-400">กำลังโหลดข้อมูล...</p>
            </div>
          ) : (
            <>
              <ResponsiveContainer width="100%" height={200}>
                <LineChart
                  data={data}
                  margin={{ top: 8, right: 12, bottom: 0, left: -12 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="#f1f5f9"
                    vertical={false}
                  />
                  <XAxis
                    dataKey="label"
                    tick={{ fontSize: 10, fill: "#94a3b8" }}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    domain={[0, 100]}
                    tick={{ fontSize: 10, fill: "#94a3b8" }}
                    tickLine={false}
                    axisLine={false}
                    unit="%"
                    ticks={[0, 25, 50, 75, 100]}
                  />
                  <Tooltip
                    formatter={(value: unknown) =>
                      [`${value as number}%`, "คะแนนสัปดาห์"] as [string, string]
                    }
                    contentStyle={{
                      borderRadius: 12,
                      fontSize: 12,
                      border: "1px solid #e2e8f0",
                      boxShadow: "0 4px 16px rgba(0,0,0,0.08)",
                    }}
                    labelStyle={{ color: "#475569", fontWeight: 600 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="score"
                    stroke="#7fc3a0"
                    strokeWidth={2.5}
                    dot={{ fill: "#7fc3a0", r: 4, strokeWidth: 0 }}
                    activeDot={{ r: 6, fill: "#255f54", strokeWidth: 0 }}
                  />
                </LineChart>
              </ResponsiveContainer>
              <p className="mt-3 text-center text-xs text-slate-400">
                แสดงข้อมูล 8 สัปดาห์ย้อนหลัง • คะแนน = สัดส่วนกิจกรรมที่ทำได้
              </p>
            </>
          )}
        </div>
      </div>
    </>
  );
}
