import { Badge } from "../../../components/Badge";
import type { VentaReciente } from "../aggregate";
import { formatearTiempoRelativo } from "../aggregate";
import styles from "./RecentSales.module.css";

interface RecentSalesProps {
  ventas: VentaReciente[];
  formatearMoneda: (valor: number) => string;
}

/** Iniciales del cliente para el avatar circular (máx. 2 letras) — nunca vacío gracias al fallback. */
function iniciales(nombre: string): string {
  const partes = nombre.trim().split(/\s+/).filter(Boolean);
  if (partes.length === 0) return "?";
  return partes
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? "")
    .join("");
}

/**
 * Identificador corto y real de la venta (sufijo de `idVenta`) — no existe un
 * número de factura secuencial en el schema, así que evitamos inventar
 * "Factura #NNNN"; usamos el id real de la venta, acortado para que quepa en
 * la fila.
 */
function idCorto(idVenta: string): string {
  return idVenta.slice(-6).toUpperCase();
}

/**
 * Lista de las ventas más recientes. El badge "Completado" es real: el
 * modelo actual no tiene un estado "pendiente", toda venta registrada ya
 * está confirmada.
 */
export function RecentSales({ ventas, formatearMoneda }: RecentSalesProps) {
  return (
    <ul className={styles.list}>
      {ventas.map((venta) => (
        <li key={venta.idVenta} className={styles.row}>
          <div className={styles.identity}>
            <span className={styles.avatar} aria-hidden="true">
              {iniciales(venta.clienteNombre)}
            </span>
            <div className={styles.details}>
              <p className={styles.nombre}>{venta.clienteNombre}</p>
              <p className={styles.meta}>
                {formatearTiempoRelativo(venta.fechaVenta)} · Venta #{idCorto(venta.idVenta)}
              </p>
            </div>
          </div>
          <div className={styles.montoWrap}>
            <p className={styles.monto}>{formatearMoneda(venta.total)}</p>
            <Badge variant="success">Completado</Badge>
          </div>
        </li>
      ))}
    </ul>
  );
}
