import { describe, it, expect } from "vitest";
import {
  filtrarPorRango,
  calcularKpis,
  agruparIngresosPorDia,
  calcularTopProductos,
  calcularVentasPorVendedor,
  calcularVentasRecientes,
  calcularInsightTopProducto,
  formatearTiempoRelativo,
  construirDashboardData,
} from "./aggregate";
import type { Venta } from "./aggregate";

function crearVenta(overrides: Partial<Venta> & { fechaVenta: string; total: string }): Venta {
  return {
    idVenta: overrides.idVenta ?? "v1",
    fechaVenta: overrides.fechaVenta,
    total: overrides.total,
    cliente: overrides.cliente ?? { idCliente: "c1", nombreCompleto: "Cliente 1" },
    vendedor: overrides.vendedor ?? { idVendedor: "vd1", nombreCompleto: "Vendedor 1" },
    detalles: overrides.detalles ?? [],
  };
}

const AHORA = new Date("2026-07-14T12:00:00Z");

describe("filtrarPorRango", () => {
  it('"todo" no filtra nada', () => {
    const ventas = [crearVenta({ fechaVenta: "2020-01-01T00:00:00Z", total: "10" })];
    expect(filtrarPorRango(ventas, "todo", AHORA)).toHaveLength(1);
  });

  it("excluye ventas fuera de la ventana de 7 días", () => {
    const ventas = [
      crearVenta({ idVenta: "reciente", fechaVenta: "2026-07-13T00:00:00Z", total: "10" }),
      crearVenta({ idVenta: "vieja", fechaVenta: "2026-06-01T00:00:00Z", total: "10" }),
    ];
    const resultado = filtrarPorRango(ventas, "7d", AHORA);
    expect(resultado.map((v) => v.idVenta)).toEqual(["reciente"]);
  });
});

describe("calcularKpis", () => {
  it("calcula ingresos totales, cantidad y ticket promedio", () => {
    const ventas = [
      crearVenta({
        idVenta: "v1",
        fechaVenta: "2026-07-13T00:00:00Z",
        total: "100",
        detalles: [{ cantidad: 2, subtotal: "100", producto: { idProducto: "p1", nombreProducto: "P1" } }],
      }),
      crearVenta({
        idVenta: "v2",
        fechaVenta: "2026-07-13T00:00:00Z",
        total: "50",
        detalles: [{ cantidad: 1, subtotal: "50", producto: { idProducto: "p1", nombreProducto: "P1" } }],
      }),
    ];
    const kpis = calcularKpis(ventas, null);
    expect(kpis.ingresosTotales).toBe(150);
    expect(kpis.cantidadVentas).toBe(2);
    expect(kpis.ticketPromedio).toBe(75);
    expect(kpis.unidadesVendidas).toBe(3);
    expect(kpis.deltaIngresos).toBeNull();
  });

  it("calcula el delta porcentual vs. el período anterior", () => {
    const actuales = [crearVenta({ fechaVenta: "2026-07-13T00:00:00Z", total: "150" })];
    const anteriores = [crearVenta({ fechaVenta: "2026-06-13T00:00:00Z", total: "100" })];
    const kpis = calcularKpis(actuales, anteriores);
    expect(kpis.deltaIngresos).toBe(50);
  });
});

describe("agruparIngresosPorDia", () => {
  it("agrupa varias ventas del mismo día en un solo punto, ordenado ascendente", () => {
    const ventas = [
      crearVenta({ idVenta: "v1", fechaVenta: "2026-07-13T09:00:00", total: "100" }),
      crearVenta({ idVenta: "v2", fechaVenta: "2026-07-13T18:00:00", total: "50" }),
      crearVenta({ idVenta: "v3", fechaVenta: "2026-07-10T09:00:00", total: "20" }),
    ];
    const puntos = agruparIngresosPorDia(ventas);
    expect(puntos).toEqual([
      { fecha: "2026-07-10", total: 20 },
      { fecha: "2026-07-13", total: 150 },
    ]);
  });
});

describe("calcularTopProductos", () => {
  it("suma cantidad e ingresos por producto y ordena por ingresos desc", () => {
    const ventas = [
      crearVenta({
        idVenta: "v1",
        fechaVenta: "2026-07-13T00:00:00Z",
        total: "300",
        detalles: [
          { cantidad: 1, subtotal: "100", producto: { idProducto: "p1", nombreProducto: "Poco vendido" } },
          { cantidad: 2, subtotal: "200", producto: { idProducto: "p2", nombreProducto: "Más vendido" } },
        ],
      }),
      crearVenta({
        idVenta: "v2",
        fechaVenta: "2026-07-13T00:00:00Z",
        total: "200",
        detalles: [{ cantidad: 3, subtotal: "200", producto: { idProducto: "p2", nombreProducto: "Más vendido" } }],
      }),
    ];
    const top = calcularTopProductos(ventas);
    expect(top[0]).toMatchObject({ idProducto: "p2", cantidad: 5, ingresos: 400 });
    expect(top[1]).toMatchObject({ idProducto: "p1", cantidad: 1, ingresos: 100 });
  });
});

