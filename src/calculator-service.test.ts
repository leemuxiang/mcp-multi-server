import { describe, it, expect, beforeEach } from "vitest";
import { CalculatorService } from "./calculator-service";

describe("CalculatorService", () => {
  let service: CalculatorService;

  beforeEach(() => {
    service = new CalculatorService();
  });

  it("should add two numbers", () => {
    expect(service.add(2, 3)).toBe(5);
  });

  it("should subtract two numbers", () => {
    expect(service.subtract(5, 2)).toBe(3);
  });

  it("should multiply two numbers", () => {
    expect(service.multiply(4, 3)).toBe(12);
  });

  it("should divide two numbers", () => {
    expect(service.divide(10, 2)).toBe(5);
  });

  it("should throw error on division by zero", () => {
    expect(() => service.divide(10, 0)).toThrow("Division by zero");
  });
});
