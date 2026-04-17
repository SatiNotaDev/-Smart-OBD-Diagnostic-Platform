"use client";

import { Car, Activity, CreditCard } from "lucide-react";
import { useAuth } from "@/lib/auth/auth-context";
import { useI18n } from "@/lib/i18n/i18n";
import { useVehicles } from "@/lib/query/use-vehicles";
import Link from "next/link";

export default function DashboardPage() {
  const { user } = useAuth();
  const { t } = useI18n();
  const { data: vehicles } = useVehicles();

  const vehicleCount = vehicles?.length ?? 0;

  const stats = [
    {
      icon: Car,
      label: t("dashboard.overview.totalVehicles"),
      value: String(vehicleCount),
    },
    {
      icon: Activity,
      label: t("dashboard.overview.lastDiagnostic"),
      value: t("dashboard.overview.noDiagnostics"),
    },
    {
      icon: CreditCard,
      label: t("dashboard.overview.accountStatus"),
      value: t("dashboard.overview.freePlan"),
    },
  ];

  return (
    <div className="space-y-8">
      {/* Welcome */}
      <div>
        <h2 className="text-2xl font-bold text-foreground">
          {t("dashboard.overview.welcome")}, {user?.name || user?.email}
        </h2>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {stats.map(({ icon: Icon, label, value }) => (
          <div
            key={label}
            className="rounded-2xl border border-border bg-card p-6 shadow-sm"
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-[var(--radius)] bg-primary/10">
                <Icon size={20} className="text-primary" />
              </div>
              <span className="text-sm text-muted">{label}</span>
            </div>
            <p className="text-2xl font-bold text-foreground">{value}</p>
          </div>
        ))}
      </div>

      {/* Quick action */}
      <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-foreground mb-4">
          {t("dashboard.overview.addVehicle")}
        </h3>
        <Link
          href="/vehicles"
          className="inline-flex h-10 items-center rounded-[var(--radius)] bg-primary px-5 text-sm font-medium text-primary-foreground hover:bg-primary-hover transition-colors"
        >
          <Car size={16} className="mr-2" />
          {t("dashboard.overview.addVehicle")}
        </Link>
      </div>
    </div>
  );
}