describe("calcularVentasPorVendedor", () => {
  it("suma total y cantidad de ventas por vendedor, ordenado desc", () => {
    const ventas = [
      crearVenta({
        idVenta: "v1",
        fechaVenta: "2026-07-13T00:00:00Z",
        total: "100",
        vendedor: { idVendedor: "vd1", nombreCompleto: "Ana" },
      }),
      crearVenta({
        idVenta: "v2",
        fechaVenta: "2026-07-13T00:00:00Z",
        total: "300",
        vendedor: { idVendedor: "vd2", nombreCompleto: "Luis" },
      }),
      crearVenta({
        idVenta: "v3",
        fechaVenta: "2026-07-13T00:00:00Z",
        total: "50",
        vendedor: { idVendedor: "vd1", nombreCompleto: "Ana" },
      }),
    ];
    const resultado = calcularVentasPorVendedor(ventas);
    expect(resultado[0]).toMatchObject({ idVendedor: "vd2", total: 300, cantidadVentas: 1 });
    expect(resultado[1]).toMatchObject({ idVendedor: "vd1", total: 150, cantidadVentas: 2 });
  });
});

describe("calcularVentasRecientes", () => {
  it("ordena por fecha descendente y respeta el límite", () => {
    const ventas = [
      crearVenta({ idVenta: "vieja", fechaVenta: "2026-07-01T00:00:00Z", total: "10" }),
      crearVenta({ idVenta: "reciente", fechaVenta: "2026-07-13T00:00:00Z", total: "20" }),
      crearVenta({ idVenta: "media", fechaVenta: "2026-07-10T00:00:00Z", total: "30" }),
    ];
    const resultado = calcularVentasRecientes(ventas, 2);
    expect(resultado.map((v) => v.idVenta)).toEqual(["reciente", "media"]);
    expect(resultado[0]).toMatchObject({ clienteNombre: "Cliente 1", total: 20 });
  });
});

describe("calcularInsightTopProducto", () => {
  it("calcula el porcentaje de ingresos del producto más vendido", () => {
    const top = calcularInsightTopProducto(
      [{ idProducto: "p1", nombre: "Laptop", cantidad: 2, ingresos: 300 }],
      1000
    );
    expect(top).toEqual({ nombre: "Laptop", porcentaje: 30 });
  });

  it("retorna null sin productos o sin ingresos", () => {
    expect(calcularInsightTopProducto([], 1000)).toBeNull();
    expect(
      calcularInsightTopProducto([{ idProducto: "p1", nombre: "Laptop", cantidad: 1, ingresos: 100 }], 0)
    ).toBeNull();
  });
});

describe("formatearTiempoRelativo", () => {
  it.each([
    ["2026-07-14T11:59:30Z", "Hace un momento"],
    ["2026-07-14T11:30:00Z", "Hace 30 min"],
    ["2026-07-14T10:00:00Z", "Hace 2 horas"],
    ["2026-07-13T12:00:00Z", "Ayer"],
    ["2026-07-10T12:00:00Z", "Hace 4 días"],
    ["2026-07-01T12:00:00Z", "Hace 1 semana"],
    ["2026-06-01T12:00:00Z", "Hace 1 mes"],
    ["2025-01-01T12:00:00Z", "Hace 1 año"],
  ])("%s -> %s", (fecha, esperado) => {
    expect(formatearTiempoRelativo(fecha, AHORA)).toBe(esperado);
  });
});

describe("construirDashboardData", () => {
  it('con rango "todo" incluye todas las ventas sin filtrar', () => {
    const ventas = [
      crearVenta({ idVenta: "v1", fechaVenta: "2020-01-01T00:00:00Z", total: "100" }),
      crearVenta({ idVenta: "v2", fechaVenta: "2026-07-13T00:00:00Z", total: "50" }),
    ];
    const dashboard = construirDashboardData(ventas, "todo", AHORA);
    expect(dashboard.ventasEnRango).toHaveLength(2);
    expect(dashboard.kpis.ingresosTotales).toBe(150);
    expect(dashboard.kpis.deltaIngresos).toBeNull();
  });
});
