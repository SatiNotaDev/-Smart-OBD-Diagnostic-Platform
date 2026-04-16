import { api } from "./api-client";

export interface User {
  id: string;
  email: string;
  name: string | null;
  avatar: string | null;
  role: string;
  isEmailVerified: boolean;
  mfaEnabled: boolean;
  preferredLanguage: string;
  theme: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: User;
}

export const authApi = {
  register: (data: { email: string; password: string; name?: string }) =>
    api.post<{ message: string }>("/auth/register", data),

  login: (data: { email: string; password: string; mfaCode?: string }) =>
    api.post<AuthResponse | { requiresMfa: boolean }>("/auth/login", data),

  logout: () => api.post("/auth/logout"),

  me: () => api.get<User>("/auth/me"),

  verifyEmail: (token: string) =>
    api.get<{ message: string }>(`/auth/verify-email?token=${token}`),

  forgotPassword: (email: string) =>
    api.post<{ message: string }>("/auth/forgot-password", { email }),

  resetPassword: (token: string, newPassword: string) =>
    api.post<{ message: string }>("/auth/reset-password", { token, newPassword }),

  googleLogin: () => {
    window.location.href = `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api"}/auth/google`;
  },

  setupMfa: () =>
    api.post<{ secret: string; qrCodeUrl: string; backupCodes: string[] }>("/auth/mfa/setup"),

  verifyMfa: (code: string) =>
    api.post<{ message: string }>("/auth/mfa/verify", { code }),

  disableMfa: (code: string) =>
    api.post<{ message: string }>("/auth/mfa/disable", { code }),
};
