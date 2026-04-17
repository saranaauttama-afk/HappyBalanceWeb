import { goalsService } from "../../../services/goals.service";
import { logsService } from "../../../services/logs.service";
import type { DailyLog, Goal } from "../../../types/models";
import { FAMILY_SOCIAL_BALANCE_TASKS } from "../tasks/familySocialBalanceTasks";
import { PERSONAL_LIFE_BALANCE_TASKS } from "../tasks/personalLifeBalanceTasks";
import { WORK_BALANCE_TASKS } from "../tasks/workBalanceTasks";

const BALANCE_ACTIVITY_TASK_COUNT: Record<string, number> = {
  "family-social-balance": FAMILY_SOCIAL_BALANCE_TASKS.length,
  "work-balance": WORK_BALANCE_TASKS.length,
  "personal-life-balance": PERSONAL_LIFE_BALANCE_TASKS.length,
};

type BalanceTaskNotePayload = {
  entry_type: "balance_task";
  category: "balance";
  activity: string;
  task: string;
  score: number;
  payload: Record<string, unknown>;
};

export type ParsedBalanceTaskNote = {
  activity: string;
  task: string;
  score: number;
  payload: Record<string, unknown>;
};

function pad(value: number) {
  return String(value).padStart(2, "0");
}

export function getTodayDate() {
  const now = new Date();
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
}

