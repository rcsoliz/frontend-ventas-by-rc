import type { VentasQuery } from "../../graphql/generated/graphql";

export type Venta = VentasQuery["ventas"][number];

export type RangoFecha = "7d" | "30d" | "90d" | "todo";

export const RANGOS: { value: RangoFecha; label: string }[] = [
  { value: "7d", label: "Últimos 7 días" },
  { value: "30d", label: "Últimos 30 días" },
  { value: "90d", label: "Últimos 90 días" },
  { value: "todo", label: "Todo" },
];

const DIAS_POR_RANGO: Record<Exclude<RangoFecha, "todo">, number> = {
  "7d": 7,
  "30d": 30,
  "90d": 90,
};

export interface PuntoIngreso {
  fecha: string;
  total: number;
}

export interface ProductoTop {
  idProducto: string;
  nombre: string;
  cantidad: number;
  ingresos: number;
}

export interface VendedorVentas {
  idVendedor: string;
  nombre: string;
  total: number;
  cantidadVentas: number;
}

export interface DashboardKpis {
  ingresosTotales: number;
  cantidadVentas: number;
  ticketPromedio: number;
  unidadesVendidas: number;
  deltaIngresos: number | null;
}

/** Fila de la sección "Ventas Recientes" del panel — datos reales, sin campos inventados (no hay número de factura en el schema). */
export interface VentaReciente {
  idVenta: string;
  clienteNombre: string;
  fechaVenta: string;
  total: number;
}

/** Insight calculado a partir del producto más vendido — reemplaza el "Top Categorías" del mockup, que no tiene sustento en el schema (no existe categoría de producto). */
export interface InsightTopProducto {
  nombre: string;
  porcentaje: number;
}

export interface DashboardData {
  ventasEnRango: Venta[];
  kpis: DashboardKpis;
  ingresosPorDia: PuntoIngreso[];
  topProductos: ProductoTop[];
  ventasPorVendedor: VendedorVentas[];
  ventasRecientes: VentaReciente[];
  insightTopProducto: InsightTopProducto | null;
}

function fechaVentaAMs(venta: Venta): number {
  return venta.fechaVenta ? new Date(String(venta.fechaVenta)).getTime() : 0;
}

/** Filtra `ventas` a las que caen dentro de la ventana [inicio, fin). `fin` es exclusivo. */
function filtrarPorVentana(ventas: Venta[], inicio: number, fin: number): Venta[] {
  return ventas.filter((v) => {
    const ms = fechaVentaAMs(v);
    return ms >= inicio && ms < fin;
  });
}

/** Ventas dentro del rango seleccionado (relativo a `ahora`). "todo" no filtra nada. */
export function filtrarPorRango(ventas: Venta[], rango: RangoFecha, ahora: Date = new Date()): Venta[] {
  if (rango === "todo") return ventas;
  const dias = DIAS_POR_RANGO[rango];
  const inicio = ahora.getTime() - dias * 24 * 60 * 60 * 1000;
  return filtrarPorVentana(ventas, inicio, ahora.getTime() + 1);
}

/**
 * Ventas del período inmediatamente anterior, de igual duración que el rango
 * seleccionado — usado para el delta de ingresos. `null` para "todo": no hay
 * un "período anterior" con sentido cuando no hay ventana definida.
 */
function ventasPeriodoAnterior(ventas: Venta[], rango: RangoFecha, ahora: Date): Venta[] | null {
  if (rango === "todo") return null;
  const dias = DIAS_POR_RANGO[rango];
  const finActual = ahora.getTime();
  const inicioActual = finActual - dias * 24 * 60 * 60 * 1000;
  const inicioAnterior = inicioActual - dias * 24 * 60 * 60 * 1000;
  return filtrarPorVentana(ventas, inicioAnterior, inicioActual);
}

export function calcularKpis(ventasEnRango: Venta[], ventasAnteriores: Venta[] | null): DashboardKpis {
  const ingresosTotales = ventasEnRango.reduce((acc, v) => acc + Number(v.total), 0);
  const cantidadVentas = ventasEnRango.length;
  const ticketPromedio = cantidadVentas > 0 ? ingresosTotales / cantidadVentas : 0;
  const unidadesVendidas = ventasEnRango.reduce(
    (acc, v) => acc + v.detalles.reduce((sub, d) => sub + d.cantidad, 0),
    0
  );

  let deltaIngresos: number | null = null;
  if (ventasAnteriores) {
    const ingresosAnteriores = ventasAnteriores.reduce((acc, v) => acc + Number(v.total), 0);
    if (ingresosAnteriores > 0) {
      deltaIngresos = ((ingresosTotales - ingresosAnteriores) / ingresosAnteriores) * 100;
    } else if (ingresosTotales > 0) {
      deltaIngresos = 100;
    }
  }

  return { ingresosTotales, cantidadVentas, ticketPromedio, unidadesVendidas, deltaIngresos };
}

