"use client";

import { Car, Gauge, Hash } from "lucide-react";
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
}

export function VehicleCard({ vehicle }: VehicleCardProps) {
  const { t } = useI18n();

  const engineLabel =
    t(`dashboard.vehicles.engine${vehicle.engineType.charAt(0).toUpperCase() + vehicle.engineType.slice(1)}`) ||
    vehicle.engineType;

  return (
    <div className="rounded-2xl border border-border bg-card p-5 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[var(--radius)] bg-primary/10">
            <Car size={20} className="text-primary" />
          </div>
          <div>
            <h3 className="font-semibold text-foreground">
              {vehicle.brand} {vehicle.model}
            </h3>
            <p className="text-sm text-muted">{vehicle.year}</p>
          </div>
        </div>
        <Badge variant={engineVariant[vehicle.engineType] || "default"}>
          {engineLabel}
        </Badge>
      </div>

      <div className="mt-4 flex flex-wrap gap-x-5 gap-y-1 text-sm text-muted">
        {vehicle.vin && (
          <span className="flex items-center gap-1.5">
            <Hash size={14} />
            {vehicle.vin}
          </span>
        )}
        {vehicle.mileage != null && (
          <span className="flex items-center gap-1.5">
            <Gauge size={14} />
            {vehicle.mileage.toLocaleString()} {t("dashboard.vehicles.km")}
          </span>
        )}
        {vehicle.licensePlate && (
          <span className="font-mono text-xs bg-accent px-2 py-0.5 rounded">
            {vehicle.licensePlate}
          </span>
        )}
      </div>
    </div>
  );
}
