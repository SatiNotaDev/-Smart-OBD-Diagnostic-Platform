"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  Car,
  Pencil,
  Trash2,
  Hash,
  Gauge,
  Calendar,
  Fuel,
  Palette,
  CreditCard,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useVehicle, useDeleteVehicle } from "@/lib/query/use-vehicles";
import { EditVehicleDialog } from "@/components/vehicles/edit-vehicle-dialog";
import { NotesSection } from "@/components/vehicles/notes-section";
import { DiagnosticsSection } from "@/components/vehicles/diagnostics-section";
import { AiChatSection } from "@/components/vehicles/ai-chat-section";
import { useI18n } from "@/lib/i18n/i18n";

const engineVariant: Record<string, "default" | "success" | "warning" | "error"> = {
  petrol: "default",
  diesel: "warning",
  hybrid: "success",
  electric: "success",
};

export default function VehicleDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { t } = useI18n();
  const { data: vehicle, isLoading } = useVehicle(id);
  const deleteVehicle = useDeleteVehicle();
  const [showEdit, setShowEdit] = useState(false);

  const handleDelete = () => {
    if (!confirm(t("dashboard.vehicles.deleteConfirm"))) return;
    deleteVehicle.mutate(id, {
      onSuccess: () => router.push("/vehicles"),
    });
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!vehicle) {
    return (
      <div className="flex flex-col items-center gap-4 py-20 text-center">
        <p className="text-muted">{t("dashboard.vehicles.detail.notFound")}</p>
        <Button variant="outline" onClick={() => router.push("/vehicles")}>
          <ArrowLeft size={16} className="mr-1.5" />
          {t("dashboard.vehicles.detail.backToList")}
        </Button>
      </div>
    );
  }

  const engineLabel =
    t(`dashboard.vehicles.engine${vehicle.engineType.charAt(0).toUpperCase() + vehicle.engineType.slice(1)}`) ||
    vehicle.engineType;

  const infoItems = [
    { icon: Calendar, label: t("dashboard.vehicles.year"), value: String(vehicle.year) },
    { icon: Fuel, label: t("dashboard.vehicles.engineType"), value: engineLabel },
    { icon: Hash, label: t("dashboard.vehicles.vin"), value: vehicle.vin },
    { icon: Gauge, label: t("dashboard.vehicles.mileage"), value: vehicle.mileage != null ? `${vehicle.mileage.toLocaleString()} ${t("dashboard.vehicles.km")}` : null },
    { icon: Palette, label: t("dashboard.vehicles.color"), value: vehicle.color },
    { icon: CreditCard, label: t("dashboard.vehicles.licensePlate"), value: vehicle.licensePlate },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Button variant="outline" onClick={() => router.push("/vehicles")} className="h-9 w-9 p-0">
          <ArrowLeft size={18} />
        </Button>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h2 className="text-2xl font-bold text-foreground">
              {vehicle.brand} {vehicle.model}
            </h2>
            <Badge variant={engineVariant[vehicle.engineType] || "default"}>
              {engineLabel}
            </Badge>
          </div>
          <p className="text-sm text-muted mt-0.5">
            {t("dashboard.vehicles.detail.addedOn")} {new Date(vehicle.createdAt).toLocaleDateString()}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setShowEdit(true)}>
            <Pencil size={15} className="mr-1.5" />
            {t("dashboard.vehicles.detail.edit")}
          </Button>
          <Button
            variant="outline"
            onClick={handleDelete}
            className="text-error hover:bg-error/10 hover:border-error"
          >
            <Trash2 size={15} className="mr-1.5" />
            {t("dashboard.vehicles.detail.delete")}
          </Button>
        </div>
      </div>

      {/* Info card */}
      <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
        <div className="flex items-center gap-3 mb-6">
          <div className="flex h-12 w-12 items-center justify-center rounded-[var(--radius)] bg-primary/10">
            <Car size={24} className="text-primary" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-foreground">
              {t("dashboard.vehicles.detail.specifications")}
            </h3>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {infoItems.map(({ icon: Icon, label, value }) =>
            value ? (
              <div key={label} className="flex items-start gap-3 p-3 rounded-[var(--radius)] bg-accent/50">
                <Icon size={18} className="text-muted mt-0.5 shrink-0" />
                <div>
                  <p className="text-xs text-muted">{label}</p>
                  <p className="text-sm font-medium text-foreground mt-0.5">{value}</p>
                </div>
              </div>
            ) : null,
          )}
        </div>
      </div>

      {/* Diagnostics */}
      <DiagnosticsSection vehicleId={id} />

      {/* Notes */}
      <NotesSection vehicleId={id} />

      {/* AI Chat */}
      <AiChatSection vehicleId={id} />

      {/* Edit dialog */}
      {showEdit && (
        <EditVehicleDialog
          vehicle={vehicle}
          open={showEdit}
          onClose={() => setShowEdit(false)}
        />
      )}
    </div>
  );
}
