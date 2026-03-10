import { goalsService } from "../../../services/goals.service";
import { logsService } from "../../../services/logs.service";
import type { DailyLog, Goal } from "../../../types/models";

type SocialTaskNotePayload = {
  entry_type: "social_task";
  category: "social";
  activity: string;
  task: string;
  score: number;
  payload: Record<string, unknown>;
};

export type ParsedSocialTaskNote = {
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

export function parseSocialTaskNote(note: string): ParsedSocialTaskNote | null {
  if (!note) return null;

  try {
    const parsed = JSON.parse(note) as Partial<SocialTaskNotePayload>;
    if (parsed.entry_type !== "social_task") return null;
    if (parsed.category !== "social") return null;
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

export async function syncSocialActivityGoal(activity: string, userId?: string) {
  const logsResponse = await logsService.listDailyLogs(userId ?? undefined);
  if (!logsResponse.success) {
    throw new Error(logsResponse.error || "Could not load daily logs");
  }

  const latestByTask = new Map<string, number>();
  [...(logsResponse.data || [])]
    .sort((a, b) => getLogTimestamp(b) - getLogTimestamp(a))
    .forEach((log) => {
      const parsed = parseSocialTaskNote(String(log.note));
      if (!parsed || parsed.activity !== activity) return;
      if (latestByTask.has(parsed.task)) return;
      latestByTask.set(parsed.task, parsed.score);
    });

  const scores = Array.from(latestByTask.values());
  const averageScore =
    scores.length === 0
      ? 0
      : Math.round(scores.reduce((sum, score) => sum + score, 0) / scores.length);

  const goalsResponse = await goalsService.listGoals(userId ?? undefined);
  if (!goalsResponse.success) {
    throw new Error(goalsResponse.error || "Could not load goals");
  }

  const activityGoal = findLatestGoal(
    goalsResponse.data || [],
    (goal) => goal.category === "social" && goal.activity === activity
  );

  if (activityGoal) {
    const updateResponse = await goalsService.updateGoal({
      id: activityGoal.id,
      current_value: averageScore,
      target_value: 100,
      status: averageScore >= 100 ? "completed" : "active",
    });

    if (!updateResponse.success) {
      throw new Error(updateResponse.error || "Could not update social activity goal");
    }
    return;
  }

  const createResponse = await goalsService.createGoal({
    user_id: userId ?? undefined,
    category: "social",
    activity,
    current_value: averageScore,
    target_value: 100,
    status: averageScore >= 100 ? "completed" : "active",
  });

  if (!createResponse.success) {
    throw new Error(createResponse.error || "Could not create social activity goal");
  }
}
