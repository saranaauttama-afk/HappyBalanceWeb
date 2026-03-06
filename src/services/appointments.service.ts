import { api } from "./api";
import type { Appointment } from "../types/models";

const DEMO_USER_ID = "demo-user-001";

export const appointmentsService = {
  async listAppointments(userId: string = DEMO_USER_ID) {
    return api.get<Appointment[]>("listAppointments", { userId });
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
};