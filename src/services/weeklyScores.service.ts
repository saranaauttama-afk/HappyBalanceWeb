import { api } from "./api";
import type { WeeklyActivityScore, WeeklyTaskScore } from "../types/models";

const DEMO_USER_ID = "demo-user-001";

export const weeklyScoresService = {
  async listWeeklyActivityScores(params: {
    userId?: string;
    week_start_date?: string;
    category?: string;
    activity?: string;
  }) {
    return api.get<WeeklyActivityScore[]>("listWeeklyActivityScores", {
      userId: params.userId ?? DEMO_USER_ID,
      week_start_date: params.week_start_date,
      category: params.category,
      activity: params.activity,
      _ts: Date.now(),
    });
  },

  async listWeeklyTaskScores(params: {
    userId?: string;
    week_start_date?: string;
    category?: string;
    activity?: string;
    task?: string;
  }) {
    return api.get<WeeklyTaskScore[]>("listWeeklyTaskScores", {
      userId: params.userId ?? DEMO_USER_ID,
      week_start_date: params.week_start_date,
      category: params.category,
      activity: params.activity,
      task: params.task,
      _ts: Date.now(),
    });
  },
};
