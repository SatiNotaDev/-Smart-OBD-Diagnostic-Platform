"use client";

import { useMemo } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { TrendingUp } from "lucide-react";
import { useI18n } from "@/lib/i18n/i18n";

interface DiagnosticSession {
  id: string;
  createdAt: string;
  dtcs?: Array<{ code: string; severity: number }>;
}

interface DiagnosticsChartProps {
  sessions: DiagnosticSession[];
}

const SEVERITY_COLORS: Record<number, string> = {
  1: "#22c55e",
  2: "#84cc16",
  3: "#eab308",
  4: "#f97316",
  5: "#ef4444",
};

export function DiagnosticsChart({ sessions }: DiagnosticsChartProps) {
  const { t } = useI18n();

  const chartData = useMemo(() => {
    if (!sessions || sessions.length === 0) return [];

    return sessions
      .slice(0, 12)
      .reverse()
      .map((session) => {
        const dtcCount = session.dtcs?.length || 0;
        const maxSeverity = session.dtcs?.length
          ? Math.max(...session.dtcs.map((d) => d.severity))
          : 0;

        return {
          date: new Date(session.createdAt).toLocaleDateString(undefined, {
            month: "short",
            day: "numeric",
          }),
          codes: dtcCount,
          severity: maxSeverity,
        };
      });
  }, [sessions]);

  if (chartData.length < 2) return null;

  return (
    <div className="rounded-xl border border-border bg-card p-6">
      <h3 className="text-lg font-semibold text-foreground flex items-center gap-2 mb-4">
        <TrendingUp size={20} className="text-primary" />
        {t("dashboard.vehicles.diagnostics.chartTitle")}
      </h3>

      <div className="h-48">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 5, right: 5, bottom: 5, left: 0 }}>
            <XAxis dataKey="date" tick={{ fontSize: 11 }} stroke="var(--color-muted)" />
            <YAxis allowDecimals={false} tick={{ fontSize: 11 }} stroke="var(--color-muted)" />
            <Tooltip
              contentStyle={{
                background: "var(--color-card)",
                border: "1px solid var(--color-border)",
                borderRadius: "8px",
                fontSize: "12px",
              }}
              labelStyle={{ color: "var(--color-foreground)" }}
            />
            <Bar dataKey="codes" radius={[4, 4, 0, 0]}>
              {chartData.map((entry, index) => (
                <Cell key={index} fill={SEVERITY_COLORS[entry.severity] || "#007BC0"} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="flex items-center gap-4 mt-3 text-[10px] text-muted">
        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-[#22c55e]" /> Low</span>
        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-[#eab308]" /> Medium</span>
        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-[#f97316]" /> High</span>
        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-[#ef4444]" /> Critical</span>
      </div>
    </div>
  );
}
