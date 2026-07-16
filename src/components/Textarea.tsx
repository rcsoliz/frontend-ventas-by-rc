import { useId } from "react";
import type { TextareaHTMLAttributes } from "react";
import styles from "./Input.module.css";

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string;
  error?: string;
}

export function Textarea({ label, error, id, className, rows = 3, ...rest }: TextareaProps) {
  const generatedId = useId();
  const textareaId = id ?? generatedId;
  const errorId = error ? `${textareaId}-error` : undefined;

  return (
    <div className={styles.field}>
      <label htmlFor={textareaId} className={styles.label}>
        {label}
      </label>
      <textarea
        id={textareaId}
        rows={rows}
        className={[styles.input, error && styles.inputError, className].filter(Boolean).join(" ")}
        aria-invalid={Boolean(error) || undefined}
        aria-describedby={errorId}
        {...rest}
      />
      {error && (
        <span id={errorId} className={styles.error} role="alert">
          {error}
        </span>
      )}
    </div>
  );
}
