import { useState } from "react";
import type { FormEvent } from "react";
import { Input } from "../../components/Input";
import { Button } from "../../components/Button";
import { useActualizarProducto, useCrearProducto } from "./hooks";
import { extraerMensajeError } from "../../graphql/errors";
import styles from "./ProductoForm.module.css";

export interface ProductoEditable {
  idProducto: string;
  nombreProducto: string;
  descripcion: string;
  precio: string;
  stock: number;
}

interface ProductoFormProps {
  producto?: ProductoEditable;
  onSuccess: () => void;
  onCancel: () => void;
  nombresExistentes?: string[];
}

type CampoProducto = "nombreProducto" | "descripcion" | "precio" | "stock";

export function ProductoForm({
  producto,
  onSuccess,
  onCancel,
  nombresExistentes = [],
}: ProductoFormProps) {
  const [nombreProducto, setNombreProducto] = useState(producto?.nombreProducto ?? "");
  const [descripcion, setDescripcion] = useState(producto?.descripcion ?? "");
  const [precio, setPrecio] = useState(producto?.precio ?? "");
  const [stock, setStock] = useState(producto ? String(producto.stock) : "");
  const [errores, setErrores] = useState<Partial<Record<CampoProducto, string>>>({});
  const [formError, setFormError] = useState<string | null>(null);

  const [crearProducto, { loading: creando }] = useCrearProducto();
  const [actualizarProducto, { loading: actualizando }] = useActualizarProducto();
  const loading = creando || actualizando;

  function limpiarError(campo: CampoProducto) {
    setErrores((prev) => {
      if (!(campo in prev)) return prev;
      const resto = { ...prev };
      delete resto[campo];
      return resto;
    });
  }

  const posibleDuplicado =
    nombreProducto.trim().length > 0 &&
    nombresExistentes.some((n) => n.toLowerCase() === nombreProducto.trim().toLowerCase());

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setFormError(null);

    const nuevosErrores: Partial<Record<CampoProducto, string>> = {};
    if (!nombreProducto.trim()) nuevosErrores.nombreProducto = "Ingresá el nombre.";
    if (!descripcion.trim()) nuevosErrores.descripcion = "Ingresá la descripción.";
    if (!precio || Number(precio) <= 0) nuevosErrores.precio = "Ingresá un precio válido.";
    if (!stock || Number(stock) < 0) nuevosErrores.stock = "Ingresá un stock válido.";

    setErrores(nuevosErrores);
    if (Object.keys(nuevosErrores).length > 0) return;

    try {
      if (producto) {
        await actualizarProducto({
          variables: {
            idProducto: producto.idProducto,
            datos: {
              nombreProducto,
              descripcion,
              precio: Number(precio),
              stock: Number(stock),
            },
          },
        });
      } else {
        await crearProducto({
          variables: {
            datos: {
              nombreProducto,
              descripcion,
              precio: Number(precio),
              stock: Number(stock),
            },
          },
        });
      }
      onSuccess();
    } catch (error) {
      const mensaje = extraerMensajeError(error);
      if (/nombre/i.test(mensaje)) {
        setErrores((prev) => ({ ...prev, nombreProducto: mensaje }));
      } else if (/precio/i.test(mensaje)) {
        setErrores((prev) => ({ ...prev, precio: mensaje }));
      } else if (/stock/i.test(mensaje)) {
        setErrores((prev) => ({ ...prev, stock: mensaje }));
      } else {
        setFormError(mensaje);
      }
    }
  }

  return (
    <form onSubmit={handleSubmit} className={styles.form} noValidate>
      <Input
        label="Nombre"
        value={nombreProducto}
        onChange={(e) => {
          setNombreProducto(e.target.value);
          limpiarError("nombreProducto");
        }}
        error={errores.nombreProducto}
        hint={posibleDuplicado ? "Ya existe un producto con este nombre." : undefined}
        required
      />
      <Input
        label="Descripción"
        value={descripcion}
        onChange={(e) => {
          setDescripcion(e.target.value);
          limpiarError("descripcion");
        }}
        error={errores.descripcion}
        required
      />
      <Input
        label="Precio"
        type="number"
        min="0.01"
        step="0.01"
        value={precio}
        onChange={(e) => {
          setPrecio(e.target.value);
          limpiarError("precio");
        }}
        error={errores.precio}
        required
      />
      <Input
        label={producto ? "Stock" : "Stock inicial"}
        type="number"
        min="0"
        step="1"
        value={stock}
        onChange={(e) => {
          setStock(e.target.value);
          limpiarError("stock");
        }}
        error={errores.stock}
        required
      />
      {formError && (
        <p className={styles.error} role="alert">
          {formError}
        </p>
      )}
      <div className={styles.actions}>
        <Button type="button" variant="ghost" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit" loading={loading} className={styles.submit}>
          {producto ? "Guardar cambios" : "Crear producto"}
        </Button>
      </div>
    </form>
  );
}
