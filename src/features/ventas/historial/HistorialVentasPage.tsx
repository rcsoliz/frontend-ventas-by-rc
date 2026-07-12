import { useNavigate } from "react-router-dom";
import { Button } from "../../../components/Button";
import { Card } from "../../../components/Card";
import { EmptyState } from "../../../components/EmptyState";
import { SkeletonTable } from "../../../components/Skeleton";
import { Table } from "../../../components/Table";
import type { TableColumn } from "../../../components/Table";
import { useVentas } from "../hooks";
import type { VentasQuery } from "../../../graphql/generated/graphql";
import { extraerMensajeError } from "../../../graphql/errors";
import styles from "./HistorialVentasPage.module.css";

type Venta = VentasQuery["ventas"][number];

export function HistorialVentasPage() {
  const navigate = useNavigate();
  const { data, loading, error } = useVentas();
  const ventas = data?.ventas ?? [];

  const columns: TableColumn<Venta>[] = [
    { key: "fecha", header: "Fecha", render: (v) => formatearFecha(v.fechaVenta) },
    { key: "cliente", header: "Cliente", render: (v) => v.cliente.nombreCompleto },
    { key: "vendedor", header: "Vendedor", render: (v) => v.vendedor.nombreCompleto },
    { key: "total", header: "Total", align: "right", render: (v) => `Bs ${v.total}` },
  ];

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1>Ventas</h1>
        <Button onClick={() => navigate("/ventas/nueva")}>Nueva venta</Button>
      </div>

      <Card>
        {loading && <SkeletonTable columns={4} />}
        {error && !loading && (
          <p role="alert" className={styles.error}>
            {extraerMensajeError(error)}
          </p>
        )}
        {!loading && !error && ventas.length === 0 && (
          <EmptyState
            title="Aún no registraste ventas"
            description="Creá la primera desde el catálogo de productos."
            action={<Button onClick={() => navigate("/ventas/nueva")}>Nueva venta</Button>}
          />
        )}
        {!loading && !error && ventas.length > 0 && (
          <Table
            columns={columns}
            rows={ventas}
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
