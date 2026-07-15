import styles from "./InsightCard.module.css";

interface InsightCardProps {
  nombreProducto: string;
  porcentaje: number;
}

/**
 * Callout "Dato clave": reemplaza el insight de "Top Categorías" del mockup
 * (categorías no existen en el schema) por uno calculado con datos reales
 * de `topProductos` — nunca texto inventado.
 */
export function InsightCard({ nombreProducto, porcentaje }: InsightCardProps) {
  return (
    <div className={styles.card}>
      <p className={styles.eyebrow}>Dato clave</p>
      <p className={styles.body}>
        El producto más vendido, <strong>{nombreProducto}</strong>, representa el{" "}
        {porcentaje.toFixed(0)}% de tus ingresos en este período.
      </p>
    </div>
  );
}
