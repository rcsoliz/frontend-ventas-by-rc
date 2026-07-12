import type { Vendedor } from "./AuthContext";

export const GRUPO_ADMINISTRADORES = "Administradores";
export const GRUPO_VENDEDORES = "Vendedores";

/**
 * Solo gating de UX (ocultar acciones que el backend igual va a rechazar).
 * La autorización real la hace el backend vía HasDjangoPermission — esto
 * nunca reemplaza esa validación.
 */
export function perteneceAGrupo(vendedor: Vendedor | null, grupo: string): boolean {
  return vendedor?.grupos.includes(grupo) ?? false;
}

export function esAdministrador(vendedor: Vendedor | null): boolean {
  return perteneceAGrupo(vendedor, GRUPO_ADMINISTRADORES);
}
