"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Search, Check, Loader2 } from "lucide-react";
import { Dialog } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/lib/i18n/i18n";
import { useCreateVehicle } from "@/lib/query/use-vehicles";
import {
  vehiclesApi,
  type CreateVehicleData,
  type MakeItem,
  type ModelItem,
} from "@/lib/api/vehicles-api";

const currentYear = new Date().getFullYear();

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

interface AddVehicleDialogProps {
  open: boolean;
  onClose: () => void;
}

export function AddVehicleDialog({ open, onClose }: AddVehicleDialogProps) {
  const { t } = useI18n();
  const [error, setError] = useState("");
  const createVehicle = useCreateVehicle();

  // VIN decode
  const [vinLoading, setVinLoading] = useState(false);
  const [vinSuccess, setVinSuccess] = useState(false);

  // Make autocomplete
  const [makes, setMakes] = useState<MakeItem[]>([]);
  const [makesOpen, setMakesOpen] = useState(false);
  const [makesLoading, setMakesLoading] = useState(false);
  const makesRef = useRef<HTMLDivElement>(null);

  // Model autocomplete
  const [models, setModels] = useState<ModelItem[]>([]);
  const [modelsOpen, setModelsOpen] = useState(false);
  const [modelsLoading, setModelsLoading] = useState(false);
  const modelsRef = useRef<HTMLDivElement>(null);

  const { register, handleSubmit, reset, setValue, watch, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { engineType: "petrol" },
  });

  const brandValue = watch("brand");
  const modelValue = watch("model");
  const vinValue = watch("vin");

  const engineOptions = [
    { value: "petrol", label: t("dashboard.vehicles.enginePetrol") },
    { value: "diesel", label: t("dashboard.vehicles.engineDiesel") },
    { value: "hybrid", label: t("dashboard.vehicles.engineHybrid") },
    { value: "electric", label: t("dashboard.vehicles.engineElectric") },
  ];

  // Close dropdowns on outside click
  useEffect(() => {
    function handler(e: MouseEvent) {
      if (makesRef.current && !makesRef.current.contains(e.target as Node)) setMakesOpen(false);
      if (modelsRef.current && !modelsRef.current.contains(e.target as Node)) setModelsOpen(false);
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Fetch makes on brand input
  const fetchMakes = useCallback(async (search: string) => {
    if (search.length < 2) { setMakes([]); return; }
    setMakesLoading(true);
    try {
      const data = await vehiclesApi.getMakes(search);
      setMakes(data.slice(0, 20));
      setMakesOpen(true);
    } catch {
      setMakes([]);
    } finally {
      setMakesLoading(false);
    }
  }, []);

  // Debounce make search
  const makeTimerRef = useRef<ReturnType<typeof setTimeout>>(undefined);
  useEffect(() => {
    clearTimeout(makeTimerRef.current);
    if (brandValue && brandValue.length >= 2) {
      makeTimerRef.current = setTimeout(() => fetchMakes(brandValue), 300);
    } else {
      setMakes([]);
      setMakesOpen(false);
    }
  }, [brandValue, fetchMakes]);

  // Fetch models when brand is selected
  const fetchModels = useCallback(async (make: string) => {
    setModelsLoading(true);
    try {
      const data = await vehiclesApi.getModels(make);
      setModels(data.slice(0, 50));
    } catch {
      setModels([]);
    } finally {
      setModelsLoading(false);
    }
  }, []);

  const handleSelectMake = (name: string) => {
    setValue("brand", name);
    setMakesOpen(false);
    setValue("model", "");
    fetchModels(name);
  };

  const handleModelFocus = () => {
    if (models.length > 0) setModelsOpen(true);
  };

  const handleSelectModel = (name: string) => {
    setValue("model", name);
    setModelsOpen(false);
  };

  const filteredModels = modelValue
    ? models.filter((m) => m.name.toLowerCase().includes(modelValue.toLowerCase()))
    : models;

  // VIN decode
  const handleVinDecode = async () => {
    const vin = vinValue?.trim();
    if (!vin || vin.length < 11) return;
    setVinLoading(true);
    setVinSuccess(false);
    try {
      const data = await vehiclesApi.decodeVin(vin);
      if (data.make) setValue("brand", data.make);
      if (data.model) setValue("model", data.model);
      if (data.year) setValue("year", data.year);
      if (data.fuelType) {
        const fuel = data.fuelType.toLowerCase();
        if (fuel.includes("diesel")) setValue("engineType", "diesel");
        else if (fuel.includes("electric")) setValue("engineType", "electric");
        else if (fuel.includes("hybrid")) setValue("engineType", "hybrid");
        else setValue("engineType", "petrol");
      }
      setVinSuccess(true);
      if (data.make) fetchModels(data.make);
      setTimeout(() => setVinSuccess(false), 3000);
    } catch {
      setError(t("dashboard.vehicles.vinError"));
    } finally {
      setVinLoading(false);
    }
  };

  const onSubmit = async (values: FormValues) => {
    setError("");
    const data: CreateVehicleData = {
      brand: values.brand,
      model: values.model,
      year: Number(values.year),
      engineType: values.engineType,
    };
    if (values.vin) data.vin = values.vin;
    if (values.mileage) data.mileage = Number(values.mileage);
    if (values.color) data.color = values.color;
    if (values.licensePlate) data.licensePlate = values.licensePlate;

    createVehicle.mutate(data, {
      onSuccess: () => {
        reset();
        setMakes([]);
        setModels([]);
        onClose();
      },
      onError: (err: any) => {
        setError(err?.message || t("common.error"));
      },
    });
  };

  return (
    <Dialog open={open} onClose={onClose} title={t("dashboard.vehicles.addDialog.title")}>
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
        {/* VIN with decode button */}
        <div className="flex gap-2 items-end">
          <div className="flex-1">
            <Input
              label={t("dashboard.vehicles.vin")}
              placeholder="JTDKN3DU5A0..."
              error={errors.vin?.message}
              {...register("vin")}
            />
          </div>
          <Button
            type="button"
            variant="outline"
            onClick={handleVinDecode}
            disabled={vinLoading || !vinValue || vinValue.length < 11}
            className="h-11 shrink-0"
          >
            {vinLoading ? (
              <Loader2 size={16} className="animate-spin mr-1.5" />
            ) : vinSuccess ? (
              <Check size={16} className="text-success mr-1.5" />
            ) : (
              <Search size={16} className="mr-1.5" />
            )}
            {vinLoading ? t("dashboard.vehicles.vinDecoding") : t("dashboard.vehicles.vinDecode")}
          </Button>
        </div>

        {vinSuccess && (
          <p className="text-xs text-success -mt-2">{t("dashboard.vehicles.vinDecoded")}</p>
        )}

        {/* Brand with autocomplete */}
        <div className="grid gap-4 sm:grid-cols-2">
          <div ref={makesRef} className="relative">
            <Input
              label={t("dashboard.vehicles.brand")}
              placeholder={t("dashboard.vehicles.searchMake")}
              autoComplete="off"
              error={errors.brand?.message}
              {...register("brand")}
              onFocus={() => makes.length > 0 && setMakesOpen(true)}
            />
            {makesLoading && (
              <div className="absolute right-3 top-9">
                <Loader2 size={14} className="animate-spin text-muted" />
              </div>
            )}
            {makesOpen && makes.length > 0 && (
              <div className="absolute z-50 top-full mt-1 w-full max-h-48 overflow-y-auto rounded-[var(--radius)] border border-border bg-card shadow-lg">
                {makes.map((m) => (
                  <button
                    key={m.id}
                    type="button"
                    className="flex w-full px-3 py-2 text-sm text-foreground hover:bg-accent transition-colors cursor-pointer text-left"
                    onClick={() => handleSelectMake(m.name)}
                  >
                    {m.name}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Model with autocomplete */}
          <div ref={modelsRef} className="relative">
            <Input
              label={t("dashboard.vehicles.model")}
              placeholder={models.length > 0 ? t("dashboard.vehicles.searchMake") : "Camry"}
              autoComplete="off"
              error={errors.model?.message}
              {...register("model")}
              onFocus={handleModelFocus}
              onChange={(e) => {
                register("model").onChange(e);
                if (models.length > 0) setModelsOpen(true);
              }}
            />
            {modelsLoading && (
              <div className="absolute right-3 top-9">
                <Loader2 size={14} className="animate-spin text-muted" />
              </div>
            )}
            {modelsOpen && filteredModels.length > 0 && (
              <div className="absolute z-50 top-full mt-1 w-full max-h-48 overflow-y-auto rounded-[var(--radius)] border border-border bg-card shadow-lg">
                {filteredModels.map((m) => (
                  <button
                    key={m.id}
                    type="button"
                    className="flex w-full px-3 py-2 text-sm text-foreground hover:bg-accent transition-colors cursor-pointer text-left"
                    onClick={() => handleSelectModel(m.name)}
                  >
                    {m.name}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <Input
            label={t("dashboard.vehicles.year")}
            type="number"
            placeholder={String(currentYear)}
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

        <div className="grid gap-4 sm:grid-cols-3">
          <Input
            label={t("dashboard.vehicles.mileage")}
            type="number"
            placeholder="50000"
            error={errors.mileage?.message}
            {...register("mileage")}
          />
          <Input
            label={t("dashboard.vehicles.color")}
            placeholder="Silver"
            error={errors.color?.message}
            {...register("color")}
          />
          <Input
            label={t("dashboard.vehicles.licensePlate")}
            placeholder="A123BC"
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
          <Button type="submit" isLoading={createVehicle.isPending}>
            {t("dashboard.vehicles.addDialog.submit")}
          </Button>
        </div>
      </form>
    </Dialog>
  );
}
