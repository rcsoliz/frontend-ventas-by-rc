type Listener = () => void;

const listeners = new Set<Listener>();

/**
 * El errorLink detecta "no autenticado" pero no decide el logout — solo emite
 * este evento. `auth-frontend` (AuthContext) es el único suscriptor real.
 */
export function emitUnauthenticated() {
  listeners.forEach((listener) => listener());
}

export function onUnauthenticated(listener: Listener): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}
