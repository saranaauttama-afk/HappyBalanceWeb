import { api } from "./api";
import type { Goal } from "../types/models";

const DEMO_USER_ID = "demo-user-001";

export const goalsService = {
  async listGoals(userId?: string) {
    return api.get<Goal[]>("listGoals", { userId: userId ?? DEMO_USER_ID });
  },

  async createGoal(payload: {
    user_id?: string;
    category: string;
    activity: string;
    current_value: number;
    target_value: number;
    status: string;
  }) {
    return api.post<Goal>("createGoal", {
      user_id: payload.user_id ?? DEMO_USER_ID,
      ...payload,
    });
  },

  async updateGoal(payload: {
    id: string;
    category?: string;
    activity?: string;
    current_value?: number;
    target_value?: number;
    status?: string;
  }) {
    return api.post<Goal>("updateGoal", payload);
  },
};
