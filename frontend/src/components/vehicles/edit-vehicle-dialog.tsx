"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Dialog } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/lib/i18n/i18n";
import { useUpdateVehicle } from "@/lib/query/use-vehicles";
import type { Vehicle, UpdateVehicleData } from "@/lib/api/vehicles-api";

const schema = z.object({
  brand: z.string().min(1),
  model: z.string().min(1),
  year: z.string().min(1),
  engineType: z.string().min(1),
  vin: z.string().optional(),
  mileage: z.string().optional(),
  color: z.string().optional(),
  licensePlate: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

interface EditVehicleDialogProps {
  vehicle: Vehicle;
  open: boolean;
  onClose: () => void;
}

export function EditVehicleDialog({ vehicle, open, onClose }: EditVehicleDialogProps) {
  const { t } = useI18n();
  const [error, setError] = useState("");
  const updateVehicle = useUpdateVehicle();

  const { register, handleSubmit, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      brand: vehicle.brand,
      model: vehicle.model,
      year: String(vehicle.year),
      engineType: vehicle.engineType,
      vin: vehicle.vin || "",
      mileage: vehicle.mileage != null ? String(vehicle.mileage) : "",
      color: vehicle.color || "",
      licensePlate: vehicle.licensePlate || "",
    },
  });

  const engineOptions = [
    { value: "petrol", label: t("dashboard.vehicles.enginePetrol") },
    { value: "diesel", label: t("dashboard.vehicles.engineDiesel") },
    { value: "hybrid", label: t("dashboard.vehicles.engineHybrid") },
    { value: "electric", label: t("dashboard.vehicles.engineElectric") },
  ];

  const onSubmit = (values: FormValues) => {
    setError("");
    const data: UpdateVehicleData = {
      brand: values.brand,
      model: values.model,
      year: Number(values.year),
      engineType: values.engineType,
    };
    if (values.vin) data.vin = values.vin;
    else data.vin = undefined;
    if (values.mileage) data.mileage = Number(values.mileage);
    if (values.color) data.color = values.color;
    if (values.licensePlate) data.licensePlate = values.licensePlate;

    updateVehicle.mutate(
      { id: vehicle.id, data },
      {
        onSuccess: () => onClose(),
        onError: (err: any) => setError(err?.message || t("common.error")),
      },
    );
  };

  return (
    <Dialog open={open} onClose={onClose} title={t("dashboard.vehicles.detail.editTitle")}>
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <Input
            label={t("dashboard.vehicles.brand")}
            error={errors.brand?.message}
            {...register("brand")}
          />
          <Input
            label={t("dashboard.vehicles.model")}
            error={errors.model?.message}
            {...register("model")}
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <Input
            label={t("dashboard.vehicles.year")}
            type="number"
            error={errors.year?.message}
            {...register("year")}
          />
          <Select
            label={t("dashboard.vehicles.engineType")}
            options={engineOptions}
            error={errors.engineType?.message}
            {...register("engineType")}
          />
        </div>

        <Input
          label={t("dashboard.vehicles.vin")}
          error={errors.vin?.message}
          {...register("vin")}
        />

        <div className="grid gap-4 sm:grid-cols-3">
          <Input
            label={t("dashboard.vehicles.mileage")}
            type="number"
            error={errors.mileage?.message}
            {...register("mileage")}
          />
          <Input
            label={t("dashboard.vehicles.color")}
            error={errors.color?.message}
            {...register("color")}
          />
          <Input
            label={t("dashboard.vehicles.licensePlate")}
            error={errors.licensePlate?.message}
            {...register("licensePlate")}
          />
        </div>

        {error && (
          <div className="rounded-[var(--radius)] bg-error/10 px-4 py-2.5 text-sm text-error">
            {error}
          </div>
        )}

        <div className="flex justify-end gap-3 pt-2">
          <Button type="button" variant="outline" onClick={onClose}>
            {t("dashboard.vehicles.addDialog.cancel")}
          </Button>
          <Button type="submit" isLoading={updateVehicle.isPending}>
            {t("dashboard.vehicles.detail.save")}
          </Button>
        </div>
      </form>
    </Dialog>
  );
}
