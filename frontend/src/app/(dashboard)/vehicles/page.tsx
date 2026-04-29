"use client";

import { useState } from "react";
import { Plus, Search, Car } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { VehicleCard } from "@/components/vehicles/vehicle-card";
import { AddVehicleDialog } from "@/components/vehicles/add-vehicle-dialog";
import { useVehicles, useDeleteVehicle } from "@/lib/query/use-vehicles";
import { useI18n } from "@/lib/i18n/i18n";
import { PageTransition, StaggerContainer, StaggerItem } from "@/components/ui/page-transition";
import { SkeletonCard } from "@/components/ui/skeleton";

export default function VehiclesPage() {
  const { t } = useI18n();
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("createdAt");
  const [showAdd, setShowAdd] = useState(false);

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
    deleteVehicle.mutate(id);
  };

  return (
    <PageTransition className="space-y-5 max-w-4xl">
      {/* Controls */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div className="flex flex-1 gap-2">
          <div className="flex-1 max-w-xs">
            <Input
              placeholder={t("dashboard.vehicles.searchPlaceholder")}
              icon={<Search size={14} />}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="w-36">
            <Select
              options={sortOptions}
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
            />
          </div>
        </div>
        <Button onClick={() => setShowAdd(true)}>
          <Plus size={14} className="mr-1" />
          {t("dashboard.vehicles.addVehicle")}
        </Button>
      </div>

      {/* List */}
      {isLoading ? (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => <SkeletonCard key={i} />)}
        </div>
      ) : !vehicles || vehicles.length === 0 ? (
        <div className="flex flex-col items-center gap-3 py-16 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/8">
            <Car size={24} className="text-primary" />
          </div>
          <h3 className="text-sm font-medium text-foreground">
            {t("dashboard.vehicles.emptyTitle")}
          </h3>
          <p className="text-xs text-muted max-w-sm">
            {t("dashboard.vehicles.emptyDescription")}
          </p>
          <Button onClick={() => setShowAdd(true)} size="sm">
            <Plus size={14} className="mr-1" />
            {t("dashboard.vehicles.addVehicle")}
          </Button>
        </div>
      ) : (
        <StaggerContainer className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {vehicles.map((v) => (
            <StaggerItem key={v.id}>
              <VehicleCard vehicle={v} onDelete={handleDelete} />
            </StaggerItem>
          ))}
        </StaggerContainer>
      )}

      <AddVehicleDialog
        open={showAdd}
        onClose={() => setShowAdd(false)}
      />
    </PageTransition>
  );
}
