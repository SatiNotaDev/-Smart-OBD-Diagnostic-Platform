import { api } from "./api-client";

export interface PlanInfo {
  plan: "FREE" | "PRO" | "BUSINESS";
  expiresAt: string | null;
  hasSubscription: boolean;
}

export const subscriptionsApi = {
  getCurrent: () => api.get<PlanInfo>("/subscriptions/current"),

  checkout: (plan: "PRO" | "BUSINESS") =>
    api.post<{ url: string }>("/subscriptions/checkout", { plan }),

  portal: () => api.post<{ url: string }>("/subscriptions/portal"),
};
