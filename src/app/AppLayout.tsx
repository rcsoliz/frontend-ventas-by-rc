import { useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";
import { NavLink } from "react-router-dom";
import { useAuth } from "../features/auth/AuthContext";
import { esAdministrador } from "../features/auth/grupos";
import { Button } from "../components/Button";
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

  return (
    <div className={styles.shell}>
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
        <span className={styles.topbarBrand}>Ventas</span>
      </div>

      <div className={styles.overlay} data-open={drawerOpen} onClick={closeDrawer} aria-hidden="true" />

      <aside
        id="app-sidebar"
        className={styles.sidebar}
        data-open={drawerOpen}
        inert={sidebarInert}
      >
        <div className={styles.brandRow}>
          <div className={styles.brand}>Ventas</div>
          <button
            type="button"
            className={styles.closeButton}
            onClick={closeDrawer}
            aria-label="Cerrar menú"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
              <path d="M3 3l10 10M13 3L3 13" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
            </svg>
          </button>
        </div>
        <nav className={styles.nav}>
          <NavLink
            ref={firstNavLinkRef}
            to="/ventas"
            className={({ isActive }) => navClass(isActive)}
            onClick={closeDrawer}
          >
            Ventas
          </NavLink>
          <NavLink to="/clientes" className={({ isActive }) => navClass(isActive)} onClick={closeDrawer}>
            Clientes
          </NavLink>
          <NavLink to="/productos" className={({ isActive }) => navClass(isActive)} onClick={closeDrawer}>
            Productos
          </NavLink>
        </nav>
        <div className={styles.footer}>
          <div className={styles.user}>
            <span className={styles.userName}>{vendedor?.nombreCompleto}</span>
            <span className={styles.userRole}>{esAdmin ? "Administrador" : "Vendedor"}</span>
          </div>
          <Button variant="ghost" size="sm" onClick={logout}>
            Cerrar sesión
          </Button>
        </div>
      </aside>

      <main className={styles.content}>{children}</main>
    </div>
  );
}

function navClass(isActive: boolean) {
  return [styles.navLink, isActive && styles.navLinkActive].filter(Boolean).join(" ");
}
