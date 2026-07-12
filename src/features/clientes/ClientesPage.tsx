import { useState } from "react";
import { Button } from "../../components/Button";
import { Card } from "../../components/Card";
import { EmptyState } from "../../components/EmptyState";
import { SkeletonTable } from "../../components/Skeleton";
import { Table } from "../../components/Table";
import type { TableColumn } from "../../components/Table";
import { Modal } from "../../components/Modal";
import { useToast } from "../../components/Toast";
import { useClientes } from "./hooks";
import { ClienteForm } from "./ClienteForm";
import type { ClientesQuery } from "../../graphql/generated/graphql";
import { extraerMensajeError } from "../../graphql/errors";
import styles from "./ClientesPage.module.css";

type Cliente = ClientesQuery["clientes"][number];

export function ClientesPage() {
  const { data, loading, error } = useClientes(true);
  const [modalAbierto, setModalAbierto] = useState(false);
  const { showToast } = useToast();

  const clientes = data?.clientes ?? [];

  const columns: TableColumn<Cliente>[] = [
    { key: "nombre", header: "Nombre", render: (c) => c.nombreCompleto },
    { key: "correo", header: "Correo", render: (c) => c.correo },
    { key: "telefono", header: "Teléfono", render: (c) => c.telefono },
    { key: "direccion", header: "Dirección", render: (c) => c.direccion },
  ];

  function handleSuccess() {
    setModalAbierto(false);
    showToast("Cliente creado correctamente.", "success");
  }

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1>Clientes</h1>
        <Button onClick={() => setModalAbierto(true)}>Nuevo cliente</Button>
      </div>

      <Card>
        {loading && <SkeletonTable columns={4} />}
        {error && !loading && (
          <p role="alert" className={styles.error}>
            {extraerMensajeError(error)}
          </p>
        )}
        {!loading && !error && clientes.length === 0 && (
          <EmptyState
            title="Todavía no registraste clientes"
            description="Creá el primer cliente para empezar a registrar ventas."
            action={<Button onClick={() => setModalAbierto(true)}>Nuevo cliente</Button>}
          />
        )}
        {!loading && !error && clientes.length > 0 && (
          <Table columns={columns} rows={clientes} getRowKey={(c) => c.idCliente} />
        )}
      </Card>

      <Modal open={modalAbierto} onClose={() => setModalAbierto(false)} title="Nuevo cliente">
        <ClienteForm onSuccess={handleSuccess} />
      </Modal>
    </div>
  );
}
