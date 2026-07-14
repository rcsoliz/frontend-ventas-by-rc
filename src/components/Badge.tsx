import type { ReactNode } from "react";
import styles from "./Badge.module.css";

interface BadgeProps {
  variant?: "success" | "muted";
  children: ReactNode;
}

export function Badge({ variant = "muted", children }: BadgeProps) {
  return <span className={[styles.badge, styles[variant]].join(" ")}>{children}</span>;
}
