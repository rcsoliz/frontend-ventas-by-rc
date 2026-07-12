import { useQuery, useMutation } from "@apollo/client/react";
import { ProductosDocument, CrearProductoDocument } from "../../graphql/generated/graphql";

export function useProductos(soloActivos: boolean) {
  return useQuery(ProductosDocument, { variables: { soloActivos } });
}

export function useCrearProducto() {
  return useMutation(CrearProductoDocument, {
    refetchQueries: ["Productos"],
  });
}