/** Agrupa ingresos por día calendario (hora local), ordenado ascendente por fecha. */
export function agruparIngresosPorDia(ventas: Venta[]): PuntoIngreso[] {
  const porDia = new Map<string, number>();
  for (const v of ventas) {
    if (!v.fechaVenta) continue;
    const fecha = new Date(String(v.fechaVenta));
    const clave = `${fecha.getFullYear()}-${String(fecha.getMonth() + 1).padStart(2, "0")}-${String(
      fecha.getDate()
    ).padStart(2, "0")}`;
    porDia.set(clave, (porDia.get(clave) ?? 0) + Number(v.total));
  }
  return Array.from(porDia.entries())
    .map(([fecha, total]) => ({ fecha, total }))
    .sort((a, b) => a.fecha.localeCompare(b.fecha));
}

export function calcularTopProductos(ventas: Venta[], limite = 5): ProductoTop[] {
  const porProducto = new Map<string, ProductoTop>();
  for (const venta of ventas) {
    for (const detalle of venta.detalles) {
      const id = detalle.producto.idProducto;
      const actual = porProducto.get(id) ?? {
        idProducto: id,
        nombre: detalle.producto.nombreProducto,
        cantidad: 0,
        ingresos: 0,
      };
      actual.cantidad += detalle.cantidad;
      actual.ingresos += Number(detalle.subtotal);
      porProducto.set(id, actual);
    }
  }
  return Array.from(porProducto.values())
    .sort((a, b) => b.ingresos - a.ingresos)
    .slice(0, limite);
}

export function calcularVentasPorVendedor(ventas: Venta[], limite = 8): VendedorVentas[] {
  const porVendedor = new Map<string, VendedorVentas>();
  for (const venta of ventas) {
    const id = venta.vendedor.idVendedor;
    const actual = porVendedor.get(id) ?? {
      idVendedor: id,
      nombre: venta.vendedor.nombreCompleto,
      total: 0,
      cantidadVentas: 0,
    };
    actual.total += Number(venta.total);
    actual.cantidadVentas += 1;
    porVendedor.set(id, actual);
  }
  return Array.from(porVendedor.values())
    .sort((a, b) => b.total - a.total)
    .slice(0, limite);
}

/** Últimas `limite` ventas del período, más recientes primero — para la sección "Ventas Recientes" del panel. */
export function calcularVentasRecientes(ventas: Venta[], limite = 5): VentaReciente[] {
  return [...ventas]
    .filter((v) => v.fechaVenta)
    .sort((a, b) => fechaVentaAMs(b) - fechaVentaAMs(a))
    .slice(0, limite)
    .map((v) => ({
      idVenta: v.idVenta,
      clienteNombre: v.cliente.nombreCompleto,
      fechaVenta: String(v.fechaVenta),
      total: Number(v.total),
    }));
}

/**
 * Insight real derivado del producto más vendido (reemplaza el "Top Categorías"
 * del mockup, que no existe en el schema). `null` si no hay productos o
 * ingresos en el período — evita mostrar un porcentaje sin sentido (división por cero).
 */
export function calcularInsightTopProducto(
  topProductos: ProductoTop[],
  ingresosTotales: number
): InsightTopProducto | null {
  const top = topProductos[0];
  if (!top || ingresosTotales <= 0) return null;
  return { nombre: top.nombre, porcentaje: (top.ingresos / ingresosTotales) * 100 };
}

const MINUTO_MS = 60_000;
const HORA_MS = 60 * MINUTO_MS;
const DIA_MS = 24 * HORA_MS;

/** Tiempo relativo en español ("Hace 2 horas", "Ayer", "Hace 3 días"...) para la lista de ventas recientes. */
export function formatearTiempoRelativo(fechaIso: string, ahora: Date = new Date()): string {
  const ms = ahora.getTime() - new Date(fechaIso).getTime();
  if (ms < MINUTO_MS) return "Hace un momento";
  if (ms < HORA_MS) {
    const minutos = Math.floor(ms / MINUTO_MS);
    return `Hace ${minutos} min`;
  }
  if (ms < DIA_MS) {
    const horas = Math.floor(ms / HORA_MS);
    return `Hace ${horas} ${horas === 1 ? "hora" : "horas"}`;
  }
  const dias = Math.floor(ms / DIA_MS);
  if (dias === 1) return "Ayer";
  if (dias < 7) return `Hace ${dias} días`;
  if (dias < 30) {
    const semanas = Math.floor(dias / 7);
    return `Hace ${semanas} ${semanas === 1 ? "semana" : "semanas"}`;
  }
  if (dias < 365) {
    const meses = Math.floor(dias / 30);
    return `Hace ${meses} ${meses === 1 ? "mes" : "meses"}`;
  }
  const anios = Math.floor(dias / 365);
  return `Hace ${anios} ${anios === 1 ? "año" : "años"}`;
}

export function construirDashboardData(
  ventas: Venta[],
  rango: RangoFecha,
  ahora: Date = new Date()
): DashboardData {
  const ventasEnRango = filtrarPorRango(ventas, rango, ahora);
  const anteriores = ventasPeriodoAnterior(ventas, rango, ahora);
  const kpis = calcularKpis(ventasEnRango, anteriores);
  const topProductos = calcularTopProductos(ventasEnRango);
  return {
    ventasEnRango,
    kpis,
    ingresosPorDia: agruparIngresosPorDia(ventasEnRango),
    topProductos,
    ventasPorVendedor: calcularVentasPorVendedor(ventasEnRango),
    ventasRecientes: calcularVentasRecientes(ventasEnRango),
    insightTopProducto: calcularInsightTopProducto(topProductos, kpis.ingresosTotales),
  };
}
