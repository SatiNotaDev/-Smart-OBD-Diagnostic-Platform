import { api } from "./api-client";

export interface AdminStats {
  users: {
    total: number;
    thisWeek: number;
    thisMonth: number;
    byPlan: Record<string, number>;
  };
  vehicles: { total: number };
  diagnostics: { total: number; today: number };
  aiChat: { totalMessages: number; messagesToday: number };
}

export interface AdminUser {
  id: string;
  email: string;
  name: string | null;
  role: string;
  plan: string;
  isEmailVerified: boolean;
  createdAt: string;
  _count: { vehicles: number };
}

export interface UsersResponse {
  users: AdminUser[];
  total: number;
  page: number;
  totalPages: number;
}

export interface TopDtc {
  code: string;
  count: number;
}

export interface AiUsageEntry {
  email: string;
  name: string | null;
  count: number;
}

export const adminApi = {
  getStats: () => api.get<AdminStats>("/admin/stats"),

  getUsers: (page = 1, search?: string) =>
    api.get<UsersResponse>(`/admin/users?page=${page}${search ? `&search=${encodeURIComponent(search)}` : ""}`),

  updateUserPlan: (userId: string, plan: string) =>
    api.patch<{ id: string; email: string; plan: string }>(`/admin/users/${userId}/plan`, { plan }),

  deleteUser: (userId: string) => api.del(`/admin/users/${userId}`),

  getTopDtc: () => api.get<TopDtc[]>("/admin/top-dtc"),

  getAiUsage: () => api.get<AiUsageEntry[]>("/admin/ai-usage"),
};
