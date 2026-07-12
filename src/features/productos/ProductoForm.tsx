import { useState } from "react";
import type { FormEvent } from "react";
import { Input } from "../../components/Input";
import { Button } from "../../components/Button";
import { useCrearProducto } from "./hooks";
import { extraerMensajeError } from "../../graphql/errors";
import styles from "./ProductoForm.module.css";

interface ProductoFormProps {
  onSuccess: () => void;
}

export function ProductoForm({ onSuccess }: ProductoFormProps) {
  const [nombreProducto, setNombreProducto] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [precio, setPrecio] = useState("");
  const [stock, setStock] = useState("");
  const [formError, setFormError] = useState<string | null>(null);

  const [crearProducto, { loading }] = useCrearProducto();

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setFormError(null);

    try {
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
      onSuccess();
    } catch (error) {
      setFormError(extraerMensajeError(error));
    }
  }

  return (
    <form onSubmit={handleSubmit} className={styles.form}>
      <Input
        label="Nombre"
        value={nombreProducto}
        onChange={(e) => setNombreProducto(e.target.value)}
        required
      />
      <Input
        label="Descripción"
        value={descripcion}
        onChange={(e) => setDescripcion(e.target.value)}
        required
      />
      <Input
        label="Precio"
        type="number"
        min="0.01"
        step="0.01"
        value={precio}
        onChange={(e) => setPrecio(e.target.value)}
        required
      />
      <Input
        label="Stock inicial"
        type="number"
        min="0"
        step="1"
        value={stock}
        onChange={(e) => setStock(e.target.value)}
        required
      />
      {formError && (
        <p className={styles.error} role="alert">
          {formError}
        </p>
      )}
      <Button type="submit" loading={loading} className={styles.submit}>
        Crear producto
      </Button>
    </form>
  );
}
