import { api } from "./api";
import type { ApiResponse } from "../types/models";

export type AdminActivityScore = {
  category: string;
  activity: string;
  score: number;
};

export type AdminUserRow = {
  userId: string;
  email: string;
  fullName: string;
  lastActive: string | null;
  physical: number | null;
  mental: number | null;
  social: number | null;
  balance: number | null;
  logCount: number;
  activities: AdminActivityScore[];
};

export type AdminDashboardData = {
  summary: {
    totalUsers: number;
    activeThisMonth: number;
    avgPhysical: number | null;
    avgMental: number | null;
    avgSocial: number | null;
    avgBalance: number | null;
  };
  users: AdminUserRow[];
};

export const adminService = {
  async getDashboard(adminEmail: string): Promise<ApiResponse<AdminDashboardData>> {
    return api.get<AdminDashboardData>("getAdminDashboard", { adminEmail });
  },
};
