import { useState } from "react";
import { Badge } from "../../components/Badge";
import { Button } from "../../components/Button";
import { Card } from "../../components/Card";
import { EmptyState } from "../../components/EmptyState";
import { Input } from "../../components/Input";
import { Select } from "../../components/Select";
import { SkeletonTable } from "../../components/Skeleton";
import { Table } from "../../components/Table";
import type { TableColumn } from "../../components/Table";
import { Modal } from "../../components/Modal";
import { Pagination, paginar } from "../../components/Pagination";
import { useToast } from "../../components/Toast";
import { IconBox, IconPlus, IconSearch } from "../../components/icons";
import { useConfirmacionInline } from "../../hooks/useConfirmacionInline";
import { useOrdenamiento, ordenarPor } from "../../hooks/useOrdenamiento";
import { useAuth } from "../auth/AuthContext";
import { esAdministrador } from "../auth/grupos";
import { formatearMoneda } from "../../format";
import { useCambiarEstadoProducto, useProductos } from "./hooks";
import { ProductoForm } from "./ProductoForm";
import type { ProductosQuery } from "../../graphql/generated/graphql";
import { extraerMensajeError } from "../../graphql/errors";
import styles from "./ProductosPage.module.css";

type Producto = ProductosQuery["productos"][number];

const TAMANO_PAGINA = 8;

/**
 * El schema de GraphQL no expone un campo de stock mínimo por producto (ver
 * productos.graphql) — se usan dos umbrales fijos, nombrados, en vez de un
 * número mágico repetido. Ajustar acá si el backend llega a exponer un valor
 * configurable por producto.
 */
const UMBRAL_STOCK_CRITICO = 10;
const UMBRAL_STOCK_BAJO = 20;

function obtenerVarianteStock(stock: number): "success" | "warning" | "danger" {
  if (stock < UMBRAL_STOCK_CRITICO) return "danger";
  if (stock < UMBRAL_STOCK_BAJO) return "warning";
  return "success";
}

function obtenerValorProducto(p: Producto, key: string): string | number {
  switch (key) {
    case "nombre":
      return p.nombreProducto;
    case "descripcion":
      return p.descripcion;
    case "precio":
      return Number(p.precio);
    case "stock":
      return p.stock;
    default:
      return "";
  }
}

