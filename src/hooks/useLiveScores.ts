import { useEffect, useState } from "react";
import { logsService } from "../services/logs.service";
import {
  getLogTimestamp as getScaffoldedLogTimestamp,
  parseScaffoldedTaskNote,
} from "../features/goals/task-detail/scaffoldedTaskShared";
import {
  getLogTimestamp as getMentalLogTimestamp,
  parsePositiveThinkingTaskNote,
} from "../features/goals/task-detail/positiveThinkingTaskShared";
import { parseStressTaskNote } from "../features/goals/task-detail/stressTaskShared";
import {
  getLogTimestamp as getSocialLogTimestamp,
  parseSocialTaskNote,
} from "../features/goals/task-detail/socialTaskShared";
import {
  getLogTimestamp as getBalanceLogTimestamp,
  parseBalanceTaskNote,
} from "../features/goals/task-detail/balanceTaskShared";
import { FAMILY_RELATIONSHIP_TASKS } from "../features/goals/tasks/familyRelationshipTasks";
import { FAMILY_SOCIAL_BALANCE_TASKS } from "../features/goals/tasks/familySocialBalanceTasks";
import { POSITIVE_THINKING_TASKS } from "../features/goals/tasks/positiveThinkingTasks";
import { REST_TASKS } from "../features/goals/tasks/restTasks";
import { STRESS_TASKS } from "../features/goals/tasks/stressTasks";
import { WORK_BALANCE_TASKS } from "../features/goals/tasks/workBalanceTasks";
import { WORKPLACE_RELATIONSHIP_TASKS } from "../features/goals/tasks/workplaceRelationshipTasks";
import { getScaffoldedActivityConfig } from "../features/goals/tasks/scaffoldedActivityTasks";

export type CategoryLiveScore = {
  physical: number;
  mental: number;
  social: number;
  balance: number;
};

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
    return { task: parsed.task, score: Math.max(0, Math.min(100, Math.round(score))) };
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

