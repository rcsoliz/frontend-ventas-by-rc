import { NavLink, useNavigate } from "react-router-dom";
import { Button } from "../../components/Button";
import styles from "./VentasTabs.module.css";

/**
 * Header compartido de la sección Ventas: título + selector de tabs
 * (Historial / Nueva venta) + acceso directo a "Nueva venta". Las rutas
 * siguen siendo `/ventas` y `/ventas/nueva` (ver App.tsx) — este componente
 * solo decide qué tab se ve activo según la ruta actual, no cambia el
 * ruteo.
 */
export function VentasTabs() {
  const navigate = useNavigate();

  return (
    <div className={styles.wrapper}>
      <div className={styles.header}>
        <h1 className={styles.title}>Ventas</h1>
        <Button onClick={() => navigate("/ventas/nueva")}>+ Nueva venta</Button>
      </div>
      <nav className={styles.tabs} aria-label="Secciones de ventas">
        <NavLink
          to="/ventas"
          end
          className={({ isActive }) =>
            [styles.tab, isActive && styles.tabActive].filter(Boolean).join(" ")
          }
        >
          Historial
        </NavLink>
        <NavLink
          to="/ventas/nueva"
          className={({ isActive }) =>
            [styles.tab, isActive && styles.tabActive].filter(Boolean).join(" ")
          }
        >
          Nueva venta
        </NavLink>
      </nav>
    </div>
  );
}
