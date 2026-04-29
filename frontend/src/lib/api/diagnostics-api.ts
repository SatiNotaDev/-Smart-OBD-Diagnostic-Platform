import { api } from "./api-client";

export interface DtcCode {
  id: string;
  code: string;
  description: string;
  severity: number;
}

export interface DiagnosticMetric {
  id: string;
  name: string;
  value: number;
  unit: string;
  timestamp: string;
}

export interface AnalysisResult {
  id: string;
  summary: string;
  confidence: number;
  createdAt: string;
}

export interface DiagnosticSession {
  id: string;
  vehicleId: string;
  status: "PENDING" | "PROCESSING" | "COMPLETED" | "FAILED";
  sourceType: "MANUAL" | "JSON" | "CSV";
  dtcs: DtcCode[];
  metrics?: DiagnosticMetric[];
  result?: AnalysisResult | null;
  createdAt: string;
  _count?: { dtcs: number; metrics: number };
}

export interface CreateSessionData {
  vehicleId: string;
  sourceType?: "MANUAL" | "JSON" | "CSV";
  dtcs: Array<{ code: string; description?: string; severity?: number }>;
  metrics?: Array<{ name: string; value: number; unit?: string }>;
}

export const diagnosticsApi = {
  listByVehicle: (vehicleId: string) =>
    api.get<DiagnosticSession[]>(`/diagnostics/vehicle/${vehicleId}`),

  get: (id: string) => api.get<DiagnosticSession>(`/diagnostics/${id}`),

  create: (data: CreateSessionData) =>
    api.post<DiagnosticSession>("/diagnostics", data),

  delete: (id: string) => api.del(`/diagnostics/${id}`),
};
