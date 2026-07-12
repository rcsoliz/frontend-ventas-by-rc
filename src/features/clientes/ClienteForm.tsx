import { useState } from "react";
import type { FormEvent } from "react";
import { Input } from "../../components/Input";
import { Button } from "../../components/Button";
import { useCrearCliente } from "./hooks";
import { extraerMensajeError } from "../../graphql/errors";
import styles from "./ClienteForm.module.css";

const CORREO_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

interface ClienteFormProps {
  onSuccess: () => void;
}

export function ClienteForm({ onSuccess }: ClienteFormProps) {
  const [nombre, setNombre] = useState("");
  const [apellido, setApellido] = useState("");
  const [correo, setCorreo] = useState("");
  const [telefono, setTelefono] = useState("");
  const [direccion, setDireccion] = useState("");
  const [correoError, setCorreoError] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  const [crearCliente, { loading }] = useCrearCliente();

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setFormError(null);
    setCorreoError(null);

    if (!CORREO_REGEX.test(correo)) {
      setCorreoError("Ingresá un correo con formato válido.");
      return;
    }

    try {
      await crearCliente({
        variables: { datos: { nombre, apellido, correo, telefono, direccion } },
      });
      onSuccess();
    } catch (error) {
      const mensaje = extraerMensajeError(error);
      if (/correo/i.test(mensaje)) {
        setCorreoError(mensaje);
      } else {
        setFormError(mensaje);
      }
    }
  }

  return (
    <form onSubmit={handleSubmit} className={styles.form}>
      <Input
        label="Nombre"
        value={nombre}
        onChange={(e) => setNombre(e.target.value)}
        required
      />
      <Input
        label="Apellido"
        value={apellido}
        onChange={(e) => setApellido(e.target.value)}
        required
      />
      <Input
        label="Correo"
        type="email"
        value={correo}
        onChange={(e) => setCorreo(e.target.value)}
        error={correoError ?? undefined}
        required
      />
      <Input
        label="Teléfono"
        value={telefono}
        onChange={(e) => setTelefono(e.target.value)}
        required
      />
      <Input
        label="Dirección"
        value={direccion}
        onChange={(e) => setDireccion(e.target.value)}
        required
      />
      {formError && (
        <p className={styles.error} role="alert">
          {formError}
        </p>
      )}
      <Button type="submit" loading={loading} className={styles.submit}>
        Crear cliente
      </Button>
    </form>
  );
}
