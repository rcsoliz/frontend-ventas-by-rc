import { useQuery, useMutation } from "@apollo/client/react";
import {
  VentasDocument,
  VentaDocument,
  RegistrarVentaDocument,
} from "../../graphql/generated/graphql";

export function useVentas() {
  return useQuery(VentasDocument);
}

export function useVenta(idVenta: string) {
  return useQuery(VentaDocument, { variables: { idVenta } });
}

export function useRegistrarVenta() {
  return useMutation(RegistrarVentaDocument, {
    // El stock de los productos cambia y el historial tiene una fila nueva —
    // invalidamos ambas queries para no dejar la UI con datos desactualizados.
    refetchQueries: ["Ventas", "Productos"],
  });
}
