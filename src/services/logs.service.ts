import { api } from "./api";
import type { DailyLog } from "../types/models";

const DEMO_USER_ID = "demo-user-001";

export const logsService = {
  async listDailyLogs(userId: string = DEMO_USER_ID) {
    return api.get<DailyLog[]>("listDailyLogs", { userId });
  },

  async createDailyLog(payload: {
    user_id?: string;
    log_date: string;
    mood: string;
    energy: number;
    stress: number;
    note: string;
  }) {
    return api.post<DailyLog>("createDailyLog", {
      user_id: payload.user_id ?? DEMO_USER_ID,
      ...payload,
    });
  },
};