import { api } from "./api";
import type { User } from "../types/models";

export const authService = {
  async registerUser(payload: {
    full_name: string;
    email: string;
    phone: string;
    password: string;
    auth_provider?: "password" | "google" | "facebook" | "apple";
  }) {
    return api.post<User>("registerUser", {
      ...payload,
      auth_provider: payload.auth_provider ?? "password",
    });
  },

  async loginUser(payload: { email: string; password: string }) {
    return api.post<User>("loginUser", payload);
  },
};
