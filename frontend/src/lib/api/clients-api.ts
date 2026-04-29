import { api } from "./api-client";

export interface ClientVehicle {
  id: string;
  brand: string;
  model: string;
  year: number;
  licensePlate: string | null;
}

export interface ClientDiagnostic {
  id: string;
  status: string;
  sourceType: string;
  createdAt: string;
}

export interface ClientVehicleWithDiagnostics extends ClientVehicle {
  diagnostics: ClientDiagnostic[];
}

export interface Client {
  id: string;
  name: string;
  phone: string | null;
  email: string | null;
  notes: string | null;
  vehicles: ClientVehicle[];
  createdAt: string;
  updatedAt: string;
}

export interface ClientDetail {
  id: string;
  name: string;
  phone: string | null;
  email: string | null;
  notes: string | null;
  vehicles: ClientVehicleWithDiagnostics[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateClientData {
  name: string;
  phone?: string;
  email?: string;
  notes?: string;
}

export interface UpdateClientData extends Partial<CreateClientData> {}

export const clientsApi = {
  list: (params?: { search?: string }) => {
    const query = new URLSearchParams();
    if (params?.search) query.set("search", params.search);
    const qs = query.toString();
    return api.get<Client[]>(`/clients${qs ? `?${qs}` : ""}`);
  },

  get: (id: string) => api.get<ClientDetail>(`/clients/${id}`),

  create: (data: CreateClientData) => api.post<Client>("/clients", data),

  update: (id: string, data: UpdateClientData) =>
    api.patch<Client>(`/clients/${id}`, data),

  delete: (id: string) => api.del(`/clients/${id}`),
};
