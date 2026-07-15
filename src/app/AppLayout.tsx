import { useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";
import { NavLink } from "react-router-dom";
import { useAuth } from "../features/auth/AuthContext";
import { esAdministrador } from "../features/auth/grupos";
import styles from "./AppLayout.module.css";

const MOBILE_QUERY = "(max-width: 768px)";

function useIsMobile(): boolean {
  const [isMobile, setIsMobile] = useState(
    () => typeof window !== "undefined" && window.matchMedia(MOBILE_QUERY).matches
  );

  useEffect(() => {
    const mql = window.matchMedia(MOBILE_QUERY);
    const onChange = () => setIsMobile(mql.matches);
    mql.addEventListener("change", onChange);
    return () => mql.removeEventListener("change", onChange);
  }, []);

  return isMobile;
}

/** Iniciales del vendedor para el avatar (placeholder circular, sin foto real). */
function iniciales(nombreCompleto: string | undefined): string {
  if (!nombreCompleto) return "?";
  const partes = nombreCompleto.trim().split(/\s+/).filter(Boolean);
  const letras = partes.slice(0, 2).map((parte) => parte[0]?.toUpperCase() ?? "");
  return letras.join("") || "?";
}

/** Marca/logo: cuadrado negro con ícono, igual en el sidebar y en el topbar mobile. */
function BrandMark() {
  return (
    <span className={styles.brandMark} aria-hidden="true">
      <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
        <rect x="2" y="4" width="14" height="10" rx="2" stroke="currentColor" strokeWidth="1.6" />
        <path d="M2 7.5h14" stroke="currentColor" strokeWidth="1.6" />
        <circle cx="13" cy="11" r="1" fill="currentColor" />
      </svg>
    </span>
  );
}

function IconPanel() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
      <rect x="2" y="2" width="6" height="6" rx="1.4" stroke="currentColor" strokeWidth="1.6" />
      <rect x="10" y="2" width="6" height="6" rx="1.4" stroke="currentColor" strokeWidth="1.6" />
      <rect x="2" y="10" width="6" height="6" rx="1.4" stroke="currentColor" strokeWidth="1.6" />
      <rect x="10" y="10" width="6" height="6" rx="1.4" stroke="currentColor" strokeWidth="1.6" />
    </svg>
  );
}

function IconVentas() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
      <rect x="2" y="4" width="14" height="10" rx="2" stroke="currentColor" strokeWidth="1.6" />
      <path d="M2 7.5h14" stroke="currentColor" strokeWidth="1.6" />
      <circle cx="13" cy="11" r="1" fill="currentColor" />
    </svg>
  );
}

function IconClientes() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
      <circle cx="6.8" cy="6" r="2.6" stroke="currentColor" strokeWidth="1.6" />
      <path
        d="M2.3 15c0-2.8 2-4.5 4.5-4.5s4.5 1.7 4.5 4.5"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
      <circle cx="13.2" cy="6.6" r="2" stroke="currentColor" strokeWidth="1.6" />
      <path d="M12 10.9c1.9.2 3.5 1.6 3.7 4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

function IconProductos() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
      <path d="M2.5 5.5L9 2l6.5 3.5L9 9 2.5 5.5z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
      <path d="M2.5 5.5V13L9 16.5 15.5 13V5.5" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
      <path d="M9 9v7.5" stroke="currentColor" strokeWidth="1.6" />
    </svg>
  );
}

function IconSearch() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <circle cx="7" cy="7" r="4.5" stroke="currentColor" strokeWidth="1.6" />
      <path d="M13.5 13.5L10.6 10.6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

function IconBell() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
      <path
        d="M4 7.5a5 5 0 0110 0c0 3 1 4 1.5 4.5h-13C3 11.5 4 10.5 4 7.5z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      <path d="M7.2 14.5a1.8 1.8 0 003.6 0" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

function IconGear() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
      <circle cx="9" cy="9" r="2.3" stroke="currentColor" strokeWidth="1.6" />
      <path
        d="M9 2.6v1.6M9 13.8v1.6M15.4 9h-1.6M4.2 9H2.6M13.3 4.7l-1.1 1.1M5.8 12.2l-1.1 1.1M13.3 13.3l-1.1-1.1M5.8 5.8L4.7 4.7"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
    </svg>
  );
}

function IconKebab() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <circle cx="8" cy="3" r="1.3" fill="currentColor" />
      <circle cx="8" cy="8" r="1.3" fill="currentColor" />
      <circle cx="8" cy="13" r="1.3" fill="currentColor" />
    </svg>
  );
}

