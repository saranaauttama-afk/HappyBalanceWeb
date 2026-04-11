import { api } from "./api";
import type { WellbeingEvaluation } from "../types/models";

const DEMO_USER_ID = "demo-user-001";

export const evaluationService = {
  async getWellbeingEvaluation(userId?: string) {
    return api.get<WellbeingEvaluation | null>("getWellbeingEvaluation", {
      userId: userId ?? DEMO_USER_ID,
    });
  },

  async createWellbeingEvaluation(payload: {
    user_id?: string;
    physical_score: number;
    mental_score: number;
    social_score: number;
    balance_score: number;
  }) {
    return api.post<WellbeingEvaluation>("createWellbeingEvaluation", {
      user_id: payload.user_id ?? DEMO_USER_ID,
      ...payload,
    });
  },
};
