import { useParams, Link } from "react-router-dom";
import { Card } from "../../../components/Card";
import { Table } from "../../../components/Table";
import type { TableColumn } from "../../../components/Table";
import { SkeletonTable } from "../../../components/Skeleton";
import { useVenta } from "../hooks";
import type { VentaQuery } from "../../../graphql/generated/graphql";
import { extraerMensajeError } from "../../../graphql/errors";
import styles from "./DetalleVentaPage.module.css";

type Detalle = NonNullable<VentaQuery["venta"]>["detalles"][number];

export function DetalleVentaPage() {
  const { idVenta = "" } = useParams<{ idVenta: string }>();
  const { data, loading, error } = useVenta(idVenta);
  const venta = data?.venta;

  const columns: TableColumn<Detalle>[] = [
    { key: "producto", header: "Producto", render: (d) => d.producto.nombreProducto },
    { key: "cantidad", header: "Cantidad", align: "right", render: (d) => d.cantidad },
    {
      key: "precioUnitario",
      header: "Precio unitario",
      align: "right",
      render: (d) => `Bs ${d.precioUnitario}`,
    },
    { key: "subtotal", header: "Subtotal", align: "right", render: (d) => `Bs ${d.subtotal}` },
  ];

  return (
    <div className={styles.page}>
      <Link to="/ventas" className={styles.back}>
        ← Volver al historial
      </Link>
      <h1>Detalle de venta</h1>

      {loading && (
        <Card>
          <SkeletonTable rows={3} columns={4} />
        </Card>
      )}

      {error && !loading && (
        <Card>
          <p role="alert" className={styles.error}>
            {extraerMensajeError(error)}
          </p>
        </Card>
      )}

      {!loading && !error && !venta && (
        <Card>
          <p className={styles.error}>No se encontró la venta solicitada.</p>
        </Card>
      )}

      {venta && (
        <>
          <Card className={styles.summary}>
            <div>
              <span className={styles.label}>Cliente</span>
              <p>{venta.cliente.nombreCompleto}</p>
            </div>
            <div>
              <span className={styles.label}>Vendedor</span>
              <p>{venta.vendedor.nombreCompleto}</p>
            </div>
            <div>
              <span className={styles.label}>Fecha</span>
              <p>{formatearFecha(venta.fechaVenta)}</p>
            </div>
            <div>
              <span className={styles.label}>Total</span>
              <p className={styles.total}>Bs {String(venta.total)}</p>
            </div>
          </Card>

          <Card>
            <Table columns={columns} rows={venta.detalles} getRowKey={(d) => d.idDetalle ?? d.producto.idProducto} />
          </Card>

          {/* Fase 2 (facturación electrónica): reservado, sin implementar aún.
              Cuando exista facturaElectronica(idVenta) en el schema, acá va el
              badge de estado (pendiente/emitida/anulada/error), CUF y el link al PDF. */}
          <Card className={styles.facturacionPlaceholder}>
            <span className={styles.label}>Facturación electrónica</span>
            <p className={styles.placeholderText}>Disponible próximamente.</p>
          </Card>
        </>
      )}
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
