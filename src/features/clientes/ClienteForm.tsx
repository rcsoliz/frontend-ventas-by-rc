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
  onCancel: () => void;
}

type CampoCliente = "nombre" | "apellido" | "correo" | "telefono" | "direccion";

export function ClienteForm({ onSuccess, onCancel }: ClienteFormProps) {
  const [nombre, setNombre] = useState("");
  const [apellido, setApellido] = useState("");
  const [correo, setCorreo] = useState("");
  const [telefono, setTelefono] = useState("");
  const [direccion, setDireccion] = useState("");
  const [errores, setErrores] = useState<Partial<Record<CampoCliente, string>>>({});
  const [formError, setFormError] = useState<string | null>(null);

  const [crearCliente, { loading }] = useCrearCliente();

  function limpiarError(campo: CampoCliente) {
    setErrores((prev) => {
      if (!(campo in prev)) return prev;
      const resto = { ...prev };
      delete resto[campo];
      return resto;
    });
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setFormError(null);

    const nuevosErrores: Partial<Record<CampoCliente, string>> = {};
    if (!nombre.trim()) nuevosErrores.nombre = "Ingresá el nombre.";
    if (!apellido.trim()) nuevosErrores.apellido = "Ingresá el apellido.";
    if (!CORREO_REGEX.test(correo)) nuevosErrores.correo = "Ingresá un correo con formato válido.";
    if (!telefono.trim()) nuevosErrores.telefono = "Ingresá el teléfono.";
    if (!direccion.trim()) nuevosErrores.direccion = "Ingresá la dirección.";

    setErrores(nuevosErrores);
    if (Object.keys(nuevosErrores).length > 0) return;

    try {
      await crearCliente({
        variables: { datos: { nombre, apellido, correo, telefono, direccion } },
      });
      onSuccess();
    } catch (error) {
      const mensaje = extraerMensajeError(error);
      if (/correo/i.test(mensaje)) {
        setErrores((prev) => ({ ...prev, correo: mensaje }));
      } else {
        setFormError(mensaje);
      }
    }
  }

  return (
    <form onSubmit={handleSubmit} className={styles.form} noValidate>
      <Input
        label="Nombre"
        autoComplete="given-name"
        value={nombre}
        onChange={(e) => {
          setNombre(e.target.value);
          limpiarError("nombre");
        }}
        error={errores.nombre}
        required
      />
      <Input
        label="Apellido"
        autoComplete="family-name"
        value={apellido}
        onChange={(e) => {
          setApellido(e.target.value);
          limpiarError("apellido");
        }}
        error={errores.apellido}
        required
      />
      <Input
        label="Correo"
        type="email"
        autoComplete="email"
        value={correo}
        onChange={(e) => {
          setCorreo(e.target.value);
          limpiarError("correo");
        }}
        error={errores.correo}
        required
      />
      <Input
        label="Teléfono"
        autoComplete="tel"
        value={telefono}
        onChange={(e) => {
          setTelefono(e.target.value);
          limpiarError("telefono");
        }}
        error={errores.telefono}
        required
      />
      <Input
        label="Dirección"
        autoComplete="street-address"
        value={direccion}
        onChange={(e) => {
          setDireccion(e.target.value);
          limpiarError("direccion");
        }}
        error={errores.direccion}
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
          Crear cliente
        </Button>
      </div>
    </form>
  );
}
