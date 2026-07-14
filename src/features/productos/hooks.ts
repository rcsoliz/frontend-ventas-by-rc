import { useQuery, useMutation } from "@apollo/client/react";
import {
  ActualizarProductoDocument,
  CambiarEstadoProductoDocument,
  ProductosDocument,
  CrearProductoDocument,
} from "../../graphql/generated/graphql";

export function useProductos(soloActivos: boolean) {
  return useQuery(ProductosDocument, { variables: { soloActivos } });
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
