import { IconChevronLeft, IconChevronRight } from "./icons";
import styles from "./Pagination.module.css";

interface PaginationProps {
  page: number;
  totalItems: number;
  pageSize: number;
  onPageChange: (page: number) => void;
}

type PaginaItem = number | "ellipsis";

/**
 * Genera la lista de pastillas a mostrar: siempre primera y última página,
 * una ventana de 1 página a cada lado de la actual, y "…" donde hay salto.
 * Patrón estándar (tipo GitHub/MUI) — no reproduce literalmente el conteo de
 * resultados fijo del mockup, pero sí su lenguaje visual (pastillas + flechas).
 */
function construirPaginas(pagina: number, totalPages: number): PaginaItem[] {
  const delta = 1;
  const paginas: PaginaItem[] = [];
  const rango: number[] = [];

  for (let p = Math.max(2, pagina - delta); p <= Math.min(totalPages - 1, pagina + delta); p++) {
    rango.push(p);
  }

  if (pagina - delta > 2) {
    paginas.push(1, "ellipsis");
  } else {
    paginas.push(1);
  }

  paginas.push(...rango);

  if (pagina + delta < totalPages - 1) {
    paginas.push("ellipsis", totalPages);
  } else if (totalPages > 1) {
    paginas.push(totalPages);
  }

  return paginas;
}

export function Pagination({ page, totalItems, pageSize, onPageChange }: PaginationProps) {
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  if (totalPages <= 1) return null;

  const paginas = construirPaginas(page, totalPages);
  const desde = (page - 1) * pageSize + 1;
  const hasta = Math.min(page * pageSize, totalItems);

  return (
    <nav className={styles.pagination} aria-label="Paginación">
      <span className={styles.status} aria-live="polite">
        Mostrando {desde} a {hasta} de {totalItems} resultado{totalItems === 1 ? "" : "s"}
      </span>
      <div className={styles.controls}>
        <button
          type="button"
          className={styles.arrow}
          onClick={() => onPageChange(page - 1)}
          disabled={page <= 1}
          aria-label="Página anterior"
        >
          <IconChevronLeft />
        </button>
        {paginas.map((item, index) =>
          item === "ellipsis" ? (
            <span key={`ellipsis-${index}`} className={styles.ellipsis} aria-hidden="true">
              …
            </span>
          ) : (
            <button
              key={item}
              type="button"
              className={[styles.pageButton, item === page && styles.pageButtonActive]
                .filter(Boolean)
                .join(" ")}
              onClick={() => onPageChange(item)}
              aria-current={item === page ? "page" : undefined}
              aria-label={`Ir a la página ${item}`}
            >
              {item}
            </button>
          )
        )}
        <button
          type="button"
          className={styles.arrow}
          onClick={() => onPageChange(page + 1)}
          disabled={page >= totalPages}
          aria-label="Página siguiente"
        >
          <IconChevronRight />
        </button>
      </div>
    </nav>
  );
}

export function paginar<T>(items: T[], page: number, pageSize: number): T[] {
  const inicio = (page - 1) * pageSize;
  return items.slice(inicio, inicio + pageSize);
}
