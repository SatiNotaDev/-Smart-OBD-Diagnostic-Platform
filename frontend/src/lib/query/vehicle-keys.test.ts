import { describe, it, expect } from "vitest";
import { vehicleKeys } from "./vehicle-keys";

describe("vehicleKeys", () => {
  it("all returns base key", () => {
    expect(vehicleKeys.all).toEqual(["vehicles"]);
  });

  it("lists extends all", () => {
    expect(vehicleKeys.lists()).toEqual(["vehicles", "list"]);
  });

  it("list includes params", () => {
    const key = vehicleKeys.list({ search: "toyota", sortBy: "brand" });
    expect(key).toEqual(["vehicles", "list", { search: "toyota", sortBy: "brand" }]);
  });

  it("detail includes id", () => {
    expect(vehicleKeys.detail("v1")).toEqual(["vehicles", "detail", "v1"]);
  });

  it("different params produce different keys", () => {
    const k1 = vehicleKeys.list({ search: "a" });
    const k2 = vehicleKeys.list({ search: "b" });
    expect(k1).not.toEqual(k2);
  });
});
