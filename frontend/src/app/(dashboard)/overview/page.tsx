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
    <PageTransition className="space-y-8">
      {/* Welcome */}
      <div>
        <h2 className="text-2xl font-bold text-foreground tracking-tight">
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
          {stats.map(({ icon: Icon, label, value }) => (
            <StaggerItem key={label}>
              <div className="rounded-xl border border-border bg-card p-5">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs text-muted uppercase tracking-wider">{label}</span>
                  <Icon size={16} className="text-muted" />
                </div>
                <p className="text-3xl font-bold text-foreground tracking-tight">{value}</p>
              </div>
            </StaggerItem>
          ))}
        </StaggerContainer>
      )}

      {/* Quick action */}
      <StaggerContainer>
        <StaggerItem>
          <div className="rounded-xl border border-border bg-card p-6">
            <h3 className="text-sm font-semibold text-foreground mb-1">
              {t("dashboard.overview.addVehicle")}
            </h3>
            <p className="text-sm text-muted mb-5">
              Add your first vehicle to start tracking diagnostics
            </p>
            <Link
              href="/vehicles"
              className="inline-flex h-9 items-center rounded-lg bg-foreground px-4 text-sm font-medium text-background hover:opacity-90 transition-opacity"
            >
              <Car size={14} className="mr-2" />
              {t("dashboard.overview.addVehicle")}
              <ArrowRight size={14} className="ml-2" />
            </Link>
          </div>
        </StaggerItem>
      </StaggerContainer>
    </PageTransition>
  );
}
