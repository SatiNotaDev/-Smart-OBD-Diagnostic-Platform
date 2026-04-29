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

export interface DashboardStats {
  vehicleCount: number;
  sessionCount: number;
  dtcCount: number;
  recentSessions: Array<{
    id: string;
    createdAt: string;
    vehicle: { brand: string; model: string };
    _count: { dtcs: number };
  }>;
  monthlyDiagnostics: Array<{ month: string; count: number }>;
}

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api";

export const diagnosticsApi = {
  getStats: () => api.get<DashboardStats>("/diagnostics/stats"),

  listByVehicle: (vehicleId: string) =>
    api.get<DiagnosticSession[]>(`/diagnostics/vehicle/${vehicleId}`),

  uploadFile: async (vehicleId: string, file: File): Promise<DiagnosticSession> => {
    const formData = new FormData();
    formData.append("file", file);

    const response = await fetch(`${BASE_URL}/diagnostics/upload/${vehicleId}`, {
      method: "POST",
      credentials: "include",
      body: formData,
    });

    if (!response.ok) {
      const data = await response.json().catch(() => null);
      throw new Error(data?.message || `Upload failed (${response.status})`);
    }

    return response.json();
  },

  get: (id: string) => api.get<DiagnosticSession>(`/diagnostics/${id}`),

  create: (data: CreateSessionData) =>
    api.post<DiagnosticSession>("/diagnostics", data),

  delete: (id: string) => api.del(`/diagnostics/${id}`),

  reanalyze: (id: string) =>
    api.post<DiagnosticSession>(`/diagnostics/${id}/reanalyze`),
};
