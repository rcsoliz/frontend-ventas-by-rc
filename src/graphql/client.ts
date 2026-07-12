import { ApolloClient, InMemoryCache, HttpLink, from } from "@apollo/client";
import { SetContextLink } from "@apollo/client/link/context";
import { ErrorLink } from "@apollo/client/link/error";
import { CombinedGraphQLErrors } from "@apollo/client/errors";
import { getToken } from "../features/auth/tokenStorage";
import { emitUnauthenticated } from "./authEvents";

const graphqlUrl = import.meta.env.VITE_GRAPHQL_URL;

if (!graphqlUrl) {
  throw new Error("VITE_GRAPHQL_URL no está definida. Copiá .env.example a .env.");
}

const httpLink = new HttpLink({ uri: graphqlUrl });

const authLink = new SetContextLink((prevContext) => {
  const token = getToken();
  return {
    headers: {
      ...prevContext.headers,
      ...(token ? { authorization: `Bearer ${token}` } : {}),
    },
  };
});

// El backend nunca devuelve HTTP de error para fallos de negocio/permisos —
// siempre 200 con errors[] (GraphQLError de Strawberry). Hay que leer
// graphQLErrors, no solo networkError, o estos errores se pierden en silencio.
const errorLink = new ErrorLink(({ error }) => {
  if (CombinedGraphQLErrors.is(error)) {
    // Solo "no autenticado" (token ausente/inválido/expirado) dispara logout.
    // "No tiene el permiso requerido" es un usuario válido sin ese permiso
    // Django — se muestra como error de UI, no se cierra la sesión.
    const esErrorDeAutenticacion = error.errors.some((e) =>
      /no autenticado/i.test(e.message)
    );
    if (esErrorDeAutenticacion) {
      emitUnauthenticated();
    }
  }
});

export const apolloClient = new ApolloClient({
  link: from([errorLink, authLink, httpLink]),
  cache: new InMemoryCache(),
});
