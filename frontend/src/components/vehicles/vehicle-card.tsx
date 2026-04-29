"use client";

import Link from "next/link";
import { Car, Gauge, Hash, Trash2, ChevronRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useI18n } from "@/lib/i18n/i18n";
import type { Vehicle } from "@/lib/api/vehicles-api";

const engineVariant: Record<string, "default" | "success" | "warning" | "error"> = {
  petrol: "default",
  diesel: "warning",
  hybrid: "success",
  electric: "success",
};

interface VehicleCardProps {
  vehicle: Vehicle;
  onDelete?: (id: string) => void;
}

export function VehicleCard({ vehicle, onDelete }: VehicleCardProps) {
  const { t } = useI18n();

  const engineLabel =
    t(`dashboard.vehicles.engine${vehicle.engineType.charAt(0).toUpperCase() + vehicle.engineType.slice(1)}`) ||
    vehicle.engineType;

  return (
    <Link
      href={`/vehicles/${vehicle.id}`}
      className="group block rounded-xl border border-border bg-card p-5 hover:border-foreground/20 transition-all duration-200"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-accent">
            <Car size={18} className="text-muted" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-foreground">
              {vehicle.brand} {vehicle.model}
            </h3>
            <p className="text-xs text-muted">{vehicle.year}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant={engineVariant[vehicle.engineType] || "default"}>
            {engineLabel}
          </Badge>
          {onDelete && (
            <button
              type="button"
              onClick={(e) => { e.preventDefault(); onDelete(vehicle.id); }}
              className="p-1.5 rounded-lg text-muted hover:text-error hover:bg-error/10 transition-colors opacity-0 group-hover:opacity-100"
            >
              <Trash2 size={14} />
            </button>
          )}
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between">
        <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted">
          {vehicle.vin && (
            <span className="flex items-center gap-1">
              <Hash size={11} />
              {vehicle.vin}
            </span>
          )}
          {vehicle.mileage != null && (
            <span className="flex items-center gap-1">
              <Gauge size={11} />
              {vehicle.mileage.toLocaleString()} {t("dashboard.vehicles.km")}
            </span>
          )}
          {vehicle.licensePlate && (
            <span className="font-mono bg-accent px-1.5 py-0.5 rounded text-[10px]">
              {vehicle.licensePlate}
            </span>
          )}
        </div>
        <ChevronRight size={14} className="text-muted opacity-0 group-hover:opacity-100 transition-opacity" />
      </div>
    </Link>
  );
}
