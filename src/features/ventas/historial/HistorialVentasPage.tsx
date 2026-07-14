import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../../../components/Button";
import { Card } from "../../../components/Card";
import { EmptyState } from "../../../components/EmptyState";
import { Input } from "../../../components/Input";
import { Select } from "../../../components/Select";
import { SkeletonTable } from "../../../components/Skeleton";
import { Table } from "../../../components/Table";
import type { TableColumn } from "../../../components/Table";
import { useAuth } from "../../auth/AuthContext";
import { useVentas } from "../hooks";
import type { VentasQuery } from "../../../graphql/generated/graphql";
import { extraerMensajeError } from "../../../graphql/errors";
import styles from "./HistorialVentasPage.module.css";

type Venta = VentasQuery["ventas"][number];

export function HistorialVentasPage() {
  const navigate = useNavigate();
  const { vendedor } = useAuth();
  const { data, loading, error, refetch } = useVentas();
  const ventas = data?.ventas ?? [];

  const [busqueda, setBusqueda] = useState("");
  const [alcance, setAlcance] = useState<"todas" | "mias">("todas");

  const ventasFiltradas = ventas.filter((v) => {
    if (alcance === "mias" && v.vendedor.idVendedor !== vendedor?.id) return false;
    const termino = busqueda.trim().toLowerCase();
    if (!termino) return true;
    return (
      v.cliente.nombreCompleto.toLowerCase().includes(termino) ||
      v.vendedor.nombreCompleto.toLowerCase().includes(termino)
    );
  });

  const columns: TableColumn<Venta>[] = [
    { key: "fecha", header: "Fecha", render: (v) => formatearFecha(v.fechaVenta) },
    { key: "cliente", header: "Cliente", render: (v) => v.cliente.nombreCompleto },
    { key: "vendedor", header: "Vendedor", render: (v) => v.vendedor.nombreCompleto },
    { key: "total", header: "Total", align: "right", render: (v) => `Bs ${v.total}` },
  ];

  function limpiarFiltros() {
    setBusqueda("");
    setAlcance("todas");
  }

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1>Ventas</h1>
        <Button onClick={() => navigate("/ventas/nueva")}>Nueva venta</Button>
      </div>

      {!loading && !error && ventas.length > 0 && (
        <div className={styles.filters}>
          <Input
            label="Buscar"
            placeholder="Cliente o vendedor..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
          />
          <Select
            label="Alcance"
            value={alcance}
            onChange={(e) => setAlcance(e.target.value as "todas" | "mias")}
          >
            <option value="todas">Todas las ventas</option>
            <option value="mias">Solo mis ventas</option>
          </Select>
        </div>
      )}

      <Card>
        {loading && <SkeletonTable columns={4} />}
        {error && !loading && (
          <div>
            <p role="alert" className={styles.error}>
              {extraerMensajeError(error)}
            </p>
            <Button variant="secondary" onClick={() => refetch()}>
              Reintentar
            </Button>
          </div>
        )}
        {!loading && !error && ventas.length === 0 && (
          <EmptyState
            title="Aún no registraste ventas"
            description="Registrá tu primera venta para verla acá."
            action={<Button onClick={() => navigate("/ventas/nueva")}>Nueva venta</Button>}
          />
        )}
        {!loading && !error && ventas.length > 0 && ventasFiltradas.length === 0 && (
          <EmptyState
            title="No se encontraron ventas"
            description="Probá con otro término de búsqueda o cambiá el alcance."
            action={
              <Button variant="secondary" onClick={limpiarFiltros}>
                Limpiar filtros
              </Button>
            }
          />
        )}
        {!loading && !error && ventasFiltradas.length > 0 && (
          <Table
            columns={columns}
            rows={ventasFiltradas}
            getRowKey={(v) => v.idVenta}
            onRowClick={(v) => navigate(`/ventas/${v.idVenta}`)}
          />
        )}
      </Card>
    </div>
  );
}

function formatearFecha(fecha: unknown): string {
  if (!fecha) return "—";
  return new Date(String(fecha)).toLocaleString("es-BO", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}
