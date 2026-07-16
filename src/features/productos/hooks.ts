import { useQuery, useMutation } from "@apollo/client/react";
import {
  ActualizarProductoDocument,
  CambiarEstadoProductoDocument,
  ProductosDocument,
  CrearProductoDocument,
} from "../../graphql/generated/graphql";

export function useProductos(soloActivos: boolean) {
  // Mismo motivo que useVentas: el stock cambia con cada venta, y esta pantalla
  // puede no estar montada cuando corre el refetchQueries de useRegistrarVenta.
  return useQuery(ProductosDocument, {
    variables: { soloActivos },
    fetchPolicy: "cache-and-network",
  });
}

export function useCrearProducto() {
  return useMutation(CrearProductoDocument, {
    refetchQueries: ["Productos"],
  });
}

export function useActualizarProducto() {
  return useMutation(ActualizarProductoDocument, {
    refetchQueries: ["Productos"],
  });
}

export function useCambiarEstadoProducto() {
  return useMutation(CambiarEstadoProductoDocument, {
    refetchQueries: ["Productos"],
  });
}
