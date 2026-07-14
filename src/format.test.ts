import { describe, it, expect } from "vitest";
import { formatearMoneda } from "./format";

describe("formatearMoneda", () => {
  it("agrega separador de miles y dos decimales al estilo es-BO", () => {
    expect(formatearMoneda("4500")).toBe("Bs 4.500,00");
    expect(formatearMoneda(4500)).toBe("Bs 4.500,00");
  });

  it("respeta valores sin miles", () => {
    expect(formatearMoneda("95.5")).toBe("Bs 95,50");
  });

  it("acepta strings tal como llegan del Decimal del backend", () => {
    expect(formatearMoneda("1250000.99")).toBe("Bs 1.250.000,99");
  });
});
