import { useState } from "react";
import styles from "./BarChart.module.css";

export interface BarChartItem {
  id: string;
  label: string;
  value: number;
  /** Texto complementario mostrado en el tooltip al pasar el mouse/foco (ej. "12 unidades"). */
  secondary?: string;
}

interface BarChartProps {
  items: BarChartItem[];
  formatValue: (value: number) => string;
}

/**
 * Barras horizontales de una sola medida (nunca color por barra: la
 * identidad la da la etiqueta, no el color — ver color-formula.md "nominal
 * categorical"). Cada fila es su propio hit-target de hover/foco.
 */
export function BarChart({ items, formatValue }: BarChartProps) {
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);
  const max = Math.max(...items.map((item) => item.value), 0);

  return (
    <div className={styles.chart}>
      {items.map((item, index) => {
        const pct = max > 0 ? (item.value / max) * 100 : 0;
        const label = `${item.label}: ${formatValue(item.value)}${item.secondary ? `, ${item.secondary}` : ""}`;
        return (
          <div
            key={item.id}
            className={styles.row}
            tabIndex={0}
            aria-label={label}
            onMouseEnter={() => setHoverIndex(index)}
            onMouseLeave={() => setHoverIndex(null)}
            onFocus={() => setHoverIndex(index)}
            onBlur={() => setHoverIndex(null)}
          >
            <span className={styles.label} title={item.label}>
              {item.label}
            </span>
            <div className={styles.track}>
              <div
                className={[styles.bar, hoverIndex === index && styles.barHover].filter(Boolean).join(" ")}
                style={{ width: `${pct}%` }}
              />
            </div>
            <span className={styles.value}>{formatValue(item.value)}</span>
            {hoverIndex === index && item.secondary && (
              <div className={styles.tooltip} role="tooltip">
                {item.secondary}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
