import type { ReactNode } from "react";
import { NavLink } from "react-router-dom";
import { useAuth } from "../features/auth/AuthContext";
import { esAdministrador } from "../features/auth/grupos";
import { Button } from "../components/Button";
import styles from "./AppLayout.module.css";

export function AppLayout({ children }: { children: ReactNode }) {
  const { vendedor, logout } = useAuth();
  const esAdmin = esAdministrador(vendedor);

  return (
    <div className={styles.shell}>
      <aside className={styles.sidebar}>
        <div className={styles.brand}>Ventas</div>
        <nav className={styles.nav}>
          <NavLink to="/ventas" className={({ isActive }) => navClass(isActive)}>
            Ventas
          </NavLink>
          <NavLink to="/clientes" className={({ isActive }) => navClass(isActive)}>
            Clientes
          </NavLink>
          <NavLink to="/productos" className={({ isActive }) => navClass(isActive)}>
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
