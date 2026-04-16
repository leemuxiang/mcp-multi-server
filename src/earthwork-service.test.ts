import { describe, it, expect, beforeEach } from "vitest";
import { EarthworkService } from "./earthwork-service";

describe("EarthworkService", () => {
  let service: EarthworkService;

  beforeEach(() => {
    service = new EarthworkService();
  });

  it("should calculate volumes", async () => {
    const result = await service.calculateVolumes("P001");
    expect(result.projectId).toBe("P001");
    expect(result.cutVolume).toBeGreaterThan(0);
  });

  it("should calculate topsoil area", async () => {
    const result = await service.calculateTopsoilArea("P001");
    expect(result.area).toBeGreaterThan(0);
  });

  it("should get soil layers", async () => {
    const result = await service.getSoilLayers("L001");
    expect(Array.isArray(result)).toBe(true);
    expect(result.length).toBeGreaterThan(0);
  });

  it("should calculate replacement", async () => {
    const result = await service.calculateReplacement(100, 2);
    expect(result.replacementVolume).toBe(200);
  });
});
