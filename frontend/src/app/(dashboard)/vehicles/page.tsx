"use client";

import { useState } from "react";
import { Plus, Search, Car } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { AddVehicleDialog } from "@/components/vehicles/add-vehicle-dialog";
import { DraggableVehicleGrid } from "@/components/vehicles/draggable-vehicle-grid";
import { useVehicles, useDeleteVehicle } from "@/lib/query/use-vehicles";
import { useI18n } from "@/lib/i18n/i18n";
import { useToast } from "@/components/ui/toast";
import { PageTransition } from "@/components/ui/page-transition";
import { SkeletonCard } from "@/components/ui/skeleton";

export default function VehiclesPage() {
  const { t } = useI18n();
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("createdAt");
  const [showAdd, setShowAdd] = useState(false);

  const { success: showSuccess, error: showError } = useToast();

  const { data: vehicles, isLoading } = useVehicles({
    search: search || undefined,
    sortBy,
    sortOrder: sortBy === "year" ? "desc" : "asc",
  });

  const deleteVehicle = useDeleteVehicle();

  const sortOptions = [
    { value: "createdAt", label: t("dashboard.vehicles.sortDate") },
    { value: "brand", label: t("dashboard.vehicles.sortBrand") },
    { value: "year", label: t("dashboard.vehicles.sortYear") },
  ];

  const handleDelete = async (id: string) => {
    if (!confirm(t("dashboard.vehicles.deleteConfirm"))) return;
    deleteVehicle.mutate(id, {
      onSuccess: () => showSuccess(t("dashboard.vehicles.deleted") || "Vehicle deleted"),
      onError: (err: any) => showError(err?.message || "Failed to delete"),
    });
  };

  return (
    <PageTransition className="space-y-6">
      {/* Controls */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div className="flex flex-1 gap-3">
          <div className="flex-1 max-w-xs">
            <Input
              placeholder={t("dashboard.vehicles.searchPlaceholder")}
              icon={<Search size={14} />}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="w-40">
            <Select
              options={sortOptions}
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
            />
          </div>
        </div>
        <Button onClick={() => setShowAdd(true)}>
          <Plus size={14} className="mr-1.5" />
          {t("dashboard.vehicles.addVehicle")}
        </Button>
      </div>

      {/* List */}
      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => <SkeletonCard key={i} />)}
        </div>
      ) : !vehicles || vehicles.length === 0 ? (
        <div className="flex flex-col items-center gap-4 py-20 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-accent">
            <Car size={28} className="text-muted" />
          </div>
          <h3 className="text-base font-semibold text-foreground">
            {t("dashboard.vehicles.emptyTitle")}
          </h3>
          <p className="text-sm text-muted max-w-sm">
            {t("dashboard.vehicles.emptyDescription")}
          </p>
          <Button onClick={() => setShowAdd(true)}>
            <Plus size={14} className="mr-1.5" />
            {t("dashboard.vehicles.addVehicle")}
          </Button>
        </div>
      ) : (
        <DraggableVehicleGrid vehicles={vehicles} onDelete={handleDelete} />
      )}

      <AddVehicleDialog open={showAdd} onClose={() => setShowAdd(false)} />
    </PageTransition>
  );
}
