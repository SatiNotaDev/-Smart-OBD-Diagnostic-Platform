"use client";

import {
  Car,
  Activity,
  AlertTriangle,
  TrendingUp,
  ArrowRight,
  ArrowUpRight,
  ArrowDownRight,
  Shield,
  Zap,
  Clock,
} from "lucide-react";
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

const SYSTEM_LABELS: Record<string, string> = {
  P: "Powertrain",
  B: "Body",
  C: "Chassis",
  U: "Network",
};

const SYSTEM_COLORS: Record<string, string> = {
  P: "bg-blue-500",
  B: "bg-amber-500",
  C: "bg-emerald-500",
  U: "bg-purple-500",
};

const SEVERITY_LABELS = ["Info", "Low", "Medium", "High", "Critical"];
const SEVERITY_COLORS = [
  "bg-slate-400",
  "bg-blue-400",
  "bg-amber-400",
  "bg-orange-500",
  "bg-red-500",
];

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
  const healthScore = stats?.healthScore ?? 100;

  if (isLoading) {
    return (
      <PageTransition className="space-y-6">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => <SkeletonCard key={i} />)}
        </div>
        <div className="grid gap-4 lg:grid-cols-3">
          <SkeletonCard /><SkeletonCard /><SkeletonCard />
        </div>
      </PageTransition>
    );
  }

  return (
    <PageTransition className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground tracking-tight">
            Dashboard
          </h2>
          <p className="text-sm text-muted mt-0.5">
            Fleet diagnostics overview
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-medium text-muted uppercase tracking-wider px-2 py-1 rounded-md bg-accent">
            {plan} Plan
          </span>
        </div>
      </div>

      {/* KPI Row */}
      <StaggerContainer className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StaggerItem>
          <KpiCard
            label="Fleet Health"
            value={`${healthScore}%`}
            icon={Shield}
            trend={healthScore >= 80 ? "up" : healthScore >= 50 ? "neutral" : "down"}
            color={healthScore >= 80 ? "text-emerald-500" : healthScore >= 50 ? "text-amber-500" : "text-red-500"}
            bgColor={healthScore >= 80 ? "bg-emerald-500/10" : healthScore >= 50 ? "bg-amber-500/10" : "bg-red-500/10"}
          />
        </StaggerItem>
        <StaggerItem>
          <KpiCard
            label="Vehicles"
            value={String(vehicleCount)}
            icon={Car}
            sub={limit === Infinity ? "Unlimited" : `${vehicleCount}/${limit} slots`}
            color="text-primary"
            bgColor="bg-primary/10"
          />
        </StaggerItem>
        <StaggerItem>
          <KpiCard
            label="Diagnostics"
            value={String(stats?.sessionCount ?? 0)}
            icon={Activity}
            sub="Total scans"
            color="text-violet-500"
            bgColor="bg-violet-500/10"
          />
        </StaggerItem>
        <StaggerItem>
          <KpiCard
            label="Issues Found"
            value={String(stats?.dtcCount ?? 0)}
            icon={AlertTriangle}
            sub="DTC codes"
            color="text-amber-500"
            bgColor="bg-amber-500/10"
          />
        </StaggerItem>
      </StaggerContainer>

      {/* Main Grid */}
      <div className="grid gap-4 lg:grid-cols-3">
        {/* Activity Chart - spans 2 cols */}
        <div className="lg:col-span-2 rounded-xl border border-border bg-card p-5">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-sm font-semibold text-foreground">Diagnostic Activity</h3>
              <p className="text-xs text-muted mt-0.5">Last 6 months</p>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-muted">
              <TrendingUp size={12} />
              <span>{stats?.sessionCount ?? 0} total</span>
            </div>
          </div>
          {stats?.monthlyDiagnostics && stats.monthlyDiagnostics.length > 0 ? (
            <ActivityChart data={stats.monthlyDiagnostics} />
          ) : (
            <div className="flex items-center justify-center h-40 text-sm text-muted">
              No diagnostic data yet
            </div>
          )}
        </div>

        {/* Health Gauge */}
        <div className="rounded-xl border border-border bg-card p-5">
          <h3 className="text-sm font-semibold text-foreground mb-4">Health Score</h3>
          <HealthGauge score={healthScore} />
          <p className="text-xs text-muted text-center mt-3">
            {healthScore >= 80
              ? "Your fleet is in good condition"
              : healthScore >= 50
              ? "Some issues need attention"
              : "Critical issues detected"}
          </p>
        </div>
      </div>

      {/* Secondary Grid */}
      <div className="grid gap-4 lg:grid-cols-3">
        {/* Severity Distribution */}
        <div className="rounded-xl border border-border bg-card p-5">
          <h3 className="text-sm font-semibold text-foreground mb-4">Severity Breakdown</h3>
          {stats?.severityDistribution && stats.severityDistribution.some((v) => v > 0) ? (
            <SeverityChart distribution={stats.severityDistribution} />
          ) : (
            <EmptyState text="No issues recorded" />
          )}
        </div>

        {/* System Categories */}
        <div className="rounded-xl border border-border bg-card p-5">
          <h3 className="text-sm font-semibold text-foreground mb-4">Issues by System</h3>
          {stats?.systemBreakdown && Object.values(stats.systemBreakdown).some((v) => v > 0) ? (
            <SystemBreakdown data={stats.systemBreakdown} />
          ) : (
            <EmptyState text="No system data" />
          )}
        </div>

        {/* Top DTCs */}
        <div className="rounded-xl border border-border bg-card p-5">
          <h3 className="text-sm font-semibold text-foreground mb-4">Top Recurring Codes</h3>
          {stats?.topDtcs && stats.topDtcs.length > 0 ? (
            <div className="space-y-3">
              {stats.topDtcs.map(({ code, count }, i) => (
                <div key={code} className="flex items-center gap-3">
                  <span className="text-[10px] font-bold text-muted w-4">{i + 1}</span>
                  <span className="font-mono text-sm font-medium text-foreground flex-1">{code}</span>
                  <div className="flex items-center gap-2">
                    <div className="w-16 h-1.5 rounded-full bg-surface overflow-hidden">
                      <div
                        className="h-full rounded-full bg-primary/70"
                        style={{ width: `${(count / stats.topDtcs[0].count) * 100}%` }}
                      />
                    </div>
                    <span className="text-xs text-muted w-6 text-right">{count}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState text="No codes recorded" />
          )}
        </div>
      </div>

      {/* Bottom Grid */}
      <div className="grid gap-4 lg:grid-cols-2">
        {/* Recent Activity */}
        <div className="rounded-xl border border-border bg-card p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-foreground">Recent Activity</h3>
            <Link href="/vehicles" className="text-xs text-primary hover:underline flex items-center gap-1">
              View all <ArrowRight size={10} />
            </Link>
          </div>
          {stats?.recentSessions && stats.recentSessions.length > 0 ? (
            <div className="space-y-1">
              {stats.recentSessions.slice(0, 6).map((session) => {
                const maxSev = Math.max(...session.dtcs.map((d) => d.severity), 1);
                return (
                  <div
                    key={session.id}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-accent/50 transition-colors"
                  >
                    <div className={`w-2 h-2 rounded-full shrink-0 ${
                      maxSev >= 4 ? "bg-red-500" : maxSev >= 3 ? "bg-amber-500" : "bg-emerald-500"
                    }`} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-foreground truncate">
                          {session.vehicle.brand} {session.vehicle.model}
                        </span>
                        <span className="text-[10px] font-mono text-muted bg-accent px-1.5 py-0.5 rounded">
                          {session._count.dtcs} DTC{session._count.dtcs !== 1 ? "s" : ""}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      {session.result && (
                        <span className="text-[10px] text-muted">
                          {Math.round(session.result.confidence * 100)}%
                        </span>
                      )}
                      <span className="text-[11px] text-muted">
                        {formatRelativeDate(session.createdAt)}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <EmptyState text="No diagnostics yet" />
          )}
        </div>

        {/* Vehicle Activity */}
        <div className="rounded-xl border border-border bg-card p-5">
          <h3 className="text-sm font-semibold text-foreground mb-4">Vehicle Activity</h3>
          {stats?.vehicleActivity && stats.vehicleActivity.length > 0 ? (
            <div className="space-y-3">
              {stats.vehicleActivity.slice(0, 6).map(({ vehicle, sessions }) => (
                <div key={vehicle} className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent shrink-0">
                    <Car size={14} className="text-muted" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{vehicle}</p>
                    <p className="text-[11px] text-muted">{sessions} scan{sessions !== 1 ? "s" : ""}</p>
                  </div>
                  <div className="w-20 h-1.5 rounded-full bg-surface overflow-hidden">
                    <div
                      className="h-full rounded-full bg-primary/60"
                      style={{
                        width: `${(sessions / Math.max(...stats.vehicleActivity.map((v) => v.sessions))) * 100}%`,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState text="Add vehicles to see activity" />
          )}
        </div>
      </div>

      {/* Plan Usage */}
      {limit !== Infinity && (
        <div className="rounded-xl border border-border bg-card p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Zap size={14} className="text-primary" />
              <span className="text-sm font-semibold text-foreground">Plan Usage</span>
            </div>
            <Link href="/settings" className="text-xs text-primary hover:underline">
              Upgrade
            </Link>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs text-muted">Vehicle slots</span>
                <span className="text-xs font-medium text-foreground">{vehicleCount} / {limit}</span>
              </div>
              <div className="h-2 rounded-full bg-surface overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-700 ${
                    usagePercent >= 100 ? "bg-red-500" : usagePercent >= 80 ? "bg-amber-500" : "bg-primary"
                  }`}
                  style={{ width: `${Math.min(usagePercent, 100)}%` }}
                />
              </div>
            </div>
            <span className={`text-2xl font-bold ${
              usagePercent >= 100 ? "text-red-500" : usagePercent >= 80 ? "text-amber-500" : "text-foreground"
            }`}>
              {usagePercent}%
            </span>
          </div>
        </div>
      )}

      {/* Empty state for new users */}
      {vehicleCount === 0 && (
        <div className="rounded-xl border border-dashed border-border bg-accent/30 p-8 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 mx-auto mb-4">
            <Car size={24} className="text-primary" />
          </div>
          <h3 className="text-base font-semibold text-foreground mb-1">Get started</h3>
          <p className="text-sm text-muted mb-4 max-w-md mx-auto">
            Add your first vehicle and run a diagnostic scan to populate your analytics dashboard.
          </p>
          <Link
            href="/vehicles"
            className="inline-flex h-9 items-center rounded-lg bg-primary px-5 text-sm font-medium text-primary-foreground hover:bg-primary-hover transition-colors"
          >
            Add Vehicle
            <ArrowRight size={14} className="ml-2" />
          </Link>
        </div>
      )}
    </PageTransition>
  );
}

// ─── Sub-components ──────────────────────────────────────────────────

function KpiCard({
  label,
  value,
  icon: Icon,
  sub,
  trend,
  color,
  bgColor,
}: {
  label: string;
  value: string;
  icon: any;
  sub?: string;
  trend?: "up" | "down" | "neutral";
  color: string;
  bgColor: string;
}) {
  return (
    <div className="rounded-xl border border-border bg-card p-5 flex flex-col justify-between h-full">
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-medium text-muted uppercase tracking-wider">{label}</span>
        <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${bgColor}`}>
          <Icon size={15} className={color} />
        </div>
      </div>
      <div>
        <div className="flex items-end gap-2">
          <span className="text-3xl font-bold text-foreground tracking-tight leading-none">{value}</span>
          {trend && (
            <span className={`flex items-center gap-0.5 text-[11px] font-medium mb-0.5 ${
              trend === "up" ? "text-emerald-500" : trend === "down" ? "text-red-500" : "text-muted"
            }`}>
              {trend === "up" ? <ArrowUpRight size={12} /> : trend === "down" ? <ArrowDownRight size={12} /> : null}
            </span>
          )}
        </div>
        {sub && <p className="text-[11px] text-muted mt-1">{sub}</p>}
      </div>
    </div>
  );
}

function ActivityChart({ data }: { data: Array<{ month: string; count: number }> }) {
  const max = Math.max(...data.map((d) => d.count), 1);

  return (
    <div className="flex items-end gap-1.5 h-36">
      {data.map(({ month, count }) => {
        const height = (count / max) * 100;
        const monthLabel = new Date(month + "-01").toLocaleString("default", { month: "short" });
        return (
          <div key={month} className="flex-1 flex flex-col items-center gap-1.5 group">
            <span className="text-[10px] font-medium text-foreground opacity-0 group-hover:opacity-100 transition-opacity">
              {count}
            </span>
            <div className="w-full flex items-end justify-center" style={{ height: "110px" }}>
              <div
                className="w-full max-w-10 rounded-md bg-primary/20 group-hover:bg-primary/40 transition-all duration-300 relative overflow-hidden"
                style={{ height: `${Math.max(height, 6)}%` }}
              >
                <div
                  className="absolute bottom-0 left-0 right-0 bg-primary rounded-md transition-all duration-500"
                  style={{ height: `${Math.max(height, 6)}%` }}
                />
              </div>
            </div>
            <span className="text-[10px] text-muted">{monthLabel}</span>
          </div>
        );
      })}
    </div>
  );
}

function HealthGauge({ score }: { score: number }) {
  const circumference = 2 * Math.PI * 54;
  const offset = circumference - (score / 100) * circumference * 0.75;
  const color = score >= 80 ? "#10b981" : score >= 50 ? "#f59e0b" : "#ef4444";

  return (
    <div className="flex items-center justify-center">
      <div className="relative w-36 h-36">
        <svg className="w-full h-full -rotate-[135deg]" viewBox="0 0 120 120">
          <circle
            cx="60"
            cy="60"
            r="54"
            fill="none"
            stroke="currentColor"
            strokeWidth="8"
            className="text-surface"
            strokeDasharray={`${circumference * 0.75} ${circumference}`}
            strokeLinecap="round"
          />
          <circle
            cx="60"
            cy="60"
            r="54"
            fill="none"
            stroke={color}
            strokeWidth="8"
            strokeDasharray={`${circumference * 0.75} ${circumference}`}
            strokeDashoffset={offset}
            strokeLinecap="round"
            className="transition-all duration-1000"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-3xl font-bold text-foreground">{score}</span>
          <span className="text-[10px] text-muted uppercase tracking-wider">Score</span>
        </div>
      </div>
    </div>
  );
}

function SeverityChart({ distribution }: { distribution: number[] }) {
  const total = distribution.reduce((a, b) => a + b, 0);

  return (
    <div className="space-y-2.5">
      {distribution.map((count, i) => {
        const percent = total > 0 ? Math.round((count / total) * 100) : 0;
        return (
          <div key={i} className="flex items-center gap-3">
            <span className="text-[11px] text-muted w-14 shrink-0">{SEVERITY_LABELS[i]}</span>
            <div className="flex-1 h-2 rounded-full bg-surface overflow-hidden">
              <div
                className={`h-full rounded-full ${SEVERITY_COLORS[i]} transition-all duration-500`}
                style={{ width: `${Math.max(percent, count > 0 ? 3 : 0)}%` }}
              />
            </div>
            <span className="text-[11px] font-medium text-foreground w-8 text-right">{count}</span>
          </div>
        );
      })}
    </div>
  );
}

function SystemBreakdown({ data }: { data: Record<string, number> }) {
  const total = Object.values(data).reduce((a, b) => a + b, 0);

  return (
    <div className="space-y-3">
      {Object.entries(data).map(([key, count]) => {
        const percent = total > 0 ? Math.round((count / total) * 100) : 0;
        return (
          <div key={key} className="flex items-center gap-3">
            <div className={`w-2.5 h-2.5 rounded-sm ${SYSTEM_COLORS[key]} shrink-0`} />
            <span className="text-xs text-foreground flex-1">{SYSTEM_LABELS[key]}</span>
            <span className="text-[11px] text-muted">{percent}%</span>
            <span className="text-xs font-medium text-foreground w-6 text-right">{count}</span>
          </div>
        );
      })}
      {total > 0 && (
        <div className="flex gap-0.5 h-2 rounded-full overflow-hidden mt-2">
          {Object.entries(data).map(([key, count]) => {
            const percent = total > 0 ? (count / total) * 100 : 0;
            return percent > 0 ? (
              <div
                key={key}
                className={`${SYSTEM_COLORS[key]} transition-all duration-500`}
                style={{ width: `${percent}%` }}
              />
            ) : null;
          })}
        </div>
      )}
    </div>
  );
}

function EmptyState({ text }: { text: string }) {
  return (
    <div className="flex items-center justify-center h-24 text-xs text-muted">
      {text}
    </div>
  );
}

function formatRelativeDate(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays}d ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)}w ago`;
  return date.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}
