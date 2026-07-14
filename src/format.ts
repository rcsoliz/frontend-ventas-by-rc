const formateadorMoneda = new Intl.NumberFormat("es-BO", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

/**
 * Formatea un Decimal del backend (tipado `unknown` en el schema generado,
 * llega como string en runtime) con separador de miles, p.ej. "Bs 4.500,00".
 */
export function formatearMoneda(valor: unknown): string {
  return `Bs ${formateadorMoneda.format(Number(valor))}`;
}
