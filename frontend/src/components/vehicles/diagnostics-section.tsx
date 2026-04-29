"use client";

import { useState } from "react";
import {
  Plus,
  Trash2,
  AlertTriangle,
  AlertCircle,
  Info,
  ShieldAlert,
  Activity,
  X,
  Download,
  RefreshCw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useDiagnostics, useCreateDiagnostic, useDeleteDiagnostic, useReanalyzeDiagnostic } from "@/lib/query/use-diagnostics";
import { useI18n } from "@/lib/i18n/i18n";
import { DiagnosticsChart } from "@/components/vehicles/diagnostics-chart";
import type { DiagnosticSession } from "@/lib/api/diagnostics-api";

const severityConfig: Record<number, { icon: typeof Info; variant: "default" | "success" | "warning" | "error"; label: string }> = {
  1: { icon: Info, variant: "default", label: "Info" },
  2: { icon: Info, variant: "success", label: "Low" },
  3: { icon: AlertCircle, variant: "warning", label: "Medium" },
  4: { icon: AlertTriangle, variant: "error", label: "High" },
  5: { icon: ShieldAlert, variant: "error", label: "Critical" },
};

interface DiagnosticsSectionProps {
  vehicleId: string;
}

export function DiagnosticsSection({ vehicleId }: DiagnosticsSectionProps) {
  const { t } = useI18n();
  const { data: sessions, isLoading } = useDiagnostics(vehicleId);
  const createDiag = useCreateDiagnostic(vehicleId);
  const deleteDiag = useDeleteDiagnostic(vehicleId);

  const [showForm, setShowForm] = useState(false);
  const [codes, setCodes] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const lines = codes
      .split(/[\n,;]+/)
      .map((l) => l.trim().toUpperCase())
      .filter((l) => /^[PBCU]\d{4}$/.test(l));

    if (lines.length === 0) {
      setError(t("dashboard.vehicles.diagnostics.invalidCodes"));
      return;
    }

    createDiag.mutate(
      {
        vehicleId,
        sourceType: "MANUAL",
        dtcs: lines.map((code) => ({ code })),
      },
      {
        onSuccess: () => {
          setCodes("");
          setShowForm(false);
        },
      },
    );
  };

  const handleDelete = (id: string) => {
    if (!confirm(t("dashboard.vehicles.diagnostics.deleteConfirm"))) return;
    deleteDiag.mutate(id);
  };

  return (
    <div className="rounded-lg border border-border bg-card p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-foreground">
          {t("dashboard.vehicles.diagnostics.title")}
        </h3>
        <Button onClick={() => setShowForm(true)} className="h-8 text-xs">
          <Plus size={14} className="mr-1" />
          {t("dashboard.vehicles.diagnostics.newSession")}
        </Button>
      </div>

      {/* Input form */}
      {showForm && (
        <form onSubmit={handleSubmit} className="mb-5 p-4 rounded-[var(--radius)] border border-border bg-accent/30">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium text-foreground">
              {t("dashboard.vehicles.diagnostics.enterCodes")}
            </span>
            <button type="button" onClick={() => setShowForm(false)} className="text-muted hover:text-foreground">
              <X size={16} />
            </button>
          </div>
          <textarea
            className="w-full rounded-[var(--radius)] border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted font-mono focus:outline-none focus:ring-2 focus:ring-primary/30 resize-y min-h-[80px]"
            placeholder="P0300, P0420, P0171&#10;P0301&#10;C0035"
            value={codes}
            onChange={(e) => setCodes(e.target.value)}
          />
          <p className="text-[11px] text-muted mt-1">
            {t("dashboard.vehicles.diagnostics.codesHint")}
          </p>
          {error && <p className="text-xs text-error mt-2">{error}</p>}
          <div className="flex justify-end mt-3">
            <Button type="submit" isLoading={createDiag.isPending} className="h-8 text-xs">
              <Activity size={14} className="mr-1" />
              {t("dashboard.vehicles.diagnostics.analyze")}
            </Button>
          </div>
        </form>
      )}

      {/* Chart */}
      {sessions && sessions.length >= 2 && (
        <div className="mb-5">
          <DiagnosticsChart sessions={sessions} />
        </div>
      )}

      {/* Sessions list */}
      {isLoading ? (
        <div className="flex justify-center py-6">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        </div>
      ) : !sessions || sessions.length === 0 ? (
        <p className="text-sm text-muted text-center py-6">
          {t("dashboard.vehicles.diagnostics.empty")}
        </p>
      ) : (
        <div className="flex flex-col gap-4">
          {sessions.map((session) => (
            <SessionCard
              key={session.id}
              session={session}
              vehicleId={vehicleId}
              onDelete={handleDelete}
              t={t}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function SessionCard({
  session,
  vehicleId,
  onDelete,
  t,
}: {
  session: DiagnosticSession;
  vehicleId: string;
  onDelete: (id: string) => void;
  t: (key: string) => string;
}) {
  const [expanded, setExpanded] = useState(false);
  const reanalyze = useReanalyzeDiagnostic(vehicleId);
  const maxSeverity = Math.max(...session.dtcs.map((d) => d.severity), 1);
  const config = severityConfig[maxSeverity] || severityConfig[1];
  const Icon = config.icon;

  return (
    <div className="rounded-[var(--radius)] border border-border p-4">
      <div className="flex items-start gap-3">
        <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-[var(--radius)] ${maxSeverity >= 4 ? 'bg-error/10' : maxSeverity >= 3 ? 'bg-warning/10' : 'bg-primary/10'}`}>
          <Icon size={18} className={maxSeverity >= 4 ? 'text-error' : maxSeverity >= 3 ? 'text-warning' : 'text-primary'} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-foreground">
              {session.dtcs.length} DTC{session.dtcs.length > 1 ? 's' : ''}
            </span>
            <Badge variant={config.variant} className="text-[10px] px-1.5 py-0">
              {config.label}
            </Badge>
            <span className="text-[11px] text-muted ml-auto">
              {new Date(session.createdAt).toLocaleDateString()}
            </span>
          </div>
          {session.result && (
            <p className="text-xs text-muted mt-1 line-clamp-2">
              {session.result.summary}
            </p>
          )}
          <button
            type="button"
            onClick={() => setExpanded(!expanded)}
            className="text-[11px] text-primary hover:underline mt-1"
          >
            {expanded ? t("dashboard.vehicles.diagnostics.collapse") : t("dashboard.vehicles.diagnostics.expand")}
          </button>
        </div>
        <div className="flex gap-1 shrink-0">
          <a
            href={`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api"}/diagnostics/${session.id}/pdf`}
            className="p-1.5 rounded text-muted hover:text-primary hover:bg-primary/10 transition-colors"
            title="Export PDF"
          >
            <Download size={14} />
          </a>
          <button
            type="button"
            onClick={() => onDelete(session.id)}
            className="p-1.5 rounded text-muted hover:text-error hover:bg-error/10 transition-colors"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>

      {/* Expanded DTC list + analysis */}
      {expanded && (
        <div className="mt-3 pt-3 border-t border-border space-y-3">
          <div className="grid gap-2">
            {session.dtcs.map((dtc) => {
              const sev = severityConfig[dtc.severity] || severityConfig[1];
              const DtcIcon = sev.icon;
              return (
                <div key={dtc.id} className="flex items-start gap-2 text-xs">
                  <DtcIcon size={13} className={dtc.severity >= 4 ? 'text-error mt-0.5' : dtc.severity >= 3 ? 'text-warning mt-0.5' : 'text-muted mt-0.5'} />
                  <span className="font-mono font-medium text-foreground w-14 shrink-0">{dtc.code}</span>
                  <span className="text-muted">{dtc.description}</span>
                </div>
              );
            })}
          </div>

          {/* AI Analysis */}
          {session.result && (
            <div className="p-3 rounded-[var(--radius)] bg-accent/50 border border-border">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium text-foreground">
                  {t("dashboard.vehicles.diagnostics.analysis")}
                </span>
                <button
                  type="button"
                  onClick={() => reanalyze.mutate(session.id)}
                  disabled={reanalyze.isPending}
                  className="flex items-center gap-1 text-[10px] text-primary hover:underline disabled:opacity-50"
                >
                  <RefreshCw size={10} className={reanalyze.isPending ? "animate-spin" : ""} />
                  {t("dashboard.vehicles.diagnostics.reanalyze")}
                </button>
              </div>
              <p className="text-xs text-muted whitespace-pre-line leading-relaxed">
                {session.result.summary}
              </p>
              {session.result.confidence > 0 && (
                <div className="mt-2 flex items-center gap-2">
                  <div className="flex-1 h-1.5 rounded-full bg-border overflow-hidden">
                    <div
                      className="h-full rounded-full bg-primary"
                      style={{ width: `${Math.round(session.result.confidence * 100)}%` }}
                    />
                  </div>
                  <span className="text-[10px] text-muted">
                    {Math.round(session.result.confidence * 100)}%
                  </span>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
