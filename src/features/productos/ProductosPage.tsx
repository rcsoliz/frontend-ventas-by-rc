import { useState } from "react";
import { Button } from "../../components/Button";
import { Card } from "../../components/Card";
import { EmptyState } from "../../components/EmptyState";
import { SkeletonTable } from "../../components/Skeleton";
import { Table } from "../../components/Table";
import type { TableColumn } from "../../components/Table";
import { Modal } from "../../components/Modal";
import { useToast } from "../../components/Toast";
import { useAuth } from "../auth/AuthContext";
import { esAdministrador } from "../auth/grupos";
import { useProductos } from "./hooks";
import { ProductoForm } from "./ProductoForm";
import type { ProductosQuery } from "../../graphql/generated/graphql";
import { extraerMensajeError } from "../../graphql/errors";
import styles from "./ProductosPage.module.css";

type Producto = ProductosQuery["productos"][number];

export function ProductosPage() {
  const { data, loading, error } = useProductos(true);
  const { vendedor } = useAuth();
  const puedeCrearProducto = esAdministrador(vendedor);
  const [modalAbierto, setModalAbierto] = useState(false);
  const { showToast } = useToast();

  const productos = data?.productos ?? [];

  const columns: TableColumn<Producto>[] = [
    { key: "nombre", header: "Producto", render: (p) => p.nombreProducto },
    { key: "descripcion", header: "Descripción", render: (p) => p.descripcion },
    {
      key: "precio",
      header: "Precio",
      align: "right",
      render: (p) => `Bs ${p.precio}`,
    },
    { key: "stock", header: "Stock", align: "right", render: (p) => p.stock },
  ];

  function handleSuccess() {
    setModalAbierto(false);
    showToast("Producto creado correctamente.", "success");
  }

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1>Productos</h1>
        {puedeCrearProducto && (
          <Button onClick={() => setModalAbierto(true)}>Nuevo producto</Button>
        )}
      </div>

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
              puedeCrearProducto
                ? "Creá el primer producto para poder registrar ventas."
                : "Pedile a un administrador que cargue productos al catálogo."
            }
            action={
              puedeCrearProducto ? (
                <Button onClick={() => setModalAbierto(true)}>Nuevo producto</Button>
              ) : undefined
            }
          />
        )}
        {!loading && !error && productos.length > 0 && (
          <Table columns={columns} rows={productos} getRowKey={(p) => p.idProducto} />
        )}
      </Card>

      {puedeCrearProducto && (
        <Modal open={modalAbierto} onClose={() => setModalAbierto(false)} title="Nuevo producto">
          <ProductoForm onSuccess={handleSuccess} />
        </Modal>
      )}
    </div>
  );
}
