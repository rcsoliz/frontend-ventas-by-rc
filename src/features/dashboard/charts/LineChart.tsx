import { useId, useState } from "react";
import type { PointerEvent as ReactPointerEvent } from "react";
import styles from "./LineChart.module.css";

export interface LineChartPoint {
  x: string;
  value: number;
}

interface LineChartProps {
  points: LineChartPoint[];
  formatValue: (value: number) => string;
  formatX: (x: string) => string;
}

const WIDTH = 600;
const HEIGHT = 220;
const PAD_LEFT = 56;
const PAD_RIGHT = 12;
const PAD_TOP = 16;
const PAD_BOTTOM = 28;

/** Redondea `max` hacia arriba al siguiente 1/2/5 * 10^k — ticks "limpios" del eje Y. */
function techoLimpio(max: number): number {
  if (max <= 0) return 1;
  const magnitud = 10 ** Math.floor(Math.log10(max));
  const pasos = [1, 2, 5, 10];
  for (const paso of pasos) {
    const candidato = paso * magnitud;
    if (candidato >= max) return candidato;
  }
  return 10 * magnitud;
}

/**
 * Curva suave (Catmull-Rom → Bézier cúbica, tensión 1/6) que pasa exactamente
 * por cada punto — a diferencia de una curva puramente decorativa, no
 * distorsiona los valores reales entre puntos, solo suaviza el trazo.
 */
function pathSuave(puntos: { x: number; y: number }[]): string {
  if (puntos.length === 0) return "";
  if (puntos.length === 1) return `M ${puntos[0].x} ${puntos[0].y}`;
  let d = `M ${puntos[0].x} ${puntos[0].y}`;
  for (let i = 0; i < puntos.length - 1; i++) {
    const p0 = puntos[i === 0 ? i : i - 1];
    const p1 = puntos[i];
    const p2 = puntos[i + 1];
    const p3 = puntos[i + 2 < puntos.length ? i + 2 : i + 1];
    const cp1x = p1.x + (p2.x - p0.x) / 6;
    const cp1y = p1.y + (p2.y - p0.y) / 6;
    const cp2x = p2.x - (p3.x - p1.x) / 6;
    const cp2y = p2.y - (p3.y - p1.y) / 6;
    d += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p2.x} ${p2.y}`;
  }
  return d;
}

/** Línea de una sola serie (ingresos por día): sin leyenda, ver marks-and-anatomy.md. */
export function LineChart({ points, formatValue, formatX }: LineChartProps) {
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);
  const gradientId = useId();

  const plotWidth = WIDTH - PAD_LEFT - PAD_RIGHT;
  const plotHeight = HEIGHT - PAD_TOP - PAD_BOTTOM;
  const maxValue = techoLimpio(Math.max(...points.map((p) => p.value), 0));

  function xAt(index: number): number {
    if (points.length <= 1) return PAD_LEFT + plotWidth / 2;
    return PAD_LEFT + (index / (points.length - 1)) * plotWidth;
  }
  function yAt(value: number): number {
    return PAD_TOP + plotHeight - (value / maxValue) * plotHeight;
  }

  const puntosXY = points.map((p, i) => ({ x: xAt(i), y: yAt(p.value) }));
  const linePath = pathSuave(puntosXY);
  const areaPath =
    points.length > 1
      ? `${linePath} L ${xAt(points.length - 1)} ${PAD_TOP + plotHeight} L ${xAt(0)} ${PAD_TOP + plotHeight} Z`
      : "";

  const ticks = [0, 0.5, 1].map((f) => maxValue * f);

  function moverFoco(delta: number) {
    setHoverIndex((prev) => {
      const base = prev ?? 0;
      const next = Math.min(Math.max(base + delta, 0), points.length - 1);
      return next;
    });
  }

  function onPointerMove(event: ReactPointerEvent<SVGRectElement>) {
    const rect = event.currentTarget.getBoundingClientRect();
    const relX = ((event.clientX - rect.left) / rect.width) * WIDTH;
    const ratio = plotWidth > 0 ? (relX - PAD_LEFT) / plotWidth : 0;
    const index = Math.round(ratio * (points.length - 1));
    setHoverIndex(Math.min(Math.max(index, 0), points.length - 1));
  }

  const hovered = hoverIndex !== null ? points[hoverIndex] : null;
  const last = points[points.length - 1];

  return (
    <div
      className={styles.wrapper}
      style={{ aspectRatio: `${WIDTH} / ${HEIGHT}` }}
      tabIndex={0}
      role="img"
      aria-label={
        points.length > 0
          ? `Ingresos por día, de ${formatValue(points[0].value)} a ${formatValue(last.value)}`
          : "Sin datos"
      }
      onKeyDown={(e) => {
        if (e.key === "ArrowRight") {
          e.preventDefault();
          moverFoco(1);
        } else if (e.key === "ArrowLeft") {
          e.preventDefault();
          moverFoco(-1);
        } else if (e.key === "Escape") {
          setHoverIndex(null);
        }
      }}
      onMouseLeave={() => setHoverIndex(null)}
      onBlur={() => setHoverIndex(null)}
    >
      <svg viewBox={`0 0 ${WIDTH} ${HEIGHT}`} className={styles.svg} aria-hidden="true">
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" style={{ stopColor: "var(--color-primary)", stopOpacity: 0.16 }} />
            <stop offset="100%" style={{ stopColor: "var(--color-primary)", stopOpacity: 0 }} />
          </linearGradient>
        </defs>
        {ticks.map((tick) => (
          <g key={tick}>
            <line
              x1={PAD_LEFT}
              x2={WIDTH - PAD_RIGHT}
              y1={yAt(tick)}
              y2={yAt(tick)}
              className={styles.gridline}
            />
            <text x={PAD_LEFT - 8} y={yAt(tick)} className={styles.axisLabel} textAnchor="end" dy="0.32em">
              {formatValue(tick)}
            </text>
          </g>
        ))}

        {points.length > 1 && <path d={areaPath} fill={`url(#${gradientId})`} stroke="none" />}
        {points.length > 1 && <path d={linePath} className={styles.line} />}
        {points.length === 1 && <circle cx={xAt(0)} cy={yAt(points[0].value)} r={4} className={styles.dot} />}

        {last && (
          <text
            x={xAt(points.length - 1)}
            y={yAt(last.value) - 10}
            className={styles.endLabel}
            textAnchor="end"
          >
            {formatValue(last.value)}
          </text>
        )}

        {hovered && hoverIndex !== null && (
          <g>
            <line
              x1={xAt(hoverIndex)}
              x2={xAt(hoverIndex)}
              y1={PAD_TOP}
              y2={PAD_TOP + plotHeight}
              className={styles.crosshair}
            />
            <circle cx={xAt(hoverIndex)} cy={yAt(hovered.value)} r={4} className={styles.dotRing} />
            <circle cx={xAt(hoverIndex)} cy={yAt(hovered.value)} r={4} className={styles.dot} />
          </g>
        )}

        <rect
          x={PAD_LEFT}
          y={PAD_TOP}
          width={plotWidth}
          height={plotHeight}
          fill="transparent"
          onPointerMove={onPointerMove}
        />
      </svg>

      {hovered && hoverIndex !== null && (
        <div
          className={styles.tooltip}
          role="tooltip"
          style={{
            left: `${(xAt(hoverIndex) / WIDTH) * 100}%`,
            top: `${(yAt(hovered.value) / HEIGHT) * 100}%`,
          }}
        >
          <strong>{formatValue(hovered.value)}</strong>
          <span>{formatX(hovered.x)}</span>
        </div>
      )}
    </div>
  );
}
