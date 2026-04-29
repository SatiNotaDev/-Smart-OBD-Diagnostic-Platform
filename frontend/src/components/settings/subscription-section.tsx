"use client";

import { useState, useEffect } from "react";
import { CreditCard, Check, Zap, Building2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { subscriptionsApi, type PlanInfo } from "@/lib/api/subscriptions-api";
import { useI18n } from "@/lib/i18n/i18n";
import { useToast } from "@/components/ui/toast";

const plans = [
  {
    id: "FREE" as const,
    icon: Zap,
    vehicles: 3,
    scans: 10,
    ai: false,
  },
  {
    id: "PRO" as const,
    icon: CreditCard,
    vehicles: 15,
    scans: -1,
    ai: true,
  },
  {
    id: "BUSINESS" as const,
    icon: Building2,
    vehicles: -1,
    scans: -1,
    ai: true,
  },
];

export function SubscriptionSection() {
  const { t } = useI18n();
  const { error: showError } = useToast();
  const [planInfo, setPlanInfo] = useState<PlanInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [checkoutLoading, setCheckoutLoading] = useState<string | null>(null);

  useEffect(() => {
    subscriptionsApi.getCurrent()
      .then(setPlanInfo)
      .catch(() => setPlanInfo({ plan: "FREE", expiresAt: null, hasSubscription: false }))
      .finally(() => setLoading(false));
  }, []);

  const handleUpgrade = async (plan: "PRO" | "BUSINESS") => {
    setCheckoutLoading(plan);
    try {
      const { url } = await subscriptionsApi.checkout(plan);
      if (url) window.location.href = url;
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Failed to start checkout";
      showError(msg);
      setCheckoutLoading(null);
    }
  };

  const handleManage = async () => {
    try {
      const { url } = await subscriptionsApi.portal();
      if (url) window.location.href = url;
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Failed to open portal";
      showError(msg);
    }
  };

  if (loading) {
    return (
      <div className="rounded-xl border border-border bg-card p-6 flex justify-center">
        <Loader2 size={20} className="animate-spin text-muted" />
      </div>
    );
  }

  const currentPlan = planInfo?.plan || "FREE";

  return (
    <div className="rounded-xl border border-border bg-card p-6">
      <h3 className="text-lg font-semibold text-foreground mb-5">
        {t("dashboard.settings.tariff.title")}
      </h3>

      <div className="grid gap-4 sm:grid-cols-3">
        {plans.map((plan) => {
          const isCurrent = currentPlan === plan.id;
          const Icon = plan.icon;

          return (
            <div
              key={plan.id}
              className={`relative rounded-[var(--radius)] border p-4 transition-colors ${
                isCurrent
                  ? "border-primary bg-primary/5"
                  : "border-border hover:border-primary/40"
              }`}
            >
              {isCurrent && (
                <Badge variant="success" className="absolute -top-2 right-3 text-[10px]">
                  {t("dashboard.settings.tariff.current")}
                </Badge>
              )}

              <div className="flex items-center gap-2 mb-3">
                <Icon size={18} className="text-primary" />
                <span className="font-semibold text-foreground">
                  {t(`dashboard.settings.tariff.${plan.id.toLowerCase()}Name`)}
                </span>
              </div>

              <ul className="space-y-1.5 text-xs text-muted mb-4">
                <li className="flex items-center gap-1.5">
                  <Check size={12} className="text-success" />
                  {plan.vehicles === -1
                    ? t("dashboard.settings.tariff.unlimitedVehicles")
                    : t("dashboard.settings.tariff.vehiclesLimit", { count: plan.vehicles })}
                </li>
                <li className="flex items-center gap-1.5">
                  <Check size={12} className="text-success" />
                  {plan.scans === -1
                    ? t("dashboard.settings.tariff.unlimitedScans")
                    : t("dashboard.settings.tariff.scansLimit", { count: plan.scans })}
                </li>
                <li className="flex items-center gap-1.5">
                  <Check size={12} className={plan.ai ? "text-success" : "text-muted"} />
                  {t("dashboard.settings.tariff.aiChat")}
                </li>
              </ul>

              {!isCurrent && plan.id !== "FREE" && (
                <Button
                  className="w-full text-xs h-8"
                  onClick={() => handleUpgrade(plan.id)}
                  isLoading={checkoutLoading === plan.id}
                >
                  {t("dashboard.settings.tariff.upgrade")}
                </Button>
              )}
              {isCurrent && planInfo?.hasSubscription && (
                <Button
                  variant="outline"
                  className="w-full text-xs h-8"
                  onClick={handleManage}
                >
                  {t("dashboard.settings.tariff.manage")}
                </Button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
