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
import { PhotoGallery } from "@/components/vehicles/photo-gallery";
import { useI18n } from "@/lib/i18n/i18n";
import { PageTransition } from "@/components/ui/page-transition";
import { SkeletonCard } from "@/components/ui/skeleton";

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
      <div className="space-y-4 max-w-4xl">
        <SkeletonCard />
        <SkeletonCard />
      </div>
    );
  }

  if (!vehicle) {
    return (
      <div className="flex flex-col items-center gap-3 py-16 text-center">
        <p className="text-sm text-muted">{t("dashboard.vehicles.detail.notFound")}</p>
        <Button variant="outline" onClick={() => router.push("/vehicles")}>
          <ArrowLeft size={14} className="mr-1.5" />
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
    <PageTransition className="space-y-6 max-w-4xl">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => router.push("/vehicles")}
          className="p-1 text-muted hover:text-foreground transition-colors cursor-pointer"
        >
          <ArrowLeft size={18} />
        </button>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-semibold text-foreground">
              {vehicle.brand} {vehicle.model}
            </h2>
            <Badge variant={engineVariant[vehicle.engineType] || "default"}>
              {engineLabel}
            </Badge>
          </div>
          <p className="text-xs text-muted mt-0.5">
            {t("dashboard.vehicles.detail.addedOn")} {new Date(vehicle.createdAt).toLocaleDateString()}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => setShowEdit(true)}>
            <Pencil size={13} className="mr-1" />
            {t("dashboard.vehicles.detail.edit")}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleDelete}
            className="text-error hover:bg-error/5 hover:border-error/30"
          >
            <Trash2 size={13} className="mr-1" />
            {t("dashboard.vehicles.detail.delete")}
          </Button>
        </div>
      </div>

      {/* Info card */}
      <div className="rounded-lg border border-border bg-card p-5">
        <div className="flex items-center gap-2.5 mb-5">
          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary/8">
            <Car size={16} className="text-primary" />
          </div>
          <h3 className="text-sm font-medium text-foreground">
            {t("dashboard.vehicles.detail.specifications")}
          </h3>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {infoItems.map(({ icon: Icon, label, value }) =>
            value ? (
              <div key={label} className="flex items-start gap-2.5 p-3 rounded-md bg-surface">
                <Icon size={15} className="text-muted mt-0.5 shrink-0" />
                <div>
                  <p className="text-xs text-muted">{label}</p>
                  <p className="text-sm font-medium text-foreground mt-0.5">{value}</p>
                </div>
              </div>
            ) : null,
          )}
        </div>
      </div>

      <PhotoGallery vehicleId={id} photos={vehicle.photos || []} />
      <DiagnosticsSection vehicleId={id} />
      <NotesSection vehicleId={id} />
      <AiChatSection vehicleId={id} />

      {showEdit && (
        <EditVehicleDialog
          vehicle={vehicle}
          open={showEdit}
          onClose={() => setShowEdit(false)}
        />
      )}
    </PageTransition>
  );
}
