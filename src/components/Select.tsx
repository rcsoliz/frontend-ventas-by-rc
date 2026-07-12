import { useId } from "react";
import type { SelectHTMLAttributes } from "react";
import inputStyles from "./Input.module.css";
import styles from "./Select.module.css";

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  error?: string;
}

export function Select({ label, error, id, className, children, ...rest }: SelectProps) {
  const generatedId = useId();
  const selectId = id ?? generatedId;
  const errorId = error ? `${selectId}-error` : undefined;

  return (
    <div className={inputStyles.field}>
      <label htmlFor={selectId} className={inputStyles.label}>
        {label}
      </label>
      <select
        id={selectId}
        className={[
          inputStyles.input,
          styles.select,
          error && inputStyles.inputError,
          className,
        ]
          .filter(Boolean)
          .join(" ")}
        aria-invalid={Boolean(error) || undefined}
        aria-describedby={errorId}
        {...rest}
      >
        {children}
      </select>
      {error && (
        <span id={errorId} className={inputStyles.error} role="alert">
          {error}
        </span>
      )}
    </div>
  );
}
