"use client";

import { useState, useMemo } from "react";
import {
  Bluetooth,
  BluetoothOff,
  Radio,
  Circle,
  Play,
  Square,
  Disc,
  AlertTriangle,
  Trash2,
  Loader2,
  Gauge,
  Thermometer,
  Zap,
  Wind,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useOBD, type OBDHistory } from "@/lib/obd/use-obd";
import { useToast } from "@/components/ui/toast";
import { useCreateDiagnostic } from "@/lib/query/use-diagnostics";
import type { OBDSnapshot } from "@/lib/obd/elm327-bluetooth";

interface LiveOBDSectionProps {
  vehicleId: string;
}

export function LiveOBDSection({ vehicleId }: LiveOBDSectionProps) {
  const {
    status,
    snapshot,
    history,
    error,
    deviceName,
    isRecording,
    isSupported,
    connect,
    disconnect,
    startLive,
    stopLive,
    startRecording,
    stopRecording,
    readDTCs,
    clearDTCs,
  } = useOBD();

  const { success: showSuccess, error: showError } = useToast();
  const createDiag = useCreateDiagnostic(vehicleId);
  const [dtcCodes, setDtcCodes] = useState<string[]>([]);
  const [dtcLoading, setDtcLoading] = useState(false);

  const isConnected = status === "ready";
  const isConnecting = status === "connecting" || status === "initializing";

  const handleConnect = async () => {
    await connect();
  };

  const handleDisconnect = async () => {
    stopLive();
    await disconnect();
  };

  const handleStartLive = () => {
    startLive(300);
  };

  const handleStopLive = () => {
    stopLive();
  };

  const handleStartRecording = () => {
    startRecording();
    showSuccess("Recording started");
  };

  const handleStopAndSave = () => {
    const snapshots = stopRecording();
    if (snapshots.length === 0) {
      showError("No data recorded");
      return;
    }

    // Convert recorded snapshots to diagnostic session
    const metrics = buildMetricsFromSnapshots(snapshots);
    createDiag.mutate(
      {
        vehicleId,
        sourceType: "JSON",
        dtcs: dtcCodes.map((code) => ({ code })),
        metrics,
      },
      {
        onSuccess: () => showSuccess(`Session saved (${snapshots.length} readings)`),
        onError: (err: any) => showError(err?.message || "Failed to save session"),
      },
    );
  };

  const handleReadDTCs = async () => {
    setDtcLoading(true);
    try {
      const codes = await readDTCs();
      setDtcCodes(codes);
      if (codes.length === 0) {
        showSuccess("No DTC codes found");
      }
    } catch {
      showError("Failed to read DTCs");
    } finally {
      setDtcLoading(false);
    }
  };

  const handleClearDTCs = async () => {
    if (!confirm("Clear all DTC codes? This will turn off the check engine light.")) return;
    const ok = await clearDTCs();
    if (ok) {
      setDtcCodes([]);
      showSuccess("DTC codes cleared");
    } else {
      showError("Failed to clear DTCs");
    }
  };

  if (!isSupported) {
    return (
      <div className="rounded-xl border border-border bg-card p-6">
        <div className="flex items-center gap-3 mb-3">
          <BluetoothOff size={18} className="text-muted" />
          <h3 className="text-lg font-semibold text-foreground">Live OBD</h3>
        </div>
        <p className="text-sm text-muted">
          Web Bluetooth is not supported in your browser. Use Chrome, Edge, or Opera on desktop/Android.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-border bg-card p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${
            isConnected ? "bg-emerald-500/10" : "bg-accent"
          }`}>
            {isConnected ? (
              <Radio size={18} className="text-emerald-500" />
            ) : (
              <Bluetooth size={18} className="text-muted" />
            )}
          </div>
          <div>
            <h3 className="text-lg font-semibold text-foreground">Live OBD</h3>
            <div className="flex items-center gap-2 mt-0.5">
              <Circle size={6} className={`fill-current ${
                isConnected ? "text-emerald-500" : status === "error" ? "text-red-500" : "text-muted"
              }`} />
              <span className="text-xs text-muted">
                {isConnected ? `Connected: ${deviceName}` : isConnecting ? "Connecting..." : "Disconnected"}
              </span>
            </div>
          </div>
        </div>

        <div className="flex gap-2">
          {!isConnected ? (
            <Button onClick={handleConnect} disabled={isConnecting} className="h-8 text-xs">
              {isConnecting ? (
                <Loader2 size={14} className="animate-spin mr-1.5" />
              ) : (
                <Bluetooth size={14} className="mr-1.5" />
              )}
              {isConnecting ? "Connecting..." : "Connect OBD"}
            </Button>
          ) : (
            <>
              <Button variant="outline" onClick={handleDisconnect} className="h-8 text-xs">
                <BluetoothOff size={14} className="mr-1.5" />
                Disconnect
              </Button>
            </>
          )}
        </div>
      </div>

      {error && (
        <div className="mb-4 px-3 py-2 rounded-lg bg-red-500/10 border border-red-500/20 text-xs text-red-500">
          {error}
        </div>
      )}

      {/* Live Controls */}
      {isConnected && (
        <div className="flex flex-wrap gap-2 mb-5">
          <Button variant="outline" onClick={handleStartLive} className="h-8 text-xs">
            <Play size={12} className="mr-1.5" /> Start Live
          </Button>
          <Button variant="outline" onClick={handleStopLive} className="h-8 text-xs">
            <Square size={12} className="mr-1.5" /> Stop
          </Button>
          <div className="w-px h-6 self-center bg-border" />
          {!isRecording ? (
            <Button variant="outline" onClick={handleStartRecording} className="h-8 text-xs">
              <Disc size={12} className="mr-1.5 text-red-500" /> Record
            </Button>
          ) : (
            <Button onClick={handleStopAndSave} className="h-8 text-xs bg-red-500 hover:bg-red-600">
              <Square size={12} className="mr-1.5" /> Stop & Save
            </Button>
          )}
          <div className="w-px h-6 self-center bg-border" />
          <Button variant="outline" onClick={handleReadDTCs} disabled={dtcLoading} className="h-8 text-xs">
            {dtcLoading ? <Loader2 size={12} className="animate-spin mr-1.5" /> : <AlertTriangle size={12} className="mr-1.5" />}
            Read DTCs
          </Button>
          {dtcCodes.length > 0 && (
            <Button variant="outline" onClick={handleClearDTCs} className="h-8 text-xs text-red-500">
              <Trash2 size={12} className="mr-1.5" /> Clear DTCs
            </Button>
          )}
        </div>
      )}

      {/* DTC Display */}
      {dtcCodes.length > 0 && (
        <div className="mb-5 p-3 rounded-lg bg-red-500/5 border border-red-500/20">
          <span className="text-xs font-medium text-red-500 uppercase tracking-wider">Active DTCs</span>
          <div className="flex flex-wrap gap-1.5 mt-2">
            {dtcCodes.map((code) => (
              <Badge key={code} variant="error" className="font-mono text-xs">{code}</Badge>
            ))}
          </div>
        </div>
      )}

      {/* Live Gauges */}
      {isConnected && snapshot && (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4 mb-5">
          <GaugeCard
            icon={Gauge}
            label="RPM"
            value={snapshot.rpm}
            unit="rpm"
            max={8000}
            color="text-blue-500"
            bgColor="bg-blue-500"
          />
          <GaugeCard
            icon={Zap}
            label="Speed"
            value={snapshot.speed}
            unit="km/h"
            max={260}
            color="text-emerald-500"
            bgColor="bg-emerald-500"
          />
          <GaugeCard
            icon={Thermometer}
            label="Coolant"
            value={snapshot.coolantTemp}
            unit="°C"
            max={130}
            color="text-amber-500"
            bgColor="bg-amber-500"
            warning={snapshot.coolantTemp !== null && snapshot.coolantTemp > 100}
          />
          <GaugeCard
            icon={Wind}
            label="Throttle"
            value={snapshot.throttle}
            unit="%"
            max={100}
            color="text-violet-500"
            bgColor="bg-violet-500"
          />
        </div>
      )}

      {/* Live Chart */}
      {isConnected && history.timestamps.length > 2 && (
        <div className="space-y-3">
          <LiveChart
            label="RPM"
            data={history.rpm}
            color="#3b82f6"
            max={8000}
          />
          <LiveChart
            label="Speed"
            data={history.speed}
            color="#10b981"
            max={200}
          />
          <LiveChart
            label="Engine Load"
            data={history.engineLoad}
            color="#8b5cf6"
            max={100}
          />
        </div>
      )}

      {/* Recording indicator */}
      {isRecording && (
        <div className="mt-4 flex items-center gap-2 text-xs text-red-500">
          <Circle size={8} className="fill-red-500 animate-pulse" />
          Recording — {snapshot ? "receiving data" : "waiting for data"}
        </div>
      )}
    </div>
  );
}

// ─── Sub-components ──────────────────────────────────────────────────

function GaugeCard({
  icon: Icon,
  label,
  value,
  unit,
  max,
  color,
  bgColor,
  warning,
}: {
  icon: any;
  label: string;
  value: number | null;
  unit: string;
  max: number;
  color: string;
  bgColor: string;
  warning?: boolean;
}) {
  const percent = value !== null ? Math.min((value / max) * 100, 100) : 0;

  return (
    <div className={`rounded-xl border p-4 ${warning ? "border-amber-500/50 bg-amber-500/5" : "border-border bg-accent/30"}`}>
      <div className="flex items-center justify-between mb-2">
        <span className="text-[11px] font-medium text-muted uppercase tracking-wider">{label}</span>
        <Icon size={14} className={color} />
      </div>
      <div className="flex items-end gap-1.5 mb-2">
        <span className="text-2xl font-bold text-foreground leading-none">
          {value !== null ? Math.round(value) : "—"}
        </span>
        <span className="text-[10px] text-muted mb-0.5">{unit}</span>
      </div>
      <div className="h-1.5 rounded-full bg-surface overflow-hidden">
        <div
          className={`h-full rounded-full ${bgColor} transition-all duration-200`}
          style={{ width: `${percent}%`, opacity: value !== null ? 0.8 : 0.2 }}
        />
      </div>
    </div>
  );
}

function LiveChart({
  label,
  data,
  color,
  max,
}: {
  label: string;
  data: number[];
  color: string;
  max: number;
}) {
  const points = useMemo(() => {
    if (data.length < 2) return "";
    const width = 100;
    const height = 40;
    return data
      .map((v, i) => {
        const x = (i / (data.length - 1)) * width;
        const y = height - (Math.min(v, max) / max) * height;
        return `${i === 0 ? "M" : "L"}${x},${y}`;
      })
      .join(" ");
  }, [data, max]);

  const areaPath = useMemo(() => {
    if (data.length < 2) return "";
    return `${points} L100,40 L0,40 Z`;
  }, [points, data.length]);

  const currentValue = data.length > 0 ? data[data.length - 1] : 0;

  return (
    <div className="rounded-lg border border-border bg-accent/20 p-3">
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-[11px] font-medium text-muted">{label}</span>
        <span className="text-xs font-bold text-foreground">{Math.round(currentValue)}</span>
      </div>
      <svg viewBox="0 0 100 40" className="w-full h-12" preserveAspectRatio="none">
        <path d={areaPath} fill={color} opacity="0.1" />
        <path d={points} fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </div>
  );
}

// ─── Helpers ─────────────────────────────────────────────────────────

function buildMetricsFromSnapshots(snapshots: OBDSnapshot[]) {
  if (snapshots.length === 0) return [];

  // Calculate averages and max values
  const metrics: Array<{ name: string; value: number; unit: string }> = [];
  const fields = [
    { key: "rpm" as const, name: "Avg RPM", unit: "rpm" },
    { key: "speed" as const, name: "Max Speed", unit: "km/h" },
    { key: "coolantTemp" as const, name: "Max Coolant Temp", unit: "°C" },
    { key: "throttle" as const, name: "Avg Throttle", unit: "%" },
    { key: "engineLoad" as const, name: "Avg Engine Load", unit: "%" },
  ];

  for (const { key, name, unit } of fields) {
    const values = snapshots.map((s) => s[key]).filter((v): v is number => v !== null);
    if (values.length === 0) continue;

    const value = name.startsWith("Max")
      ? Math.max(...values)
      : Math.round(values.reduce((a, b) => a + b, 0) / values.length);

    metrics.push({ name, value, unit });
  }

  return metrics;
}
