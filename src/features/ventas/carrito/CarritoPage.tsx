import { useState } from "react";
import type { FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../../../components/Button";
import { Card } from "../../../components/Card";
import { Select } from "../../../components/Select";
import { Input } from "../../../components/Input";
import { Table } from "../../../components/Table";
import type { TableColumn } from "../../../components/Table";
import { EmptyState } from "../../../components/EmptyState";
import { useToast } from "../../../components/Toast";
import { useClientes } from "../../clientes/hooks";
import { useProductos } from "../../productos/hooks";
import { useRegistrarVenta } from "../hooks";
import { useCarrito } from "./useCarrito";
import type { LineaCarrito } from "./useCarrito";
import { extraerMensajeError } from "../../../graphql/errors";
import styles from "./CarritoPage.module.css";

export function CarritoPage() {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const { data: clientesData, loading: clientesLoading } = useClientes(true);
  const { data: productosData, loading: productosLoading } = useProductos(true);
  const { lineas, agregarLinea, quitarLinea, vaciar, total } = useCarrito();
  const [registrarVenta, { loading: enviando }] = useRegistrarVenta();

  const [idCliente, setIdCliente] = useState("");
  const [idProducto, setIdProducto] = useState("");
  const [cantidad, setCantidad] = useState("1");
  const [errorEnvio, setErrorEnvio] = useState<string | null>(null);

  const clientes = clientesData?.clientes ?? [];
  const productos = productosData?.productos ?? [];

  function handleAgregarLinea(e: FormEvent) {
    e.preventDefault();
    const producto = productos.find((p) => p.idProducto === idProducto);
    const cantidadNum = Number(cantidad);
    if (!producto || cantidadNum <= 0) return;
    agregarLinea(producto, cantidadNum);
    setIdProducto("");
    setCantidad("1");
  }

  async function handleConfirmar() {
    setErrorEnvio(null);
    try {
      const { data } = await registrarVenta({
        variables: {
          datos: {
            idCliente,
            lineas: lineas.map((l) => ({
              idProducto: l.producto.idProducto,
              cantidad: l.cantidad,
            })),
          },
        },
      });
      if (data) {
        vaciar();
        showToast("Venta registrada correctamente.", "success");
        navigate(`/ventas/${data.registrarVenta.idVenta}`);
      }
    } catch (error) {
      setErrorEnvio(extraerMensajeError(error));
    }
  }

  const columns: TableColumn<LineaCarrito>[] = [
    { key: "producto", header: "Producto", render: (l) => l.producto.nombreProducto },
    { key: "cantidad", header: "Cantidad", align: "right", render: (l) => l.cantidad },
    {
      key: "subtotal",
      header: "Subtotal",
      align: "right",
      render: (l) => `Bs ${(Number(l.producto.precio) * l.cantidad).toFixed(2)}`,
    },
    {
      key: "acciones",
      header: "",
      render: (l) => (
        <Button variant="ghost" size="sm" onClick={() => quitarLinea(l.producto.idProducto)}>
          Quitar
        </Button>
      ),
    },
  ];

  const puedeConfirmar = idCliente !== "" && lineas.length > 0 && !enviando;

  return (
    <div className={styles.page}>
      <h1>Nueva venta</h1>

      <Card className={styles.section}>
        <Select
          label="Cliente"
          value={idCliente}
          onChange={(e) => setIdCliente(e.target.value)}
          disabled={clientesLoading}
        >
          <option value="">Seleccioná un cliente</option>
          {clientes.map((c) => (
            <option key={c.idCliente} value={c.idCliente}>
              {c.nombreCompleto}
            </option>
          ))}
        </Select>
      </Card>

      <Card className={styles.section}>
        <form onSubmit={handleAgregarLinea} className={styles.lineForm}>
          <Select
            label="Producto"
            value={idProducto}
            onChange={(e) => setIdProducto(e.target.value)}
            disabled={productosLoading}
          >
            <option value="">Seleccioná un producto</option>
            {productos.map((p) => (
              <option key={p.idProducto} value={p.idProducto}>
                {p.nombreProducto} (stock: {p.stock})
              </option>
            ))}
          </Select>
          <Input
            label="Cantidad"
            type="number"
            min="1"
            step="1"
            value={cantidad}
            onChange={(e) => setCantidad(e.target.value)}
          />
          <Button type="submit" variant="secondary" disabled={!idProducto}>
            Agregar
          </Button>
        </form>
      </Card>

      <Card className={styles.section}>
        {lineas.length === 0 ? (
          <EmptyState
            title="El carrito está vacío"
            description="Agregá al menos un producto para poder registrar la venta."
          />
        ) : (
          <>
            <Table columns={columns} rows={lineas} getRowKey={(l) => l.producto.idProducto} />
            <div className={styles.total}>Total: Bs {total.toFixed(2)}</div>
          </>
        )}
      </Card>

      {errorEnvio && (
        <p role="alert" className={styles.error}>
          {errorEnvio}
        </p>
      )}

      <div className={styles.actions}>
        <Button onClick={handleConfirmar} disabled={!puedeConfirmar} loading={enviando}>
          Confirmar venta
        </Button>
      </div>
    </div>
  );
}
