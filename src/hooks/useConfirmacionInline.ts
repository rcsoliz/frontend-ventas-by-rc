import { useEffect, useState } from "react";

/**
 * Confirmación de dos clics para una acción por fila: el primer clic arma
 * la confirmación (identificada por `id`), el segundo clic sobre la misma
 * fila la ejecuta. Si no se confirma dentro de `duracionMs`, o se pide
 * confirmar otra fila distinta, la solicitud pendiente se descarta sola.
 */
export function useConfirmacionInline(duracionMs = 3000) {
  const [idConfirmando, setIdConfirmando] = useState<string | null>(null);

  useEffect(() => {
    if (!idConfirmando) return;
    const timeout = setTimeout(() => setIdConfirmando(null), duracionMs);
    return () => clearTimeout(timeout);
  }, [idConfirmando, duracionMs]);

  function solicitar(id: string, accion: () => void) {
    if (idConfirmando === id) {
      setIdConfirmando(null);
      accion();
    } else {
      setIdConfirmando(id);
    }
  }

  return { idConfirmando, solicitar };
}
