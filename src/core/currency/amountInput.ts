/**
 * Formateo "en vivo" del campo de monto recurrente (miles mientras se
 * escribe) — separado de `formatCurrency` (que formatea para MOSTRAR, con
 * símbolo y redondeo fijo) porque acá hay que ir y volver: lo que el
 * usuario ve en el input no es lo mismo que se guarda en el estado
 * (`amount` sigue siendo un string numérico limpio, sin separadores).
 *
 * COP no admite decimales acá (igual que su `Intl.NumberFormat` en
 * `exchangeRate.ts`, `maximumFractionDigits: 0`) — separador de miles ".".
 * USD/EUR admiten hasta 2 decimales — separador de miles "," y decimal ".".
 */
export function formatMontoInput(raw: string, currency: string): string {
  if (currency === "COP") {
    const digits = raw.replace(/\D/g, "");
    return digits.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  }
  const cleaned = raw.replace(/[^\d.]/g, "");
  const [entero = "", decimales] = cleaned.split(".");
  const enteroAgrupado = entero.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  return decimales !== undefined ? `${enteroAgrupado}.${decimales.slice(0, 2)}` : enteroAgrupado;
}

/** Inverso de `formatMontoInput`: recupera el string numérico limpio a partir de lo que el usuario tipeó/pegó. */
export function limpiarMontoInput(texto: string, currency: string): string {
  if (currency === "COP") return texto.replace(/\D/g, "");
  return texto.replace(/,/g, "").replace(/[^\d.]/g, "");
}
