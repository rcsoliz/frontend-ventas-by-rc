import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../../../components/Button";
import { Card } from "../../../components/Card";
import { EmptyState } from "../../../components/EmptyState";
import { Input } from "../../../components/Input";
import { IconSearch } from "../../../components/icons";
import { KebabMenu } from "../../../components/KebabMenu";
import { Select } from "../../../components/Select";
import { SkeletonTable } from "../../../components/Skeleton";
import { Table } from "../../../components/Table";
import type { TableColumn } from "../../../components/Table";
import { Pagination, paginar } from "../../../components/Pagination";
import { useAuth } from "../../auth/AuthContext";
import { useVentas } from "../hooks";
import { VentasTabs } from "../VentasTabs";
import type { VentasQuery } from "../../../graphql/generated/graphql";
import { extraerMensajeError } from "../../../graphql/errors";
import { formatearMoneda } from "../../../format";
import { useOrdenamiento, ordenarPor } from "../../../hooks/useOrdenamiento";
import styles from "./HistorialVentasPage.module.css";

type Venta = VentasQuery["ventas"][number];

const TAMANO_PAGINA = 8;

function obtenerValorVenta(v: Venta, key: string): string | number {
  switch (key) {
    case "fecha":
      return v.fechaVenta ? new Date(String(v.fechaVenta)).getTime() : 0;
    case "cliente":
      return v.cliente.nombreCompleto;
    case "vendedor":
      return v.vendedor.nombreCompleto;
    case "total":
      return Number(v.total);
    default:
      return "";
  }
}

export function HistorialVentasPage() {
  const navigate = useNavigate();
  const { vendedor } = useAuth();
  const { data, loading, error, refetch } = useVentas();
  const ventas = data?.ventas ?? [];

  const [busqueda, setBusqueda] = useState("");
  const [alcance, setAlcance] = useState<"todas" | "mias">("todas");
  const [pagina, setPagina] = useState(1);
  const { sortKey, sortDirection, alternarOrden } = useOrdenamiento();

  const ventasFiltradas = ventas.filter((v) => {
    if (alcance === "mias" && v.vendedor.idVendedor !== vendedor?.id) return false;
    const termino = busqueda.trim().toLowerCase();
    if (!termino) return true;
    return (
      v.cliente.nombreCompleto.toLowerCase().includes(termino) ||
      v.vendedor.nombreCompleto.toLowerCase().includes(termino)
    );
  });
  const ventasOrdenadas = ordenarPor(ventasFiltradas, sortKey, sortDirection, obtenerValorVenta);
  const ventasPagina = paginar(ventasOrdenadas, pagina, TAMANO_PAGINA);

  const columns: TableColumn<Venta>[] = [
    { key: "fecha", header: "Fecha", render: (v) => formatearFecha(v.fechaVenta), sortable: true },
    { key: "cliente", header: "Cliente", render: (v) => v.cliente.nombreCompleto, sortable: true },
    {
      key: "vendedor",
      header: "Vendedor",
      render: (v) => <span className={styles.vendedor}>{v.vendedor.nombreCompleto}</span>,
      sortable: true,
    },
    {
      key: "total",
      header: "Total",
      align: "right",
      render: (v) => formatearMoneda(v.total),
      sortable: true,
    },
    {
      key: "acciones",
      header: "Acciones",
      align: "right",
      sticky: true,
      render: (v) => (
        <KebabMenu
          label={`Acciones para la venta de ${v.cliente.nombreCompleto}`}
          actions={[{ label: "Ver detalle", onClick: () => navigate(`/ventas/${v.idVenta}`) }]}
        />
      ),
    },
  ];

  function limpiarFiltros() {
    setBusqueda("");
    setAlcance("todas");
    setPagina(1);
  }

  return (
    <div className={styles.page}>
      <VentasTabs />

      {!loading && !error && ventas.length > 0 && (
        <Card className={styles.filtersCard}>
          <div className={styles.filtersBlock}>
            <span className={styles.filtersLabel}>Filtrar por</span>
            <div className={styles.filters}>
              <Input
                label="Buscar"
                placeholder="Cliente o vendedor..."
                prefix={<IconSearch />}
                value={busqueda}
                onChange={(e) => {
                  setBusqueda(e.target.value);
                  setPagina(1);
                }}
              />
              <Select
                label="Alcance"
                value={alcance}
                onChange={(e) => {
                  setAlcance(e.target.value as "todas" | "mias");
                  setPagina(1);
                }}
              >
                <option value="todas">Todas las ventas</option>
                <option value="mias">Solo mis ventas</option>
              </Select>
            </div>
          </div>
        </Card>
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
        {ventasPagina.length > 0 && (
          <>
            <Table
              columns={columns}
              rows={ventasPagina}
              getRowKey={(v) => v.idVenta}
              onRowClick={(v) => navigate(`/ventas/${v.idVenta}`)}
              sortKey={sortKey}
              sortDirection={sortDirection}
              onSortChange={(key) => {
                alternarOrden(key);
                setPagina(1);
              }}
            />
            <Pagination
              page={pagina}
              totalItems={ventasFiltradas.length}
              pageSize={TAMANO_PAGINA}
              onPageChange={setPagina}
            />
          </>
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
