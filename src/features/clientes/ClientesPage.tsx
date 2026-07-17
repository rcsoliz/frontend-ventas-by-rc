import { useState } from "react";
import { useLocation } from "react-router-dom";
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
import { IconPlus, IconSearch, IconUser } from "../../components/icons";
import { useConfirmacionInline } from "../../hooks/useConfirmacionInline";
import { useOrdenamiento, ordenarPor } from "../../hooks/useOrdenamiento";
import { useAuth } from "../auth/AuthContext";
import { esAdministrador } from "../auth/grupos";
import { useCambiarEstadoCliente, useClientes } from "./hooks";
import { ClienteForm } from "./ClienteForm";
import type { ClientesQuery } from "../../graphql/generated/graphql";
import { extraerMensajeError } from "../../graphql/errors";
import styles from "./ClientesPage.module.css";

type Cliente = ClientesQuery["clientes"][number];

const TAMANO_PAGINA = 8;

function obtenerValorCliente(c: Cliente, key: string): string {
  switch (key) {
    case "nombre":
      return c.nombreCompleto;
    case "correo":
      return c.correo;
    case "telefono":
      return c.telefono;
    case "direccion":
      return c.direccion;
    default:
      return "";
  }
}

export function ClientesPage() {
  const location = useLocation();
  const [alcance, setAlcance] = useState<"activos" | "todos">("activos");
  const { data, loading, error } = useClientes(alcance === "activos");
  const { vendedor } = useAuth();
  const puedeEditarClientes = esAdministrador(vendedor);
  const [modalAbierto, setModalAbierto] = useState(false);
  const [clienteEditando, setClienteEditando] = useState<Cliente | null>(null);
  // Llega prefiltrado cuando se navega desde un resultado del buscador general (ver GlobalSearch).
  const [busqueda, setBusqueda] = useState(
    () => (location.state as { busqueda?: string } | null)?.busqueda ?? ""
  );
  const [pagina, setPagina] = useState(1);
  const { showToast } = useToast();
  const [cambiarEstadoCliente] = useCambiarEstadoCliente();
  const { idConfirmando, solicitar } = useConfirmacionInline();
  const { sortKey, sortDirection, alternarOrden } = useOrdenamiento();

  const clientes = data?.clientes ?? [];
  const clientesFiltrados = clientes.filter((c) =>
    c.nombreCompleto.toLowerCase().includes(busqueda.trim().toLowerCase())
  );
  const clientesOrdenados = ordenarPor(clientesFiltrados, sortKey, sortDirection, obtenerValorCliente);
  const clientesPagina = paginar(clientesOrdenados, pagina, TAMANO_PAGINA);

  function abrirNuevo() {
    setClienteEditando(null);
    setModalAbierto(true);
  }

  function abrirEdicion(cliente: Cliente) {
    setClienteEditando(cliente);
    setModalAbierto(true);
  }

  async function alternarEstado(cliente: Cliente) {
    try {
      await cambiarEstadoCliente({
        variables: { idCliente: cliente.idCliente, estado: !cliente.estado },
      });
      showToast(
        cliente.estado
          ? `"${cliente.nombreCompleto}" fue desactivado.`
          : `"${cliente.nombreCompleto}" fue activado.`,
        "success"
      );
    } catch (error) {
      showToast(extraerMensajeError(error), "error");
    }
  }

  const columns: TableColumn<Cliente>[] = [
    {
      key: "nombre",
      header: "Nombre",
      render: (c) => (
        <div className={styles.clienteCelda}>
          <span className={styles.clienteIcono} aria-hidden="true">
            <IconUser />
          </span>
          <span>{c.nombreCompleto}</span>
        </div>
      ),
      sortable: true,
    },
    {
      key: "correo",
      header: "Correo",
      render: (c) => (
        <span className={styles.truncar} title={c.correo}>
          {c.correo}
        </span>
      ),
      sortable: true,
    },
    { key: "telefono", header: "Teléfono", render: (c) => c.telefono, sortable: true },
    {
      key: "direccion",
      header: "Dirección",
      render: (c) => (
        <span className={styles.truncar} title={c.direccion}>
          {c.direccion}
        </span>
      ),
      sortable: true,
    },
    ...(alcance === "todos"
      ? [
          {
            key: "estado",
            header: "Estado",
            render: (c: Cliente) => (
              <Badge variant={c.estado ? "success" : "muted"}>
                {c.estado ? "Activo" : "Inactivo"}
              </Badge>
            ),
          } satisfies TableColumn<Cliente>,
        ]
      : []),
    ...(puedeEditarClientes
      ? [
          {
            key: "acciones",
            header: "Acciones",
            sticky: true,
            render: (c: Cliente) => (
              <div className={styles.acciones}>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    abrirEdicion(c);
                  }}
                >
                  Editar
                </Button>
                <Button
                  variant={c.estado ? "danger" : "success"}
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    solicitar(c.idCliente, () => alternarEstado(c));
                  }}
                >
                  {idConfirmando === c.idCliente
                    ? "¿Confirmar?"
                    : c.estado
                      ? "Desactivar"
                      : "Activar"}
                </Button>
              </div>
            ),
          } satisfies TableColumn<Cliente>,
        ]
      : []),
  ];

  function handleSuccess() {
    setModalAbierto(false);
    showToast(
      clienteEditando ? "Cliente actualizado correctamente." : "Cliente creado correctamente.",
      "success"
    );
    setClienteEditando(null);
  }

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div className={styles.headerText}>
          <h1>Clientes</h1>
          <p className={styles.description}>
            Gestiona la información de contacto y el estado de tus clientes.
          </p>
        </div>
        <Button onClick={abrirNuevo}>
          <IconPlus />
          Nuevo cliente
        </Button>
      </div>

      {!loading && !error && clientes.length > 0 && (
        <Card className={styles.filtersCard}>
          <div className={styles.filters}>
            <Input
              label="Buscar"
              placeholder="Nombre del cliente..."
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
        {!loading && !error && clientes.length === 0 && (
          <EmptyState
            title="Todavía no registraste clientes"
            description="Creá el primer cliente para empezar a registrar ventas."
            action={<Button onClick={abrirNuevo}>Nuevo cliente</Button>}
          />
        )}
        {!loading && !error && clientes.length > 0 && clientesFiltrados.length === 0 && (
          <EmptyState
            title="No se encontraron clientes"
            description="Probá con otro término de búsqueda."
            action={
              <Button variant="secondary" onClick={() => setBusqueda("")}>
                Limpiar búsqueda
              </Button>
            }
          />
        )}
        {clientesPagina.length > 0 && (
          <>
            <Table
              columns={columns}
              rows={clientesPagina}
              getRowKey={(c) => c.idCliente}
              sortKey={sortKey}
              sortDirection={sortDirection}
              onSortChange={(key) => {
                alternarOrden(key);
                setPagina(1);
              }}
            />
            <Pagination
              page={pagina}
              totalItems={clientesFiltrados.length}
              pageSize={TAMANO_PAGINA}
              onPageChange={setPagina}
            />
          </>
        )}
      </Card>

      <Modal
        open={modalAbierto}
        onClose={() => setModalAbierto(false)}
        title={clienteEditando ? "Editar cliente" : "Nuevo cliente"}
      >
        <ClienteForm
          cliente={clienteEditando ?? undefined}
          onSuccess={handleSuccess}
          onCancel={() => setModalAbierto(false)}
        />
      </Modal>
    </div>
  );
}
