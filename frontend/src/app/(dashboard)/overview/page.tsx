"use client";

import { Car, Activity, CreditCard, ArrowRight } from "lucide-react";
import { useAuth } from "@/lib/auth/auth-context";
import { useI18n } from "@/lib/i18n/i18n";
import { useVehicles } from "@/lib/query/use-vehicles";
import { PageTransition, StaggerContainer, StaggerItem } from "@/components/ui/page-transition";
import { SkeletonCard } from "@/components/ui/skeleton";
import Link from "next/link";

export default function DashboardPage() {
  const { user } = useAuth();
  const { t } = useI18n();
  const { data: vehicles, isLoading } = useVehicles();

  const vehicleCount = vehicles?.length ?? 0;

  const stats = [
    {
      icon: Car,
      label: t("dashboard.overview.totalVehicles"),
      value: String(vehicleCount),
      color: "text-primary",
      bg: "bg-primary/8",
    },
    {
      icon: Activity,
      label: t("dashboard.overview.lastDiagnostic"),
      value: t("dashboard.overview.noDiagnostics"),
      color: "text-success",
      bg: "bg-success/8",
    },
    {
      icon: CreditCard,
      label: t("dashboard.overview.accountStatus"),
      value: t("dashboard.overview.freePlan"),
      color: "text-warning",
      bg: "bg-warning/8",
    },
  ];

  return (
    <PageTransition className="space-y-8 max-w-4xl">
      {/* Welcome */}
      <div>
        <h2 className="text-xl font-semibold text-foreground">
          {t("dashboard.overview.welcome")}, {user?.name || user?.email}
        </h2>
        <p className="text-sm text-muted mt-1">
          Here&apos;s what&apos;s happening with your vehicles
        </p>
      </div>

      {/* Stats */}
      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-3">
          {[1, 2, 3].map((i) => <SkeletonCard key={i} />)}
        </div>
      ) : (
        <StaggerContainer className="grid gap-4 sm:grid-cols-3">
          {stats.map(({ icon: Icon, label, value, color, bg }) => (
            <StaggerItem key={label}>
              <div className="rounded-lg border border-border bg-card p-5">
                <div className="flex items-center gap-3 mb-3">
                  <div className={`flex h-8 w-8 items-center justify-center rounded-md ${bg}`}>
                    <Icon size={16} className={color} />
                  </div>
                  <span className="text-xs text-muted uppercase tracking-wide">{label}</span>
                </div>
                <p className="text-2xl font-semibold text-foreground">{value}</p>
              </div>
            </StaggerItem>
          ))}
        </StaggerContainer>
      )}

      {/* Quick action */}
      <StaggerContainer>
        <StaggerItem>
          <div className="rounded-lg border border-border bg-card p-6">
            <h3 className="text-sm font-medium text-foreground mb-1">
              {t("dashboard.overview.addVehicle")}
            </h3>
            <p className="text-sm text-muted mb-4">
              Add your first vehicle to start tracking diagnostics
            </p>
            <Link
              href="/vehicles"
              className="inline-flex h-8 items-center rounded-md bg-primary px-3 text-sm font-medium text-primary-foreground hover:bg-primary-hover transition-colors"
            >
              <Car size={14} className="mr-1.5" />
              {t("dashboard.overview.addVehicle")}
              <ArrowRight size={12} className="ml-1.5" />
            </Link>
          </div>
        </StaggerItem>
      </StaggerContainer>
    </PageTransition>
  );
}