export function AppLayout({ children }: { children: ReactNode }) {
  const { vendedor, logout } = useAuth();
  const esAdmin = esAdministrador(vendedor);
  const isMobile = useIsMobile();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const firstNavLinkRef = useRef<HTMLAnchorElement>(null);
  const wasOpenRef = useRef(false);

  useEffect(() => {
    if (!isMobile) setDrawerOpen(false);
  }, [isMobile]);

  useEffect(() => {
    if (drawerOpen) {
      firstNavLinkRef.current?.focus();
      wasOpenRef.current = true;
    } else if (wasOpenRef.current) {
      menuButtonRef.current?.focus();
      wasOpenRef.current = false;
    }
  }, [drawerOpen]);

  useEffect(() => {
    if (!drawerOpen) return;
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setDrawerOpen(false);
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [drawerOpen]);

  function closeDrawer() {
    setDrawerOpen(false);
  }

  const sidebarInert = isMobile && !drawerOpen;
  const nombre = vendedor?.nombreCompleto;
  const rol = esAdmin ? "Administrador" : "Vendedor";

  return (
    <div className={styles.shell}>
      {/* Topbar mobile: hamburguesa + marca. Comportamiento del drawer sin cambios. */}
      <div className={styles.topbar}>
        <button
          ref={menuButtonRef}
          type="button"
          className={styles.menuButton}
          onClick={() => setDrawerOpen(true)}
          aria-label="Abrir menú"
          aria-expanded={drawerOpen}
          aria-controls="app-sidebar"
        >
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
            <path d="M3 5h14M3 10h14M3 15h14" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
          </svg>
        </button>
        <span className={styles.topbarBrandGroup}>
          <BrandMark />
          <span className={styles.topbarBrand}>Ventas</span>
        </span>
      </div>

      <div className={styles.overlay} data-open={drawerOpen} onClick={closeDrawer} aria-hidden="true" />

      <aside id="app-sidebar" className={styles.sidebar} data-open={drawerOpen} inert={sidebarInert}>
        <div className={styles.brandRow}>
          <span className={styles.brandGroup}>
            <BrandMark />
            <span className={styles.brandTextGroup}>
              <span className={styles.brandTitle}>Ventas</span>
              <span className={styles.brandSubtitle}>Gestión Comercial</span>
            </span>
          </span>
          <button type="button" className={styles.closeButton} onClick={closeDrawer} aria-label="Cerrar menú">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
              <path d="M3 3l10 10M13 3L3 13" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
            </svg>
          </button>
        </div>
        <nav className={styles.nav}>
          {esAdmin && (
            <NavLink
              ref={firstNavLinkRef}
              to="/panel"
              className={({ isActive }) => navClass(isActive)}
              onClick={closeDrawer}
            >
              <IconPanel />
              <span>Panel</span>
            </NavLink>
          )}
          <NavLink
            ref={esAdmin ? undefined : firstNavLinkRef}
            to="/ventas"
            className={({ isActive }) => navClass(isActive)}
            onClick={closeDrawer}
          >
            <IconVentas />
            <span>Ventas</span>
          </NavLink>
          <NavLink to="/clientes" className={({ isActive }) => navClass(isActive)} onClick={closeDrawer}>
            <IconClientes />
            <span>Clientes</span>
          </NavLink>
          <NavLink to="/productos" className={({ isActive }) => navClass(isActive)} onClick={closeDrawer}>
            <IconProductos />
            <span>Productos</span>
          </NavLink>
        </nav>
        <div className={styles.footer}>
          <span className={styles.avatarCircle} aria-hidden="true">
            {iniciales(nombre)}
          </span>
          <span className={styles.userTextGroup}>
            <span className={styles.userName}>{nombre}</span>
            <span className={styles.userRole}>{rol}</span>
          </span>
          <button
            type="button"
            className={styles.logoutButton}
            onClick={logout}
            aria-label="Cerrar sesión"
            title="Cerrar sesión"
          >
            <IconKebab />
          </button>
        </div>
      </aside>

      <div className={styles.main}>
        {/* Topbar desktop, ver Dashboard.png. Buscador/campana/engranaje son
            visuales por ahora: no hay backend de búsqueda global ni de
            notificaciones ni pantalla de configuración todavía. */}
        <header className={styles.desktopTopbar}>
          <div className={styles.searchField}>
            <IconSearch />
            <label htmlFor="app-search" className={styles.srOnly}>
              Buscar en el sistema
            </label>
            <input
              id="app-search"
              type="search"
              className={styles.searchInput}
              placeholder="Buscar en el sistema..."
            />
          </div>
          <div className={styles.topbarActions}>
            <button type="button" className={styles.iconButton} aria-label="Notificaciones">
              <IconBell />
            </button>
            <button type="button" className={styles.iconButton} aria-label="Configuración">
              <IconGear />
            </button>
            <span className={styles.avatarCircle} aria-hidden="true">
              {iniciales(nombre)}
            </span>
          </div>
        </header>

        <main className={styles.content}>{children}</main>
      </div>
    </div>
  );
}

function navClass(isActive: boolean) {
  return [styles.navLink, isActive && styles.navLinkActive].filter(Boolean).join(" ");
}
