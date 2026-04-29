"use client";

import Link from "next/link";
import { Car, Gauge, Hash, Trash2 } from "lucide-react";
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
      className="group block rounded-lg border border-border bg-card p-4 hover:bg-accent/50 transition-colors"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-primary/8">
            <Car size={16} className="text-primary" />
          </div>
          <div>
            <h3 className="text-sm font-medium text-foreground">
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
              className="p-1 rounded text-muted hover:text-error transition-colors opacity-0 group-hover:opacity-100"
            >
              <Trash2 size={14} />
            </button>
          )}
        </div>
      </div>

      <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted">
        {vehicle.vin && (
          <span className="flex items-center gap-1">
            <Hash size={12} />
            {vehicle.vin}
          </span>
        )}
        {vehicle.mileage != null && (
          <span className="flex items-center gap-1">
            <Gauge size={12} />
            {vehicle.mileage.toLocaleString()} {t("dashboard.vehicles.km")}
          </span>
        )}
        {vehicle.licensePlate && (
          <span className="font-mono bg-accent px-1.5 py-0.5 rounded text-xs">
            {vehicle.licensePlate}
          </span>
        )}
      </div>
    </Link>
  );
}
