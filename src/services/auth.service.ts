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

  async requestPasswordReset(payload: {
    email: string;
    app_base_url?: string;
  }) {
    return api.post<{ message: string }>("requestPasswordReset", payload);
  },

  async validatePasswordResetToken(token: string) {
    return api.get<{ valid: boolean; email?: string; error?: string }>(
      "validatePasswordResetToken",
      { token }
    );
  },

  async resetPassword(payload: { token: string; new_password: string }) {
    return api.post<{ message: string }>("resetPassword", payload);
  },
};
