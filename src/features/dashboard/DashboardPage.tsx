import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../../components/Button";
import { Card } from "../../components/Card";
import { EmptyState } from "../../components/EmptyState";
import { Select } from "../../components/Select";
import { Skeleton } from "../../components/Skeleton";
import { Table } from "../../components/Table";
import type { TableColumn } from "../../components/Table";
import { useVentas } from "../ventas/hooks";
import { extraerMensajeError } from "../../graphql/errors";
import { formatearMoneda } from "../../format";
import { RANGOS, construirDashboardData } from "./aggregate";
import type { RangoFecha, PuntoIngreso, ProductoTop, VendedorVentas, Venta } from "./aggregate";
import { construirCsvIngresosPorDia, descargarArchivo } from "./exportCsv";
import { StatTile } from "./charts/StatTile";
import { LineChart } from "./charts/LineChart";
import { BarChart } from "./charts/BarChart";
import { ChartCard } from "./charts/ChartCard";
import { RecentSales } from "./charts/RecentSales";
import { InsightCard } from "./charts/InsightCard";
import { IconBillete, IconCarrito, IconTicket, IconCaja, IconDescarga } from "./icons";
import styles from "./DashboardPage.module.css";

function formatearFechaCorta(fecha: string): string {
  return new Date(`${fecha}T00:00:00`).toLocaleDateString("es-BO", { day: "2-digit", month: "short" });
}

function formatearNumero(valor: number): string {
  return Math.round(valor).toLocaleString("es-BO");
}

const SIN_VENTAS: Venta[] = [];

