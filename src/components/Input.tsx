import { useId } from "react";
import type { InputHTMLAttributes, ReactNode } from "react";
import styles from "./Input.module.css";

interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "prefix"> {
  label: string;
  error?: string;
  hint?: string;
  /**
   * "subtle" (por defecto): texto de ayuda de bajo perfil.
   * "notice": misma paleta neutra pero con más peso/jerarquía visual para
   * avisos que ameritan atención sin ser un error de validación (ej. un
   * posible duplicado que no bloquea el envío).
   */
  hintTone?: "subtle" | "notice";
  /** Contenido fijo dentro del campo, a la izquierda (ej. "Bs" en montos, o un ícono). Puramente visual. */
  prefix?: ReactNode;
}

export function Input({
  label,
  error,
  hint,
  hintTone = "subtle",
  prefix,
  id,
  className,
  ...rest
}: InputProps) {
  const generatedId = useId();
  const inputId = id ?? generatedId;
  const errorId = error ? `${inputId}-error` : undefined;
  const hintId = hint ? `${inputId}-hint` : undefined;

  return (
    <div className={styles.field}>
      <label htmlFor={inputId} className={styles.label}>
        {label}
      </label>
      <div className={prefix ? styles.inputWrapper : undefined}>
        {prefix && (
          <span className={styles.prefix} aria-hidden="true">
            {prefix}
          </span>
        )}
        <input
          id={inputId}
          className={[
            styles.input,
            prefix && styles.inputWithPrefix,
            error && styles.inputError,
            className,
          ]
            .filter(Boolean)
            .join(" ")}
          aria-invalid={Boolean(error) || undefined}
          aria-describedby={errorId ?? hintId}
          {...rest}
        />
      </div>
      {hint && !error && (
        <span
          id={hintId}
          className={[styles.hint, hintTone === "notice" && styles.hintNotice]
            .filter(Boolean)
            .join(" ")}
        >
          {hint}
        </span>
      )}
      {error && (
        <span id={errorId} className={styles.error} role="alert">
          {error}
        </span>
      )}
    </div>
  );
}
