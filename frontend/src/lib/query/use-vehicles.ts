"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  vehiclesApi,
  type Vehicle,
  type CreateVehicleData,
  type UpdateVehicleData,
} from "@/lib/api/vehicles-api";
import { vehicleKeys } from "./vehicle-keys";

export function useVehicles(params?: {
  search?: string;
  sortBy?: string;
  sortOrder?: string;
}) {
  return useQuery<Vehicle[]>({
    queryKey: vehicleKeys.list({
      search: params?.search,
      sortBy: params?.sortBy,
      sortOrder: params?.sortOrder,
    }),
    queryFn: () => vehiclesApi.list(params),
  });
}

export function useVehicle(id: string) {
  return useQuery<Vehicle>({
    queryKey: vehicleKeys.detail(id),
    queryFn: () => vehiclesApi.get(id),
    enabled: !!id,
  });
}

export function useCreateVehicle() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateVehicleData) => vehiclesApi.create(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: vehicleKeys.all });
    },
  });
}

export function useUpdateVehicle() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateVehicleData }) =>
      vehiclesApi.update(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: vehicleKeys.all });
    },
  });
}

export function useDeleteVehicle() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => vehiclesApi.delete(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: vehicleKeys.all });
    },
  });
}
