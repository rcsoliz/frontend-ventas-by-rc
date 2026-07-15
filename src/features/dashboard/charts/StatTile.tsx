import styles from "./StatTile.module.css";

interface StatTileProps {
  label: string;
  value: string;
  /** Variación porcentual vs. el período anterior de igual duración; `null`/`undefined` la omite. */
  delta?: number | null;
  testId?: string;
}

export function StatTile({ label, value, delta, testId }: StatTileProps) {
  const mostrarDelta = delta !== null && delta !== undefined && Number.isFinite(delta);
  const esPositivo = mostrarDelta && delta >= 0;

  return (
    <div className={styles.tile} data-testid={testId}>
      <span className={styles.label}>{label}</span>
      <span className={styles.value}>{value}</span>
      {mostrarDelta && (
        <span className={[styles.delta, esPositivo ? styles.up : styles.down].join(" ")}>
          <span aria-hidden="true">{esPositivo ? "▲" : "▼"}</span>
          {Math.abs(delta).toFixed(1)}% vs. período anterior
        </span>
      )}
    </div>
  );
}
