import type { ReactNode } from "react";
import { Button } from "../../../components/Button";
import styles from "./ChartCard.module.css";

interface ChartCardProps {
  title: string;
  isTableView: boolean;
  onToggleView: () => void;
  children: ReactNode;
  className?: string;
}

export function ChartCard({ title, isTableView, onToggleView, children, className }: ChartCardProps) {
  return (
    <div className={[styles.card, className].filter(Boolean).join(" ")}>
      <div className={styles.header}>
        <h2 className={styles.title}>{title}</h2>
        <Button variant="ghost" size="sm" onClick={onToggleView}>
          {isTableView ? "Ver gráfico" : "Ver tabla"}
        </Button>
      </div>
      {children}
    </div>
  );
}
