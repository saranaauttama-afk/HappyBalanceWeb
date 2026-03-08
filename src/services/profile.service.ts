import { api } from "./api";
import type { User } from "../types/models";

const DEMO_USER_ID = "demo-user-001";

export const profileService = {
  async getUser(id: string = DEMO_USER_ID) {
    return api.get<User>("getUser", { id });
  },

  async updateProfile(payload: {
    id?: string;
    full_name?: string;
    email?: string;
    phone?: string;
    sleep_goal_minutes?: number;
    water_goal_ml?: number;
  }) {
    return api.post<User>("updateProfile", {
      id: payload.id ?? DEMO_USER_ID,
      ...payload,
    });
  },

  async uploadProfileAvatar(payload: {
    id?: string;
    file_name: string;
    mime_type: string;
    image_base64: string;
  }) {
    return api.post<User>("uploadProfileAvatar", {
      id: payload.id ?? DEMO_USER_ID,
      ...payload,
    });
  },
};
