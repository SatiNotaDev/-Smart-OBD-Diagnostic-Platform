"use client";

import { Car, Activity, CreditCard, AlertTriangle, ArrowRight, BarChart3 } from "lucide-react";
import { useAuth } from "@/lib/auth/auth-context";
import { useI18n } from "@/lib/i18n/i18n";
import { useVehicles } from "@/lib/query/use-vehicles";
import { useDashboardStats } from "@/lib/query/use-diagnostics";
import { PageTransition, StaggerContainer, StaggerItem } from "@/components/ui/page-transition";
import { SkeletonCard } from "@/components/ui/skeleton";
import Link from "next/link";

const PLAN_LIMITS: Record<string, number> = {
  FREE: 3,
  PRO: 15,
  BUSINESS: Infinity,
};

export default function DashboardPage() {
  const { user } = useAuth();
  const { t } = useI18n();
  const { data: vehicles, isLoading: vehiclesLoading } = useVehicles();
  const { data: stats, isLoading: statsLoading } = useDashboardStats();

  const isLoading = vehiclesLoading || statsLoading;
  const vehicleCount = vehicles?.length ?? 0;
  const plan = user?.plan || "FREE";
  const limit = PLAN_LIMITS[plan] ?? 3;
  const usagePercent = limit === Infinity ? 0 : Math.round((vehicleCount / limit) * 100);

  const statCards = [
    {
      icon: Car,
      label: t("dashboard.overview.totalVehicles"),
      value: String(vehicleCount),
      sub: limit === Infinity ? "Unlimited" : `${vehicleCount} / ${limit}`,
    },
    {
      icon: Activity,
      label: t("dashboard.overview.lastDiagnostic"),
      value: stats?.sessionCount != null ? String(stats.sessionCount) : "0",
      sub: "Total sessions",
    },
    {
      icon: AlertTriangle,
      label: "DTC Codes Found",
      value: stats?.dtcCount != null ? String(stats.dtcCount) : "0",
      sub: "Across all vehicles",
    },
    {
      icon: CreditCard,
      label: t("dashboard.overview.accountStatus"),
      value: plan,
      sub: plan === "FREE" ? "Upgrade for more" : "Active",
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
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => <SkeletonCard key={i} />)}
        </div>
      ) : (
        <StaggerContainer className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {statCards.map(({ icon: Icon, label, value, sub }) => (
            <StaggerItem key={label}>
              <div className="rounded-xl border border-border bg-card p-5">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs text-muted uppercase tracking-wider">{label}</span>
                  <Icon size={16} className="text-muted" />
                </div>
                <p className="text-3xl font-bold text-foreground tracking-tight">{value}</p>
                <p className="text-xs text-muted mt-1">{sub}</p>
              </div>
            </StaggerItem>
          ))}
        </StaggerContainer>
      )}

      {/* Plan usage bar */}
      {limit !== Infinity && (
        <div className="rounded-xl border border-border bg-card p-5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-foreground">Vehicle Limit</span>
            <span className="text-xs text-muted">{vehicleCount} / {limit} ({plan} plan)</span>
          </div>
          <div className="h-2 rounded-full bg-surface overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                usagePercent >= 100 ? "bg-red-500" : usagePercent >= 80 ? "bg-yellow-500" : "bg-primary"
              }`}
              style={{ width: `${Math.min(usagePercent, 100)}%` }}
            />
          </div>
          {usagePercent >= 80 && (
            <p className="text-xs text-muted mt-2">
              {usagePercent >= 100
                ? "You've reached your vehicle limit. Upgrade to add more."
                : "You're approaching your vehicle limit."}
            </p>
          )}
        </div>
      )}

      {/* Monthly diagnostics chart */}
      {stats?.monthlyDiagnostics && stats.monthlyDiagnostics.length > 0 && (
        <div className="rounded-xl border border-border bg-card p-5">
          <div className="flex items-center gap-2 mb-4">
            <BarChart3 size={16} className="text-muted" />
            <span className="text-sm font-medium text-foreground">Diagnostic Activity</span>
          </div>
          <div className="flex items-end gap-2 h-32">
            {stats.monthlyDiagnostics.map(({ month, count }) => {
              const max = Math.max(...stats.monthlyDiagnostics.map((d) => d.count));
              const height = max > 0 ? (count / max) * 100 : 0;
              return (
                <div key={month} className="flex-1 flex flex-col items-center gap-1">
                  <span className="text-[10px] text-muted">{count}</span>
                  <div className="w-full flex items-end justify-center" style={{ height: "100px" }}>
                    <div
                      className="w-full max-w-8 rounded-t bg-primary/80 transition-all duration-500"
                      style={{ height: `${Math.max(height, 4)}%` }}
                    />
                  </div>
                  <span className="text-[10px] text-muted">{month.slice(5)}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Recent sessions */}
      {stats?.recentSessions && stats.recentSessions.length > 0 && (
        <div className="rounded-xl border border-border bg-card p-5">
          <h3 className="text-sm font-medium text-foreground mb-3">Recent Diagnostics</h3>
          <div className="space-y-2">
            {stats.recentSessions.map((session) => (
              <div
                key={session.id}
                className="flex items-center justify-between py-2 border-b border-border last:border-0"
              >
                <div>
                  <span className="text-sm text-foreground">
                    {session.vehicle.brand} {session.vehicle.model}
                  </span>
                  <span className="text-xs text-muted ml-2">
                    {session._count.dtcs} DTC{session._count.dtcs !== 1 ? "s" : ""}
                  </span>
                </div>
                <span className="text-xs text-muted">
                  {new Date(session.createdAt).toLocaleDateString()}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Quick action */}
      {vehicleCount === 0 && (
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
                className="inline-flex h-9 items-center rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground hover:bg-primary-hover transition-colors"
              >
                <Car size={14} className="mr-2" />
                {t("dashboard.overview.addVehicle")}
                <ArrowRight size={14} className="ml-2" />
              </Link>
            </div>
          </StaggerItem>
        </StaggerContainer>
      )}
    </PageTransition>
  );
}
