import { api } from "./api";
import type { Appointment, WeeklyGoal } from "../types/models";

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

  async deleteAppointment(id: string, userId?: string) {
    return api.post<{ id: string }>("deleteAppointment", {
      id,
      user_id: userId ?? DEMO_USER_ID,
    });
  },

  async listWeeklyGoals(userId?: string, week_start_date?: string) {
    return api.get<WeeklyGoal[]>("listWeeklyGoals", {
      userId: userId ?? DEMO_USER_ID,
      week_start_date,
      _ts: Date.now(),
    });
  },

  async upsertWeeklyGoal(payload: {
    user_id?: string;
    week_start_date: string;
    goal_text: string;
  }) {
    return api.post<WeeklyGoal>("upsertWeeklyGoal", {
      user_id: payload.user_id ?? DEMO_USER_ID,
      ...payload,
    });
  },
};
