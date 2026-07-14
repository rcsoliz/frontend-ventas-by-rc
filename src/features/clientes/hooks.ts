import { useQuery, useMutation } from "@apollo/client/react";
import {
  ActualizarClienteDocument,
  CambiarEstadoClienteDocument,
  ClientesDocument,
  CrearClienteDocument,
} from "../../graphql/generated/graphql";

export function useClientes(soloActivos: boolean) {
  return useQuery(ClientesDocument, { variables: { soloActivos } });
}

export function useCrearCliente() {
  return useMutation(CrearClienteDocument, {
    refetchQueries: ["Clientes"],
  });
}

export function useActualizarCliente() {
  return useMutation(ActualizarClienteDocument, {
    refetchQueries: ["Clientes"],
  });
}

export function useCambiarEstadoCliente() {
  return useMutation(CambiarEstadoClienteDocument, {
    refetchQueries: ["Clientes"],
  });
}
