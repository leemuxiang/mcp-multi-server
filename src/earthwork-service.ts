/**
 * Earthwork Service (Mocking Remote HTTP Calls)
 * 
 * This service simulates interaction with a remote engineering backend.
 */
export class EarthworkService {
  /**
   * Simulate a remote HTTP call with a delay
   */
  private async mockFetch<T>(data: T): Promise<T> {
    return new Promise((resolve) => {
      setTimeout(() => resolve(data), 500);
    });
  }

  /**
   * 计算挖填方量 (Calculate Cut and Fill Volume)
   */
  async calculateVolumes(projectId: string) {
    return this.mockFetch({
      projectId,
      cutVolume: 15200.5,
      fillVolume: 8400.2,
      unit: "m³",
      timestamp: new Date().toISOString()
    });
  }

  /**
   * 计算表土面积 (Calculate Topsoil Area)
   */
  async calculateTopsoilArea(projectId: string) {
    return this.mockFetch({
      projectId,
      area: 4500.75,
      unit: "m²",
      timestamp: new Date().toISOString()
    });
  }

  /**
   * 计算模型体积 (Calculate Model Volume)
   */
  async calculateModelVolume(modelId: string) {
    return this.mockFetch({
      modelId,
      volume: 125000.0,
      unit: "m³",
      timestamp: new Date().toISOString()
    });
  }

  /**
   * 获取土层信息 (Get Soil Layer Info)
   */
  async getSoilLayers(locationId: string) {
    return this.mockFetch([
      { layer: "表土层", depth: "0.5m", type: "有机土" },
      { layer: "粘土层", depth: "2.5m", type: "中等塑性粘土" },
      { layer: "岩石层", depth: ">3.0m", type: "风化岩" }
    ]);
  }

  /**
   * 计算换填 (Calculate Replacement)
   */
  async calculateReplacement(area: number, depth: number) {
    const volume = area * depth;
    return this.mockFetch({
      area,
      depth,
      replacementVolume: volume,
      material: "级配碎石",
      unit: "m³"
    });
  }

  /**
   * 计算总工程量 (Calculate Total Engineering Volume)
   */
  async calculateTotalEngineering(projectId: string) {
    return this.mockFetch({
      projectId,
      totalVolume: 23600.7,
      totalCostEstimate: "¥1,250,000",
      currency: "CNY",
      status: "Finalized"
    });
  }
}