export function DashboardPage() {
  const navigate = useNavigate();
  const { data, loading, error, refetch } = useVentas();
  const ventas = data?.ventas ?? SIN_VENTAS;

  const [rango, setRango] = useState<RangoFecha>("30d");
  const [vistaIngresos, setVistaIngresos] = useState(false);
  const [vistaProductos, setVistaProductos] = useState(false);
  const [vistaVendedores, setVistaVendedores] = useState(false);

  const dashboard = useMemo(() => construirDashboardData(ventas, rango), [ventas, rango]);

  function exportarIngresos() {
    const csv = construirCsvIngresosPorDia(dashboard.ingresosPorDia);
    descargarArchivo(`ingresos-${rango}.csv`, csv);
  }

  const columnasIngresos: TableColumn<PuntoIngreso>[] = [
    { key: "fecha", header: "Fecha", render: (p) => formatearFechaCorta(p.fecha) },
    { key: "total", header: "Ingresos", align: "right", render: (p) => formatearMoneda(p.total) },
  ];
  const columnasProductos: TableColumn<ProductoTop>[] = [
    { key: "nombre", header: "Producto", render: (p) => p.nombre },
    { key: "cantidad", header: "Cantidad", align: "right", render: (p) => formatearNumero(p.cantidad) },
    { key: "ingresos", header: "Ingresos", align: "right", render: (p) => formatearMoneda(p.ingresos) },
  ];
  const columnasVendedores: TableColumn<VendedorVentas>[] = [
    { key: "nombre", header: "Vendedor", render: (v) => v.nombre },
    { key: "cantidadVentas", header: "Ventas", align: "right", render: (v) => formatearNumero(v.cantidadVentas) },
    { key: "total", header: "Total", align: "right", render: (v) => formatearMoneda(v.total) },
  ];

  return (
    <div className={styles.page}>
      <div className={styles.headerRow}>
        <div className={styles.header}>
          <h1>Panel</h1>
          <nav className={styles.breadcrumb} aria-label="Ruta de navegación">
            <span>Gestión</span>
            <span aria-hidden="true" className={styles.breadcrumbSep}>
              ›
            </span>
            <span className={styles.breadcrumbCurrent}>Resumen de Ventas</span>
          </nav>
        </div>

        {!loading && !error && ventas.length > 0 && (
          <div className={styles.filters}>
            <Select
              label="Período"
              value={rango}
              onChange={(e) => setRango(e.target.value as RangoFecha)}
            >
              {RANGOS.map((r) => (
                <option key={r.value} value={r.value}>
                  {r.label}
                </option>
              ))}
            </Select>
            <Button
              variant="secondary"
              onClick={exportarIngresos}
              disabled={dashboard.ingresosPorDia.length === 0}
            >
              <IconDescarga className={styles.buttonIcon} />
              Exportar
            </Button>
          </div>
        )}
      </div>

      {loading && (
        <div className={styles.skeletonGrid}>
          <div className={styles.kpiGrid}>
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} height={78} />
            ))}
          </div>
          <Skeleton height={240} />
          <div className={styles.chartsRow}>
            <Skeleton height={200} />
            <Skeleton height={200} />
          </div>
        </div>
      )}

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
          title="Aún no hay datos para mostrar"
          description="Registrá tu primera venta para ver ingresos, productos y vendedores acá."
          action={<Button onClick={() => navigate("/ventas/nueva")}>Nueva venta</Button>}
        />
      )}

      {!loading && !error && ventas.length > 0 && dashboard.ventasEnRango.length === 0 && (
        <EmptyState
          title="No hay ventas en el período seleccionado"
          description="Probá con un rango más amplio."
          action={
            <Button variant="secondary" onClick={() => setRango("todo")}>
              Ver todo el historial
            </Button>
          }
        />
      )}

      {!loading && !error && dashboard.ventasEnRango.length > 0 && (
        <>
          <div className={styles.kpiGrid}>
            <StatTile
              testId="kpi-ingresos-totales"
              label="Ingresos totales"
              value={formatearMoneda(dashboard.kpis.ingresosTotales)}
              delta={dashboard.kpis.deltaIngresos}
              icon={<IconBillete />}
            />
            <StatTile
              testId="kpi-cantidad-ventas"
              label="Ventas registradas"
              value={formatearNumero(dashboard.kpis.cantidadVentas)}
              icon={<IconCarrito />}
            />
            <StatTile
              testId="kpi-ticket-promedio"
              label="Ticket promedio"
              value={formatearMoneda(dashboard.kpis.ticketPromedio)}
              icon={<IconTicket />}
            />
            <StatTile
              testId="kpi-unidades-vendidas"
              label="Unidades vendidas"
              value={formatearNumero(dashboard.kpis.unidadesVendidas)}
              icon={<IconCaja />}
            />
          </div>

          <ChartCard
            title="Ingresos por día"
            isTableView={vistaIngresos}
            onToggleView={() => setVistaIngresos((v) => !v)}
          >
            {vistaIngresos ? (
              <Table
                columns={columnasIngresos}
                rows={dashboard.ingresosPorDia}
                getRowKey={(p) => p.fecha}
              />
            ) : (
              <LineChart
                points={dashboard.ingresosPorDia.map((p) => ({ x: p.fecha, value: p.total }))}
                formatValue={formatearMoneda}
                formatX={formatearFechaCorta}
              />
            )}
          </ChartCard>

          <div
            className={[styles.secondaryGrid, !dashboard.insightTopProducto && styles.secondaryGridSingle]
              .filter(Boolean)
              .join(" ")}
          >
            <Card>
              <h2 className={styles.cardTitle}>Ventas Recientes</h2>
              <RecentSales ventas={dashboard.ventasRecientes} formatearMoneda={formatearMoneda} />
            </Card>

            {dashboard.insightTopProducto && (
              <InsightCard
                nombreProducto={dashboard.insightTopProducto.nombre}
                porcentaje={dashboard.insightTopProducto.porcentaje}
              />
            )}
          </div>

          <div className={styles.chartsRow}>
            <ChartCard
              title="Productos más vendidos"
              isTableView={vistaProductos}
              onToggleView={() => setVistaProductos((v) => !v)}
            >
              {vistaProductos ? (
                <Table
                  columns={columnasProductos}
                  rows={dashboard.topProductos}
                  getRowKey={(p) => p.idProducto}
                />
              ) : dashboard.topProductos.length > 0 ? (
                <BarChart
                  items={dashboard.topProductos.map((p) => ({
                    id: p.idProducto,
                    label: p.nombre,
                    value: p.ingresos,
                    secondary: `${formatearNumero(p.cantidad)} unidades`,
                  }))}
                  formatValue={formatearMoneda}
                />
              ) : (
                <EmptyState title="Sin ventas de productos en este período" />
              )}
            </ChartCard>

            <ChartCard
              title="Ventas por vendedor"
              isTableView={vistaVendedores}
              onToggleView={() => setVistaVendedores((v) => !v)}
            >
              {vistaVendedores ? (
                <Table
                  columns={columnasVendedores}
                  rows={dashboard.ventasPorVendedor}
                  getRowKey={(v) => v.idVendedor}
                />
              ) : dashboard.ventasPorVendedor.length > 0 ? (
                <BarChart
                  items={dashboard.ventasPorVendedor.map((v) => ({
                    id: v.idVendedor,
                    label: v.nombre,
                    value: v.total,
                    secondary: `${formatearNumero(v.cantidadVentas)} ventas`,
                  }))}
                  formatValue={formatearMoneda}
                />
              ) : (
                <EmptyState title="Sin ventas en este período" />
              )}
            </ChartCard>
          </div>
        </>
      )}

      {!loading && !error && ventas.length > 0 && (
        <button
          type="button"
          className={styles.fab}
          aria-label="Nueva venta"
          onClick={() => navigate("/ventas/nueva")}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
            <path d="M12 5v14M5 12h14" />
          </svg>
          <span className={styles.fabTooltip} aria-hidden="true">
            Nueva Venta
          </span>
        </button>
      )}

      <footer className={styles.footer}>
        © {new Date().getFullYear()} Ventas - Sistema de Gestión Comercial. Todos los derechos reservados.
      </footer>
    </div>
  );
}
