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
import { VentasTabs } from "../VentasTabs";
import { useCarrito } from "./useCarrito";
import type { LineaCarrito } from "./useCarrito";
import { extraerMensajeError } from "../../../graphql/errors";
import { formatearMoneda } from "../../../format";
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
  const [errorLinea, setErrorLinea] = useState<string | null>(null);

  const clientes = clientesData?.clientes ?? [];
  const productos = productosData?.productos ?? [];
  const productoSeleccionado = productos.find((p) => p.idProducto === idProducto);

  function handleAgregarLinea(e: FormEvent) {
    e.preventDefault();
    setErrorLinea(null);
    const producto = productos.find((p) => p.idProducto === idProducto);
    if (!producto) return;
    const cantidadNum = Number(cantidad);
    if (cantidadNum <= 0) {
      setErrorLinea("La cantidad debe ser al menos 1.");
      return;
    }

    const existente = lineas.find((l) => l.producto.idProducto === producto.idProducto);
    const cantidadFinal = (existente?.cantidad ?? 0) + cantidadNum;

    if (cantidadFinal > producto.stock) {
      setErrorLinea(
        `Stock insuficiente para "${producto.nombreProducto}": disponible ${producto.stock}, solicitado ${cantidadFinal}.`
      );
      return;
    }

    agregarLinea(producto, cantidadNum);
    setIdProducto("");
    setCantidad("1");

    if (existente) {
      showToast(`Cantidad de "${producto.nombreProducto}" actualizada a ${cantidadFinal}.`, "info");
    }
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
      render: (l) => formatearMoneda(Number(l.producto.precio) * l.cantidad),
    },
    {
      key: "acciones",
      header: "",
      align: "right",
      render: (l) => (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => quitarLinea(l.producto.idProducto)}
          aria-label={`Quitar ${l.producto.nombreProducto} del carrito`}
        >
          Quitar
        </Button>
      ),
    },
  ];

  const puedeConfirmar = idCliente !== "" && lineas.length > 0 && !enviando;
  const motivoBloqueo =
    idCliente === "" ? "Seleccioná un cliente para continuar." : "Agregá al menos un producto al carrito.";

  return (
    <div className={styles.page}>
      <VentasTabs />

      <Card className={styles.section}>
        <div className={styles.cardHeader}>
          <span className={styles.stepLabel}>Paso 1</span>
          <h2 className={styles.cardTitle}>Cliente</h2>
        </div>
        <Select
          label="Cliente"
          value={idCliente}
          onChange={(e) => setIdCliente(e.target.value)}
          disabled={clientesLoading || clientes.length === 0}
        >
          <option value="">
            {clientesLoading
              ? "Cargando clientes…"
              : clientes.length === 0
                ? "No hay clientes registrados"
                : "Seleccioná un cliente"}
          </option>
          {clientes.map((c) => (
            <option key={c.idCliente} value={c.idCliente}>
              {c.nombreCompleto}
            </option>
          ))}
        </Select>
      </Card>

      <Card className={styles.section}>
        <div className={styles.cardHeader}>
          <span className={styles.stepLabel}>Paso 2</span>
          <h2 className={styles.cardTitle}>Agregar productos</h2>
        </div>
        <form onSubmit={handleAgregarLinea} className={styles.lineForm} noValidate>
          <Select
            label="Producto"
            value={idProducto}
            onChange={(e) => {
              setIdProducto(e.target.value);
              setErrorLinea(null);
            }}
            disabled={productosLoading || productos.length === 0}
          >
            <option value="">
              {productosLoading
                ? "Cargando productos…"
                : productos.length === 0
                  ? "No hay productos en el catálogo"
                  : "Seleccioná un producto"}
            </option>
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
            max={productoSeleccionado?.stock}
            value={cantidad}
            onChange={(e) => {
              setCantidad(e.target.value);
              setErrorLinea(null);
            }}
            hint={productoSeleccionado ? `Disponible: ${productoSeleccionado.stock}` : undefined}
          />
          <Button type="submit" variant="secondary" disabled={!idProducto} className={styles.addButton}>
            Agregar
          </Button>
        </form>
        {errorLinea && (
          <p role="alert" className={styles.error}>
            {errorLinea}
          </p>
        )}
      </Card>

      <Card className={styles.section}>
        <div className={styles.cardHeader}>
          <span className={styles.stepLabel}>Paso 3</span>
          <h2 className={styles.cardTitle}>Carrito</h2>
        </div>
        {lineas.length === 0 ? (
          <EmptyState
            title="El carrito está vacío"
            description="Agregá al menos un producto para poder registrar la venta."
          />
        ) : (
          <Table columns={columns} rows={lineas} getRowKey={(l) => l.producto.idProducto} />
        )}
      </Card>

      <div className={styles.footer}>
        {errorEnvio && (
          <p role="alert" className={styles.error}>
            {errorEnvio}
          </p>
        )}
        <div className={styles.footerRow}>
          <div className={styles.totalBlock}>
            <span className={styles.totalLabel}>Total</span>
            <span className={styles.totalValue}>{formatearMoneda(total)}</span>
          </div>
          <div className={styles.confirmBlock}>
            {!puedeConfirmar && !enviando && (
              <span className={styles.footerHint}>{motivoBloqueo}</span>
            )}
            <Button onClick={handleConfirmar} disabled={!puedeConfirmar} loading={enviando}>
              Confirmar venta
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
