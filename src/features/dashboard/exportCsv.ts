import type { PuntoIngreso } from "./aggregate";

/**
 * CSV (fecha,ingresos) de la serie "Ingresos por día" — usado por el botón
 * "Exportar" del panel. Client-side, sin backend: es la única exportación
 * fácil de construir con los datos que ya están en pantalla.
 */
export function construirCsvIngresosPorDia(puntos: PuntoIngreso[]): string {
  const encabezado = "Fecha,Ingresos";
  const filas = puntos.map((p) => `${p.fecha},${p.total.toFixed(2)}`);
  return [encabezado, ...filas].join("\n");
}

/** Dispara la descarga de un archivo de texto en el navegador, sin dependencias externas. */
export function descargarArchivo(
  nombreArchivo: string,
  contenido: string,
  tipoMime = "text/csv;charset=utf-8;"
): void {
  const blob = new Blob([contenido], { type: tipoMime });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = nombreArchivo;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
