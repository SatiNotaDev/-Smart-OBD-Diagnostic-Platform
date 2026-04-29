"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  clientsApi,
  type Client,
  type ClientDetail,
  type CreateClientData,
  type UpdateClientData,
} from "@/lib/api/clients-api";
import { clientKeys } from "./client-keys";

export function useClients(params?: { search?: string }) {
  return useQuery<Client[]>({
    queryKey: clientKeys.list({ search: params?.search }),
    queryFn: () => clientsApi.list(params),
  });
}

export function useClient(id: string) {
  return useQuery<ClientDetail>({
    queryKey: clientKeys.detail(id),
    queryFn: () => clientsApi.get(id),
    enabled: !!id,
  });
}

export function useCreateClient() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateClientData) => clientsApi.create(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: clientKeys.all });
    },
  });
}

export function useUpdateClient() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateClientData }) =>
      clientsApi.update(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: clientKeys.all });
    },
  });
}

export function useDeleteClient() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => clientsApi.delete(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: clientKeys.all });
    },
  });
}
