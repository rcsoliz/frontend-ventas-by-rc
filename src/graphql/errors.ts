import { CombinedGraphQLErrors } from "@apollo/client/errors";

/**
 * Los mensajes de negocio del backend (stock insuficiente, cliente duplicado,
 * etc.) ya están pensados para mostrarse al usuario tal cual — nunca reescribirlos.
 */
export function extraerMensajeError(error: unknown): string {
  if (CombinedGraphQLErrors.is(error)) {
    return error.errors[0]?.message ?? "Ocurrió un error inesperado.";
  }
  return "No se pudo conectar con el servidor.";
}
