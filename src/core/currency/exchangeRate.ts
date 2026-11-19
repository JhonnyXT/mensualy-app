/**
 * Tasas de cambio manuales (sin API externa de pago, por diseño: ver
 * diferenciador "todo en COP" del proyecto). El usuario las actualiza desde
 * Ajustes cuando quiera; mientras tanto se usa este valor por defecto.
 *
 * TODO(settings): reemplazar por el valor guardado en AsyncStorage/SQLite
 * cuando exista la pantalla de Ajustes > Moneda.
 */
export const DEFAULT_EXCHANGE_RATES: Record<string, number> = {
  USD: 4000,
  EUR: 4300,
  COP: 1,
};

export function convertToCOP(amount: number, currency: string): number {
  const rate = DEFAULT_EXCHANGE_RATES[currency] ?? 1;
  return Math.round(amount * rate);
}

/** Convierte entre dos monedas cualquiera pasando por COP como base intermedia. */
export function convertCurrency(amount: number, from: string, to: string): number {
  if (from === to) return amount;
  const copAmount = convertToCOP(amount, from);
  if (to === "COP") return copAmount;
  const rateTo = DEFAULT_EXCHANGE_RATES[to] ?? 1;
  return copAmount / rateTo;
}

const CURRENCY_FORMATTERS: Record<string, Intl.NumberFormat> = {
  USD: new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }),
  EUR: new Intl.NumberFormat("de-DE", { style: "currency", currency: "EUR" }),
  COP: new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0,
  }),
};

export function formatCurrency(amount: number, currency: string): string {
  const formatter = CURRENCY_FORMATTERS[currency];
  if (formatter) return formatter.format(amount);
  return `${amount.toFixed(2)} ${currency}`;
}

export function formatCOPEquivalent(amount: number, currency: string): string {
  if (currency === "COP") return formatCurrency(amount, "COP");
  return `≈ ${formatCurrency(convertToCOP(amount, currency), "COP")}`;
}
