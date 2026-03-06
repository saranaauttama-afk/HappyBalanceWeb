import { api } from "./api";
import type { User } from "../types/models";

const DEMO_USER_ID = "demo-user-001";

export const profileService = {
  async getUser(id: string = DEMO_USER_ID) {
    return api.get<User>("getUser", { id });
  },

  async updateProfile(payload: {
    id?: string;
    full_name: string;
    email: string;
    phone: string;
  }) {
    return api.post<User>("updateProfile", {
      id: payload.id ?? DEMO_USER_ID,
      ...payload,
    });
  },
};