import { describe, it, expect } from "vitest";
import { construirCsvIngresosPorDia } from "./exportCsv";

describe("construirCsvIngresosPorDia", () => {
  it("genera un CSV con encabezado y una fila por punto", () => {
    const csv = construirCsvIngresosPorDia([
      { fecha: "2026-07-10", total: 20 },
      { fecha: "2026-07-13", total: 150.5 },
    ]);
    expect(csv).toBe("Fecha,Ingresos\n2026-07-10,20.00\n2026-07-13,150.50");
  });

  it("sin puntos devuelve solo el encabezado", () => {
    expect(construirCsvIngresosPorDia([])).toBe("Fecha,Ingresos");
  });
});
