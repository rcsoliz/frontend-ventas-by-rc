import { createContext, useContext, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import { useMutation, useApolloClient } from "@apollo/client/react";
import { CombinedGraphQLErrors } from "@apollo/client/errors";
import { LoginDocument } from "../../graphql/generated/graphql";
import type { LoginMutation } from "../../graphql/generated/graphql";
import { getToken, setToken, clearToken } from "./tokenStorage";
import { onUnauthenticated } from "../../graphql/authEvents";

export type Vendedor = LoginMutation["login"]["vendedor"];

const VENDEDOR_KEY = "ventas_vendedor";

function leerVendedorGuardado(): Vendedor | null {
  const raw = localStorage.getItem(VENDEDOR_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as Vendedor;
  } catch {
    return null;
  }
}

interface AuthContextValue {
  vendedor: Vendedor | null;
  isAuthenticated: boolean;
  loginError: string | null;
  loginLoading: boolean;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const apolloClient = useApolloClient();
  const [vendedor, setVendedor] = useState<Vendedor | null>(() => leerVendedorGuardado());
  const [loginMutation, { loading: loginLoading }] = useMutation(LoginDocument);
  const [loginError, setLoginError] = useState<string | null>(null);

  const logout = useMemo(
    () => () => {
      clearToken();
      localStorage.removeItem(VENDEDOR_KEY);
      setVendedor(null);
      // Limpia el cache de Apollo para no dejar datos del vendedor anterior visibles.
      void apolloClient.clearStore();
    },
    [apolloClient]
  );

  useEffect(() => onUnauthenticated(logout), [logout]);

  async function login(username: string, password: string): Promise<boolean> {
    setLoginError(null);
    try {
      const { data } = await loginMutation({ variables: { username, password } });
      if (!data) return false;
      setToken(data.login.token);
      localStorage.setItem(VENDEDOR_KEY, JSON.stringify(data.login.vendedor));
      setVendedor(data.login.vendedor);
      return true;
    } catch (error) {
      if (CombinedGraphQLErrors.is(error)) {
        setLoginError(error.errors[0]?.message ?? "No se pudo iniciar sesión.");
      } else {
        setLoginError("No se pudo conectar con el servidor.");
      }
      return false;
    }
  }

  const value: AuthContextValue = {
    vendedor,
    isAuthenticated: vendedor !== null && getToken() !== null,
    loginError,
    loginLoading,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth debe usarse dentro de <AuthProvider>.");
  return ctx;
}