export function ProductosPage() {
  const [alcance, setAlcance] = useState<"activos" | "todos">("activos");
  const { data, loading, error } = useProductos(alcance === "activos");
  const { vendedor } = useAuth();
  const puedeGestionarProductos = esAdministrador(vendedor);
  const [modalAbierto, setModalAbierto] = useState(false);
  const [productoEditando, setProductoEditando] = useState<Producto | null>(null);
  const [busqueda, setBusqueda] = useState("");
  const [pagina, setPagina] = useState(1);
  const { showToast } = useToast();
  const [cambiarEstadoProducto] = useCambiarEstadoProducto();
  const { idConfirmando, solicitar } = useConfirmacionInline();
  const { sortKey, sortDirection, alternarOrden } = useOrdenamiento();

  const productos = data?.productos ?? [];
  const productosFiltrados = productos.filter((p) =>
    p.nombreProducto.toLowerCase().includes(busqueda.trim().toLowerCase())
  );
  const productosOrdenados = ordenarPor(productosFiltrados, sortKey, sortDirection, obtenerValorProducto);
  const productosPagina = paginar(productosOrdenados, pagina, TAMANO_PAGINA);

  function abrirNuevo() {
    setProductoEditando(null);
    setModalAbierto(true);
  }

  function abrirEdicion(producto: Producto) {
    setProductoEditando(producto);
    setModalAbierto(true);
  }

  async function alternarEstado(producto: Producto) {
    try {
      await cambiarEstadoProducto({
        variables: { idProducto: producto.idProducto, estado: !producto.estado },
      });
      showToast(
        producto.estado
          ? `"${producto.nombreProducto}" fue desactivado.`
          : `"${producto.nombreProducto}" fue activado.`,
        "success"
      );
    } catch (error) {
      showToast(extraerMensajeError(error), "error");
    }
  }

  const columns: TableColumn<Producto>[] = [
    {
      key: "nombre",
      header: "Producto",
      render: (p) => (
        <div className={styles.productoCelda}>
          <span className={styles.productoIcono} aria-hidden="true">
            <IconBox />
          </span>
          <span>{p.nombreProducto}</span>
        </div>
      ),
      sortable: true,
    },
    {
      key: "descripcion",
      header: "Descripción",
      render: (p) => (
        <span className={styles.descripcionCelda} title={p.descripcion}>
          {p.descripcion}
        </span>
      ),
      sortable: true,
    },
    {
      key: "precio",
      header: "Precio",
      align: "right",
      render: (p) => formatearMoneda(p.precio),
      sortable: true,
    },
    {
      key: "stock",
      header: "Stock",
      align: "right",
      render: (p) => <Badge variant={obtenerVarianteStock(p.stock)}>{p.stock} unid.</Badge>,
      sortable: true,
    },
    ...(alcance === "todos"
      ? [
          {
            key: "estado",
            header: "Estado",
            render: (p: Producto) => (
              <Badge variant={p.estado ? "success" : "muted"}>
                {p.estado ? "Activo" : "Inactivo"}
              </Badge>
            ),
          } satisfies TableColumn<Producto>,
        ]
      : []),
    ...(puedeGestionarProductos
      ? [
          {
            key: "acciones",
            header: "Acciones",
            sticky: true,
            render: (p: Producto) => (
              <div className={styles.acciones}>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    abrirEdicion(p);
                  }}
                >
                  Editar
                </Button>
                <Button
                  variant={p.estado ? "danger" : "success"}
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    solicitar(p.idProducto, () => alternarEstado(p));
                  }}
                >
                  {idConfirmando === p.idProducto
                    ? "¿Confirmar?"
                    : p.estado
                      ? "Desactivar"
                      : "Activar"}
                </Button>
              </div>
            ),
          } satisfies TableColumn<Producto>,
        ]
      : []),
  ];

  function handleSuccess() {
    setModalAbierto(false);
    showToast(
      productoEditando ? "Producto actualizado correctamente." : "Producto creado correctamente.",
      "success"
    );
    setProductoEditando(null);
  }

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div className={styles.headerText}>
          <h1>Productos</h1>
          <p className={styles.description}>
            Gestiona el inventario, precios y estados de tus artículos comerciales.
          </p>
        </div>
        {puedeGestionarProductos && (
          <Button onClick={abrirNuevo}>
            <IconPlus />
            Nuevo producto
          </Button>
        )}
      </div>

      {!loading && !error && productos.length > 0 && (
        <Card className={styles.filtersCard}>
          <div className={styles.filters}>
            <Input
              label="Buscar"
              placeholder="Nombre del producto..."
              prefix={<IconSearch />}
              value={busqueda}
              onChange={(e) => {
                setBusqueda(e.target.value);
                setPagina(1);
              }}
            />
            <Select
              label="Mostrar"
              value={alcance}
              onChange={(e) => {
                setAlcance(e.target.value as "activos" | "todos");
                setPagina(1);
              }}
            >
              <option value="activos">Solo activos</option>
              <option value="todos">Todos (incluye inactivos)</option>
            </Select>
          </div>
        </Card>
      )}

      <Card>
        {loading && <SkeletonTable columns={4} />}
        {error && !loading && (
          <p role="alert" className={styles.error}>
            {extraerMensajeError(error)}
          </p>
        )}
        {!loading && !error && productos.length === 0 && (
          <EmptyState
            title="Todavía no hay productos en el catálogo"
            description={
              puedeGestionarProductos
                ? "Creá el primer producto para poder registrar ventas."
                : "Pedile a un administrador que cargue productos al catálogo."
            }
            action={puedeGestionarProductos ? <Button onClick={abrirNuevo}>Nuevo producto</Button> : undefined}
          />
        )}
        {!loading && !error && productos.length > 0 && productosFiltrados.length === 0 && (
          <EmptyState
            title="No se encontraron productos"
            description="Probá con otro término de búsqueda."
            action={
              <Button variant="secondary" onClick={() => setBusqueda("")}>
                Limpiar búsqueda
              </Button>
            }
          />
        )}
        {productosPagina.length > 0 && (
          <>
            <Table
              columns={columns}
              rows={productosPagina}
              getRowKey={(p) => p.idProducto}
              sortKey={sortKey}
              sortDirection={sortDirection}
              onSortChange={(key) => {
                alternarOrden(key);
                setPagina(1);
              }}
            />
            <Pagination
              page={pagina}
              totalItems={productosFiltrados.length}
              pageSize={TAMANO_PAGINA}
              onPageChange={setPagina}
            />
          </>
        )}
      </Card>

      {puedeGestionarProductos && (
        <Modal
          open={modalAbierto}
          onClose={() => setModalAbierto(false)}
          title={productoEditando ? "Editar producto" : "Nuevo producto"}
        >
          <ProductoForm
            producto={
              productoEditando
                ? {
                    idProducto: productoEditando.idProducto,
                    nombreProducto: productoEditando.nombreProducto,
                    descripcion: productoEditando.descripcion,
                    precio: String(productoEditando.precio),
                    stock: productoEditando.stock,
                  }
                : undefined
            }
            onSuccess={handleSuccess}
            onCancel={() => setModalAbierto(false)}
            nombresExistentes={productos
              .filter((p) => p.idProducto !== productoEditando?.idProducto)
              .map((p) => p.nombreProducto)}
          />
        </Modal>
      )}
    </div>
  );
}
