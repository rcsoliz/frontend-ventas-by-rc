import { useQuery } from "@apollo/client/react";
import { ClientesDocument, ProductosDocument, VentasDocument } from "../../graphql/generated/graphql";
import { formatearMoneda } from "../../format";

export type TipoResultadoBusqueda = "cliente" | "producto" | "venta";

export interface ResultadoBusqueda {
  tipo: TipoResultadoBusqueda;
  id: string;
  titulo: string;
  subtitulo: string;
}

const MAX_RESULTADOS_POR_TIPO = 5;

/**
 * Buscador general del header: no existe (ni hace falta) un endpoint de
 * backend propio. `clientes`/`productos`/`ventas` ya devuelven el listado
 * completo sin paginar (las mismas queries que usan ClientesPage,
 * ProductosPage y HistorialVentasPage), así que alcanza con reusarlas y
 * filtrar acá. Las tres se activan recién con `habilitado` (primer foco del
 * input) para no disparar tres queries en cada carga de página si el
 * vendedor nunca usa el buscador.
 */
export function useBusquedaGlobal(termino: string, habilitado: boolean) {
  const clientesQuery = useQuery(ClientesDocument, {
    variables: { soloActivos: true },
    skip: !habilitado,
  });
  const productosQuery = useQuery(ProductosDocument, {
    variables: { soloActivos: true },
    skip: !habilitado,
  });
  const ventasQuery = useQuery(VentasDocument, { skip: !habilitado });

  const terminoNormalizado = termino.trim().toLowerCase();
  if (terminoNormalizado.length === 0) {
    return { resultados: [] as ResultadoBusqueda[], cargando: false };
  }

  const clientes: ResultadoBusqueda[] = (clientesQuery.data?.clientes ?? [])
    .filter(
      (c) =>
        c.nombreCompleto.toLowerCase().includes(terminoNormalizado) ||
        c.correo.toLowerCase().includes(terminoNormalizado)
    )
    .slice(0, MAX_RESULTADOS_POR_TIPO)
    .map((c) => ({
      tipo: "cliente" as const,
      id: c.idCliente,
      titulo: c.nombreCompleto,
      subtitulo: c.correo,
    }));

  const productos: ResultadoBusqueda[] = (productosQuery.data?.productos ?? [])
    .filter((p) => p.nombreProducto.toLowerCase().includes(terminoNormalizado))
    .slice(0, MAX_RESULTADOS_POR_TIPO)
    .map((p) => ({
      tipo: "producto" as const,
      id: p.idProducto,
      titulo: p.nombreProducto,
      subtitulo: formatearMoneda(p.precio),
    }));

  const ventas: ResultadoBusqueda[] = (ventasQuery.data?.ventas ?? [])
    .filter(
      (v) =>
        v.cliente.nombreCompleto.toLowerCase().includes(terminoNormalizado) ||
        v.idVenta.toLowerCase().includes(terminoNormalizado)
    )
    .slice(0, MAX_RESULTADOS_POR_TIPO)
    .map((v) => ({
      tipo: "venta" as const,
      id: v.idVenta,
      titulo: `Venta #${v.idVenta}`,
      subtitulo: `${v.cliente.nombreCompleto} · ${formatearMoneda(v.total)}`,
    }));

  return {
    resultados: [...clientes, ...productos, ...ventas],
    cargando: clientesQuery.loading || productosQuery.loading || ventasQuery.loading,
  };
}
