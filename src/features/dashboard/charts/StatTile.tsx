import type { ReactNode } from "react";
import { Badge } from "../../../components/Badge";
import styles from "./StatTile.module.css";

interface StatTileProps {
  label: string;
  value: string;
  /** Variación porcentual vs. el período anterior de igual duración; `null`/`undefined` la omite. */
  delta?: number | null;
  testId?: string;
  /** Icono decorativo mostrado en el círculo superior derecho de la card. */
  icon?: ReactNode;
}

export function StatTile({ label, value, delta, testId, icon }: StatTileProps) {
  const mostrarDelta = delta !== null && delta !== undefined && Number.isFinite(delta);
  const esPositivo = mostrarDelta && delta >= 0;

  return (
    <div className={styles.tile} data-testid={testId}>
      <div className={styles.top}>
        <span className={styles.label}>{label}</span>
        {icon && <span className={styles.iconWrap}>{icon}</span>}
      </div>
      <span className={styles.value}>{value}</span>
      {mostrarDelta && (
        <Badge variant={esPositivo ? "success" : "danger"}>
          <span aria-hidden="true">{esPositivo ? "▲" : "▼"}</span>
          {Math.abs(delta).toFixed(1)}% vs. período anterior
        </Badge>
      )}
    </div>
  );
}
