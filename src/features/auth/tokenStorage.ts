const TOKEN_KEY = "ventas_token";

/**
 * localStorage es una decisión conocida, no la ideal: el backend emite el JWT
 * por header (Authorization: Bearer) en vez de cookie httpOnly, así que no hay
 * alternativa sin tocar el backend. Trade-off aceptado: el token queda expuesto
 * a XSS vía JS de terceros, a cambio de no requerir cambios en el servidor.
 * Única fuente de verdad del token en todo el frontend — `graphql-client` la
 * importa para el `authLink`, nadie más debe leer/escribir `localStorage` directo.
 */
export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token);
}

export function clearToken(): void {
  localStorage.removeItem(TOKEN_KEY);
}
