import { useQuery, useMutation } from "@apollo/client/react";
import { ClientesDocument, CrearClienteDocument } from "../../graphql/generated/graphql";

export function useClientes(soloActivos: boolean) {
  return useQuery(ClientesDocument, { variables: { soloActivos } });
}

export function useCrearCliente() {
  return useMutation(CrearClienteDocument, {
    refetchQueries: ["Clientes"],
  });
}
