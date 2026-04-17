import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { ReactNode } from "react";
import { useVehicles, useCreateVehicle, useDeleteVehicle } from "./use-vehicles";

vi.mock("@/lib/api/vehicles-api", () => ({
  vehiclesApi: {
    list: vi.fn().mockResolvedValue([
      { id: "v1", brand: "Toyota", model: "Camry", year: 2021, engineType: "petrol" },
      { id: "v2", brand: "Honda", model: "Civic", year: 2022, engineType: "petrol" },
    ]),
    create: vi.fn().mockResolvedValue({
      id: "v3",
      brand: "BMW",
      model: "X5",
      year: 2023,
      engineType: "diesel",
    }),
    delete: vi.fn().mockResolvedValue(undefined),
  },
}));

function createWrapper() {
  const qc = new QueryClient({
    defaultOptions: {
      queries: { retry: false, gcTime: 0 },
      mutations: { retry: false },
    },
  });
  return {
    qc,
    wrapper: ({ children }: { children: ReactNode }) => (
      <QueryClientProvider client={qc}>{children}</QueryClientProvider>
    ),
  };
}

describe("useVehicles", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("fetches vehicle list", async () => {
    const { wrapper } = createWrapper();
    const { result } = renderHook(() => useVehicles(), { wrapper });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toHaveLength(2);
    expect(result.current.data![0].brand).toBe("Toyota");
  });

  it("passes params to API", async () => {
    const { vehiclesApi } = await import("@/lib/api/vehicles-api");
    const { wrapper } = createWrapper();

    renderHook(() => useVehicles({ search: "toy", sortBy: "brand" }), { wrapper });

    await waitFor(() =>
      expect(vehiclesApi.list).toHaveBeenCalledWith({
        search: "toy",
        sortBy: "brand",
      }),
    );
  });
});

describe("useCreateVehicle", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("invalidates vehicles cache on success", async () => {
    const { wrapper, qc } = createWrapper();
    const invalidateSpy = vi.spyOn(qc, "invalidateQueries");

    const { result } = renderHook(() => useCreateVehicle(), { wrapper });

    result.current.mutate({
      brand: "BMW",
      model: "X5",
      year: 2023,
      engineType: "diesel",
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(invalidateSpy).toHaveBeenCalledWith(
      expect.objectContaining({ queryKey: ["vehicles"] }),
    );
  });
});

describe("useDeleteVehicle", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("invalidates vehicles cache on success", async () => {
    const { wrapper, qc } = createWrapper();
    const invalidateSpy = vi.spyOn(qc, "invalidateQueries");

    const { result } = renderHook(() => useDeleteVehicle(), { wrapper });

    result.current.mutate("v1");

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(invalidateSpy).toHaveBeenCalledWith(
      expect.objectContaining({ queryKey: ["vehicles"] }),
    );
  });
});