export function formatThaiDate(dateString: string) {
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return dateString;
  return date.toLocaleDateString("th-TH", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function getLogTimestamp(log: DailyLog) {
  const createdAt = log.created_at ? new Date(log.created_at).getTime() : Number.NaN;
  if (Number.isFinite(createdAt)) return createdAt;

  const updatedAt = log.updated_at ? new Date(log.updated_at).getTime() : Number.NaN;
  if (Number.isFinite(updatedAt)) return updatedAt;

  const logDate = log.log_date ? new Date(log.log_date).getTime() : Number.NaN;
  if (Number.isFinite(logDate)) return logDate;

  return 0;
}

export function getNumber(value: unknown, fallback: number) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

export function getBoolean(value: unknown, fallback: boolean) {
  if (typeof value === "boolean") return value;
  if (typeof value === "string") {
    if (value.toLowerCase() === "true") return true;
    if (value.toLowerCase() === "false") return false;
  }
  if (typeof value === "number") return value !== 0;
  return fallback;
}

export function parseBalanceTaskNote(note: string): ParsedBalanceTaskNote | null {
  if (!note) return null;

  try {
    const parsed = JSON.parse(note) as Partial<BalanceTaskNotePayload>;
    if (parsed.entry_type !== "balance_task") return null;
    if (parsed.category !== "balance") return null;
    if (!parsed.activity) return null;
    if (!parsed.task) return null;

    const score = Number(parsed.score);
    if (!Number.isFinite(score)) return null;

    return {
      activity: parsed.activity,
      task: parsed.task,
      score: Math.max(0, Math.min(100, Math.round(score))),
      payload:
        parsed.payload && typeof parsed.payload === "object"
          ? (parsed.payload as Record<string, unknown>)
          : {},
    };
  } catch {
    return null;
  }
}

function getGoalTimestamp(goal: Goal) {
  const updatedAt = goal.updated_at ? new Date(goal.updated_at).getTime() : Number.NaN;
  if (Number.isFinite(updatedAt)) return updatedAt;

  const createdAt = goal.created_at ? new Date(goal.created_at).getTime() : Number.NaN;
  if (Number.isFinite(createdAt)) return createdAt;

  return 0;
}

function findLatestGoal(goals: Goal[], matcher: (goal: Goal) => boolean) {
  const filtered = goals.filter(matcher);
  if (filtered.length === 0) return null;
  return filtered.sort((a, b) => getGoalTimestamp(b) - getGoalTimestamp(a))[0];
}

// ─── Personal-life-balance: daily chip format ────────────────────────────────

type PersonalBalanceDailyPayload = {
  entry_type: "personal_balance_daily";
  category: "balance";
  activity: "personal-life-balance";
  date: string;
  week_key: string;
  items: string[];
  score: number;
};

export type ParsedPersonalBalanceDailyNote = {
  date: string;
  week_key: string;
  items: string[];
  score: number;
};

export function parsePersonalBalanceDailyNote(
  note: string
): ParsedPersonalBalanceDailyNote | null {
  if (!note) return null;
  try {
    const parsed = JSON.parse(note) as Record<string, unknown>;

    // GAS-compatible format: balance_task + task:"daily-checkin" + items in payload
    if (
      parsed.entry_type === "balance_task" &&
      parsed.task === "daily-checkin" &&
      parsed.activity === "personal-life-balance"
    ) {
      const payload = parsed.payload as Record<string, unknown> | undefined;
      if (!payload || !Array.isArray(payload.items)) return null;
      return {
        date: String(payload.date ?? ""),
        week_key: String(payload.week_key ?? ""),
        items: payload.items as string[],
        score: Math.max(0, Math.min(100, Math.round(Number(parsed.score) || 0))),
      };
    }

    // Legacy format saved before this fix (entry_type: "personal_balance_daily")
    if (
      parsed.entry_type === "personal_balance_daily" &&
      Array.isArray(parsed.items)
    ) {
      return {
        date: String(parsed.date ?? ""),
        week_key: String(parsed.week_key ?? ""),
        items: parsed.items as string[],
        score: Math.max(0, Math.min(100, Math.round(Number(parsed.score) || 0))),
      };
    }

    return null;
  } catch {
    return null;
  }
}

export async function syncPersonalLifeBalanceGoal(userId?: string) {
  const logsResponse = await logsService.listBalanceTaskLogs(userId, {
    activity: "personal-life-balance",
    limit: 500,
    forceRefresh: true,
  });
  if (!logsResponse.success) {
    throw new Error(logsResponse.error || "Could not load personal-life-balance logs");
  }

  // Collect latest daily score per date (new format only)
  const scoreByDate = new Map<string, number>();
  [...(logsResponse.data || [])]
    .sort((a, b) => getLogTimestamp(b) - getLogTimestamp(a))
    .forEach((log) => {
      const parsed = parsePersonalBalanceDailyNote(String(log.note ?? ""));
      if (!parsed) return;
      const dateKey = String(log.log_date ?? "").slice(0, 10);
      if (scoreByDate.has(dateKey)) return;
      scoreByDate.set(dateKey, parsed.score);
    });

  const averageScore =
    scoreByDate.size === 0
      ? 0
      : Math.round(
          Array.from(scoreByDate.values()).reduce((s, v) => s + v, 0) /
            scoreByDate.size
        );

  const goalsResponse = await goalsService.listGoals(userId);
  if (!goalsResponse.success) {
    throw new Error(goalsResponse.error || "Could not load goals");
  }

  const activityGoal = findLatestGoal(
    goalsResponse.data || [],
    (goal) =>
      goal.category === "balance" && goal.activity === "personal-life-balance"
  );

  if (activityGoal) {
    await goalsService.updateGoal({
      id: activityGoal.id,
      current_value: averageScore,
      target_value: 100,
      status: averageScore >= 100 ? "completed" : "active",
    });
    return;
  }

  await goalsService.createGoal({
    user_id: userId,
    category: "balance",
    activity: "personal-life-balance",
    current_value: averageScore,
    target_value: 100,
    status: averageScore >= 100 ? "completed" : "active",
  });
}

// ─── Generic balance-task sync (family-social-balance, work-balance) ─────────

export async function syncBalanceActivityGoal(activity: string, userId?: string) {
  const logsResponse = await logsService.listBalanceTaskLogs(userId ?? undefined, {
    activity,
    limit: 240,
    forceRefresh: true,
  });
  if (!logsResponse.success) {
    throw new Error(logsResponse.error || "Could not load balance activity logs");
  }

  const latestByTask = new Map<string, number>();
  [...(logsResponse.data || [])]
    .sort((a, b) => getLogTimestamp(b) - getLogTimestamp(a))
    .forEach((log) => {
      const parsed = parseBalanceTaskNote(String(log.note));
      if (!parsed || parsed.activity !== activity) return;
      if (latestByTask.has(parsed.task)) return;
      latestByTask.set(parsed.task, parsed.score);
    });

  const totalTaskCount = BALANCE_ACTIVITY_TASK_COUNT[activity] ?? latestByTask.size;
  const totalScore = Array.from(latestByTask.values()).reduce((sum, score) => sum + score, 0);
  const averageScore = totalTaskCount === 0 ? 0 : Math.round(totalScore / totalTaskCount);

  const goalsResponse = await goalsService.listGoals(userId ?? undefined);
  if (!goalsResponse.success) {
    throw new Error(goalsResponse.error || "Could not load goals");
  }

  const activityGoal = findLatestGoal(
    goalsResponse.data || [],
    (goal) => goal.category === "balance" && goal.activity === activity
  );

  if (activityGoal) {
    const updateResponse = await goalsService.updateGoal({
      id: activityGoal.id,
      current_value: averageScore,
      target_value: 100,
      status: averageScore >= 100 ? "completed" : "active",
    });

    if (!updateResponse.success) {
      throw new Error(updateResponse.error || "Could not update balance activity goal");
    }
    return;
  }

  const createResponse = await goalsService.createGoal({
    user_id: userId ?? undefined,
    category: "balance",
    activity,
    current_value: averageScore,
    target_value: 100,
    status: averageScore >= 100 ? "completed" : "active",
  });

  if (!createResponse.success) {
    throw new Error(createResponse.error || "Could not create balance activity goal");
  }
}
