import { api } from "./api-client";

export interface Vehicle {
  id: string;
  brand: string;
  model: string;
  year: number;
  engineType: string;
  vin: string | null;
  mileage: number | null;
  color: string | null;
  licensePlate: string | null;
  createdAt: string;
}

export interface CreateVehicleData {
  brand: string;
  model: string;
  year: number;
  engineType: string;
  vin?: string;
  mileage?: number;
  color?: string;
  licensePlate?: string;
}

export interface UpdateVehicleData extends Partial<CreateVehicleData> {}

export interface VinDecodeResult {
  make: string | null;
  model: string | null;
  year: string | null;
  engineType: string | null;
  engineSize: string | null;
  fuelType: string | null;
  bodyType: string | null;
  driveType: string | null;
  transmission: string | null;
}

export interface MakeItem {
  id: number;
  name: string;
}

export interface ModelItem {
  id: number;
  name: string;
}

export const vehiclesApi = {
  list: (params?: { search?: string; sortBy?: string; sortOrder?: string }) => {
    const query = new URLSearchParams();
    if (params?.search) query.set("search", params.search);
    if (params?.sortBy) query.set("sortBy", params.sortBy);
    if (params?.sortOrder) query.set("sortOrder", params.sortOrder);
    const qs = query.toString();
    return api.get<Vehicle[]>(`/vehicles${qs ? `?${qs}` : ""}`);
  },

  get: (id: string) => api.get<Vehicle>(`/vehicles/${id}`),

  create: (data: CreateVehicleData) => api.post<Vehicle>("/vehicles", data),

  update: (id: string, data: UpdateVehicleData) =>
    api.patch<Vehicle>(`/vehicles/${id}`, data),

  delete: (id: string) => api.del(`/vehicles/${id}`),

  // NHTSA Lookup
  decodeVin: (vin: string) =>
    api.get<VinDecodeResult>(`/vehicles/lookup/vin/${vin}`),

  getMakes: (search?: string) => {
    const qs = search ? `?search=${encodeURIComponent(search)}` : "";
    return api.get<MakeItem[]>(`/vehicles/lookup/makes${qs}`);
  },

  getModels: (make: string) =>
    api.get<ModelItem[]>(`/vehicles/lookup/models/${encodeURIComponent(make)}`),
};
