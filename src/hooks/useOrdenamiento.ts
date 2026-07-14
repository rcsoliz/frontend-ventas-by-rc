import { useState } from "react";
import type { SortDirection } from "../components/Table";

/** Estado de "ordenar por columna" para una `Table`: qué columna y en qué sentido. */
export function useOrdenamiento(claveInicial: string | null = null) {
  const [sortKey, setSortKey] = useState<string | null>(claveInicial);
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");

  function alternarOrden(key: string) {
    if (sortKey === key) {
      setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDirection("asc");
    }
  }

  return { sortKey, sortDirection, alternarOrden };
}

/** Ordena `items` según `sortKey`/`sortDirection`, usando `obtenerValor` para extraer el valor comparable de cada columna. */
export function ordenarPor<T>(
  items: T[],
  sortKey: string | null,
  sortDirection: SortDirection,
  obtenerValor: (item: T, key: string) => string | number
): T[] {
  if (!sortKey) return items;
  const ordenados = [...items].sort((a, b) => {
    const va = obtenerValor(a, sortKey);
    const vb = obtenerValor(b, sortKey);
    const cmp =
      typeof va === "string" && typeof vb === "string" ? va.localeCompare(vb) : Number(va) - Number(vb);
    return sortDirection === "asc" ? cmp : -cmp;
  });
  return ordenados;
}
