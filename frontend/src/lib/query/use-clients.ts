"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  clientsApi,
  type Client,
  type ClientDetail,
  type ClientNote,
  type CreateClientData,
  type UpdateClientData,
} from "@/lib/api/clients-api";
import { clientKeys } from "./client-keys";
import { vehicleKeys } from "./vehicle-keys";

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

export function useLinkVehicle() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ clientId, vehicleId }: { clientId: string; vehicleId: string }) =>
      clientsApi.linkVehicle(clientId, vehicleId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: clientKeys.all });
      qc.invalidateQueries({ queryKey: vehicleKeys.all });
    },
  });
}

export function useUnlinkVehicle() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ clientId, vehicleId }: { clientId: string; vehicleId: string }) =>
      clientsApi.unlinkVehicle(clientId, vehicleId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: clientKeys.all });
      qc.invalidateQueries({ queryKey: vehicleKeys.all });
    },
  });
}

// ─── Notes ──────────────────────────────────────────────────────────────────

export function useClientNotes(clientId: string) {
  return useQuery<ClientNote[]>({
    queryKey: [...clientKeys.detail(clientId), "notes"],
    queryFn: () => clientsApi.getNotes(clientId),
    enabled: !!clientId,
  });
}

export function useCreateClientNote() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ clientId, content }: { clientId: string; content: string }) =>
      clientsApi.createNote(clientId, content),
    onSuccess: (_data, { clientId }) => {
      qc.invalidateQueries({ queryKey: [...clientKeys.detail(clientId), "notes"] });
    },
  });
}

export function useUpdateClientNote() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ clientId, noteId, content }: { clientId: string; noteId: string; content: string }) =>
      clientsApi.updateNote(clientId, noteId, content),
    onSuccess: (_data, { clientId }) => {
      qc.invalidateQueries({ queryKey: [...clientKeys.detail(clientId), "notes"] });
    },
  });
}

export function useDeleteClientNote() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ clientId, noteId }: { clientId: string; noteId: string }) =>
      clientsApi.deleteNote(clientId, noteId),
    onSuccess: (_data, { clientId }) => {
      qc.invalidateQueries({ queryKey: [...clientKeys.detail(clientId), "notes"] });
    },
  });
}
