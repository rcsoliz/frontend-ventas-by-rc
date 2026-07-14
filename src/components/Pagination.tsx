import { Button } from "./Button";
import styles from "./Pagination.module.css";

interface PaginationProps {
  page: number;
  totalItems: number;
  pageSize: number;
  onPageChange: (page: number) => void;
}

export function Pagination({ page, totalItems, pageSize, onPageChange }: PaginationProps) {
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  if (totalPages <= 1) return null;

  return (
    <nav className={styles.pagination} aria-label="Paginación">
      <Button
        variant="secondary"
        size="sm"
        onClick={() => onPageChange(page - 1)}
        disabled={page <= 1}
      >
        Anterior
      </Button>
      <span className={styles.status} aria-live="polite">
        Página {page} de {totalPages}
      </span>
      <Button
        variant="secondary"
        size="sm"
        onClick={() => onPageChange(page + 1)}
        disabled={page >= totalPages}
      >
        Siguiente
      </Button>
    </nav>
  );
}

export function paginar<T>(items: T[], page: number, pageSize: number): T[] {
  const inicio = (page - 1) * pageSize;
  return items.slice(inicio, inicio + pageSize);
}