export function useLiveScores(
  userId: string | null | undefined,
  from: string,
  to: string
): { liveScores: CategoryLiveScore | null; loading: boolean } {
  const [liveScores, setLiveScores] = useState<CategoryLiveScore | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      if (!cancelled) setLoading(true);
      try {
        const [restResponse, physicalResponse, mentalResponse, socialResponse, balanceResponse] =
          await Promise.all([
            logsService.listRestTaskLogs(userId ?? undefined, { limit: 480, forceRefresh: true, from, to }),
            logsService.listDailyLogs(userId ?? undefined, {
              entry_type: "physical_task",
              category: "physical",
              from,
              to,
              limit: 480,
              forceRefresh: true,
            }),
            logsService.listMentalTaskLogs(userId ?? undefined, { limit: 480, forceRefresh: true, from, to }),
            logsService.listSocialTaskLogs(userId ?? undefined, { limit: 480, forceRefresh: true, from, to }),
            logsService.listBalanceTaskLogs(userId ?? undefined, { limit: 480, forceRefresh: true, from, to }),
          ]);

        if (
          !restResponse.success ||
          !physicalResponse.success ||
          !mentalResponse.success ||
          !socialResponse.success ||
          !balanceResponse.success
        ) {
          if (!cancelled) setLiveScores(null);
          return;
        }

        // Physical
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
          physicalActivityKeys.map((k) => [k, getScaffoldedActivityConfig("physical", k)?.tasks.length ?? 0])
        ) as Record<(typeof physicalActivityKeys)[number], number>;

        const physicalLatestByActivity = new Map<string, Map<string, number>>();
        [...(physicalResponse.data || [])]
          .sort((a, b) => getScaffoldedLogTimestamp(b) - getScaffoldedLogTimestamp(a))
          .forEach((log) => {
            const parsed = parsePhysicalTaskActivity(String(log.note));
            const activityKey = String(parsed?.activity || "");
            if (!physicalActivityKeys.includes(activityKey as (typeof physicalActivityKeys)[number])) return;
            const latestByTask = physicalLatestByActivity.get(activityKey) ?? new Map<string, number>();
            if (!parsed || latestByTask.has(parsed.task)) return;
            latestByTask.set(parsed.task, parsed.score);
            physicalLatestByActivity.set(activityKey, latestByTask);
          });

        const physicalActivityScores = [
          Math.round(
            Array.from(restLatestByTask.values()).reduce((s, v) => s + v, 0) /
              Math.max(REST_TASKS.length, 1)
          ),
          ...physicalActivityKeys.map((k) =>
            Math.round(
              Array.from(physicalLatestByActivity.get(k)?.values() || []).reduce((s, v) => s + v, 0) /
                Math.max(physicalTaskCounts[k], 1)
            )
          ),
        ];

        // Mental
        const positiveLatestByTask = new Map<string, number>();
        const stressLatestByTask = new Map<string, number>();
        const scaffoldedMentalKeys = ["life-satisfaction", "self-worth"] as const;
        const scaffoldedMentalTaskCounts = Object.fromEntries(
          scaffoldedMentalKeys.map((k) => [k, getScaffoldedActivityConfig("mental", k)?.tasks.length ?? 0])
        ) as Record<(typeof scaffoldedMentalKeys)[number], number>;
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
            for (const k of scaffoldedMentalKeys) {
              const parsed = parseScaffoldedTaskNote(String(log.note), "mental", k);
              if (!parsed) continue;
              const latestByTask = scaffoldedMentalLatestByActivity.get(k) ?? new Map<string, number>();
              if (!latestByTask.has(parsed.task)) latestByTask.set(parsed.task, parsed.score);
              scaffoldedMentalLatestByActivity.set(k, latestByTask);
              break;
            }
          });

        const mentalActivityScores = [
          Math.round(
            Array.from(positiveLatestByTask.values()).reduce((s, v) => s + v, 0) /
              Math.max(POSITIVE_THINKING_TASKS.length, 1)
          ),
          Math.round(
            Array.from(stressLatestByTask.values()).reduce((s, v) => s + v, 0) /
              Math.max(STRESS_TASKS.length, 1)
          ),
          ...scaffoldedMentalKeys.map((k) =>
            Math.round(
              Array.from(scaffoldedMentalLatestByActivity.get(k)?.values() || []).reduce((s, v) => s + v, 0) /
                Math.max(scaffoldedMentalTaskCounts[k], 1)
            )
          ),
        ];

        // Social
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
            if (!latestByTask.has(parsed.task)) latestByTask.set(parsed.task, parsed.score);
            socialLatestByActivity.set(parsed.activity, latestByTask);
          });

        const socialActivityScores = Object.entries(socialActivityTaskCount).map(([k, total]) =>
          Math.round(
            Array.from(socialLatestByActivity.get(k)?.values() || []).reduce((s, v) => s + v, 0) /
              Math.max(total, 1)
          )
        );

        // Balance
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
            if (!latestByTask.has(parsed.task)) latestByTask.set(parsed.task, parsed.score);
            balanceLatestByActivity.set(parsed.activity, latestByTask);
          });

        const balanceActivityScores = Object.entries(balanceActivityTaskCount).map(([k, total]) =>
          Math.round(
            Array.from(balanceLatestByActivity.get(k)?.values() || []).reduce((s, v) => s + v, 0) /
              Math.max(total, 1)
          )
        );

        const nextScores: CategoryLiveScore = {
          physical: Math.round(physicalActivityScores.reduce((s, v) => s + v, 0) / physicalActivityScores.length),
          mental: Math.round(mentalActivityScores.reduce((s, v) => s + v, 0) / mentalActivityScores.length),
          social: Math.round(socialActivityScores.reduce((s, v) => s + v, 0) / socialActivityScores.length),
          balance: Math.round(balanceActivityScores.reduce((s, v) => s + v, 0) / balanceActivityScores.length),
        };

        if (!cancelled) setLiveScores(nextScores);
      } catch {
        if (!cancelled) setLiveScores(null);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void load();
    return () => { cancelled = true; };
  }, [userId, from, to]);

  return { liveScores, loading };
}
