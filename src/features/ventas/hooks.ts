import { useQuery, useMutation } from "@apollo/client/react";
import {
  VentasDocument,
  VentaDocument,
  RegistrarVentaDocument,
} from "../../graphql/generated/graphql";

export function useVentas() {
  // "cache-and-network": el Dashboard e Historial muestran la caché al instante,
  // pero siempre disparan un fetch al montar — así una venta registrada en otra
  // pestaña/pantalla se refleja al volver, sin depender de que ese componente
  // estuviera activo cuando corrió el refetchQueries de useRegistrarVenta.
  return useQuery(VentasDocument, { fetchPolicy: "cache-and-network" });
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
