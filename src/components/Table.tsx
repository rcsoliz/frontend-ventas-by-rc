import type { ReactNode } from "react";
import styles from "./Table.module.css";

export type SortDirection = "asc" | "desc";

export interface TableColumn<T> {
  key: string;
  header: string;
  render: (row: T) => ReactNode;
  align?: "left" | "right" | "center";
  sortable?: boolean;
  /** Fija la columna al borde derecho (ej. Acciones), visible aunque la tabla scrollee horizontalmente. */
  sticky?: boolean;
}

interface TableProps<T> {
  columns: TableColumn<T>[];
  rows: T[];
  getRowKey: (row: T) => string;
  onRowClick?: (row: T) => void;
  sortKey?: string | null;
  sortDirection?: SortDirection;
  onSortChange?: (key: string) => void;
}

export function Table<T>({
  columns,
  rows,
  getRowKey,
  onRowClick,
  sortKey,
  sortDirection,
  onSortChange,
}: TableProps<T>) {
  return (
    <div className={styles.wrapper}>
      <table className={styles.table}>
        <thead>
          <tr>
            {columns.map((col) => {
              const puedeOrdenar = col.sortable && onSortChange;
              const ordenActivo = puedeOrdenar && sortKey === col.key;
              return (
                <th
                  key={col.key}
                  className={[
                    styles[col.align ?? "left"],
                    puedeOrdenar && styles.sortable,
                    col.sticky && styles.stickyRight,
                  ]
                    .filter(Boolean)
                    .join(" ")}
                  onClick={puedeOrdenar ? () => onSortChange(col.key) : undefined}
                  onKeyDown={
                    puedeOrdenar
                      ? (e) => {
                          if (e.key === "Enter" || e.key === " ") {
                            e.preventDefault();
                            onSortChange(col.key);
                          }
                        }
                      : undefined
                  }
                  tabIndex={puedeOrdenar ? 0 : undefined}
                  aria-sort={
                    ordenActivo ? (sortDirection === "asc" ? "ascending" : "descending") : undefined
                  }
                >
                  {col.header}
                  {ordenActivo && (
                    <span aria-hidden="true"> {sortDirection === "asc" ? "↑" : "↓"}</span>
                  )}
                </th>
              );
            })}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr
              key={getRowKey(row)}
              className={onRowClick ? styles.clickable : undefined}
              onClick={onRowClick ? () => onRowClick(row) : undefined}
              tabIndex={onRowClick ? 0 : undefined}
              role={onRowClick ? "button" : undefined}
              onKeyDown={
                onRowClick
                  ? (e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        onRowClick(row);
                      }
                    }
                  : undefined
              }
            >
              {columns.map((col) => (
                <td
                  key={col.key}
                  className={[styles[col.align ?? "left"], col.sticky && styles.stickyRight]
                    .filter(Boolean)
                    .join(" ")}
                >
                  {col.render(row)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
