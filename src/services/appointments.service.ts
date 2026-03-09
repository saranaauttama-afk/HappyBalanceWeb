import { api } from "./api";
import type { Appointment, MonthlyGoal } from "../types/models";

const DEMO_USER_ID = "demo-user-001";

export const appointmentsService = {
  async listAppointments(userId?: string) {
    return api.get<Appointment[]>("listAppointments", { userId: userId ?? DEMO_USER_ID });
  },

  async createAppointment(payload: {
    user_id?: string;
    appointment_date: string;
    type: string;
    status: string;
    note: string;
  }) {
    return api.post<Appointment>("createAppointment", {
      user_id: payload.user_id ?? DEMO_USER_ID,
      ...payload,
    });
  },

  async listMonthlyGoals(userId?: string, month_key?: string) {
    return api.get<MonthlyGoal[]>("listMonthlyGoals", {
      userId: userId ?? DEMO_USER_ID,
      month_key,
    });
  },

  async upsertMonthlyGoal(payload: {
    user_id?: string;
    month_key: string;
    goal_text: string;
  }) {
    return api.post<MonthlyGoal>("upsertMonthlyGoal", {
      user_id: payload.user_id ?? DEMO_USER_ID,
      ...payload,
    });
  },
};
