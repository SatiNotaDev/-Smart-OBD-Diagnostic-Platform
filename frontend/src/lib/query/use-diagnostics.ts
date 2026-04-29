"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  diagnosticsApi,
  type DiagnosticSession,
  type CreateSessionData,
} from "@/lib/api/diagnostics-api";

const diagKeys = {
  all: (vehicleId: string) => ["diagnostics", vehicleId] as const,
  detail: (id: string) => ["diagnostic", id] as const,
};

export function useDiagnostics(vehicleId: string) {
  return useQuery<DiagnosticSession[]>({
    queryKey: diagKeys.all(vehicleId),
    queryFn: () => diagnosticsApi.listByVehicle(vehicleId),
    enabled: !!vehicleId,
  });
}

export function useDiagnosticSession(id: string) {
  return useQuery<DiagnosticSession>({
    queryKey: diagKeys.detail(id),
    queryFn: () => diagnosticsApi.get(id),
    enabled: !!id,
  });
}

export function useCreateDiagnostic(vehicleId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateSessionData) => diagnosticsApi.create(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: diagKeys.all(vehicleId) });
    },
  });
}

export function useDeleteDiagnostic(vehicleId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => diagnosticsApi.delete(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: diagKeys.all(vehicleId) });
    },
  });
}

export function useReanalyzeDiagnostic(vehicleId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => diagnosticsApi.reanalyze(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: diagKeys.all(vehicleId) });
    },
  });
}
