import { useEffect, useRef, useState } from "react";
import styles from "./KebabMenu.module.css";

export interface KebabMenuAction {
  label: string;
  onClick: () => void;
  variant?: "default" | "danger";
}

interface KebabMenuProps {
  actions: KebabMenuAction[];
  label?: string;
}

/**
 * Menú de acciones por fila (⋮). Reemplaza los botones inline cuando una fila
 * tiene una sola acción principal o varias acciones secundarias que no
 * necesitan estar siempre visibles. Cierra con Escape y con click afuera;
 * ambos manejadores se registran solo mientras el menú está abierto.
 */
export function KebabMenu({ actions, label = "Más acciones" }: KebabMenuProps) {
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;

    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setOpen(false);
        buttonRef.current?.focus();
      }
    }
    function onPointerDown(e: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }

    document.addEventListener("keydown", onKeyDown);
    document.addEventListener("mousedown", onPointerDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.removeEventListener("mousedown", onPointerDown);
    };
  }, [open]);

  if (actions.length === 0) return null;

  return (
    <div
      className={styles.wrapper}
      ref={wrapperRef}
      // La fila puede tener su propio onClick (navegar al detalle); el menú
      // no debe dispararlo de rebote.
      onClick={(e) => e.stopPropagation()}
    >
      <button
        type="button"
        ref={buttonRef}
        className={styles.trigger}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={label}
        onClick={() => setOpen((v) => !v)}
      >
        <span aria-hidden="true">&#8942;</span>
      </button>
      {open && (
        <div className={styles.menu} role="menu">
          {actions.map((action) => (
            <button
              key={action.label}
              type="button"
              role="menuitem"
              className={[styles.item, action.variant === "danger" && styles.itemDanger]
                .filter(Boolean)
                .join(" ")}
              onClick={() => {
                setOpen(false);
                action.onClick();
              }}
            >
              {action.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
