import type { PriceHistoryEntry } from "../../../core/database/schema";

export type AumentoPrecio = {
  huboAumento: boolean;
  porcentaje: number;
  montoInicial: number;
  montoActual: number;
};

/**
 * Compara el precio actual contra el registro de `priceHistory` más antiguo
 * dentro de la ventana de `mesesVentana` (por defecto 12) para calcular el
 * % de aumento acumulado. Se usa el más antiguo dentro de la ventana, no el
 * primero histórico, para que el mensaje sea siempre "en los últimos N
 * meses" y no crezca artificialmente con suscripciones muy viejas.
 */
export function detectarAumentoPrecio(
  historial: PriceHistoryEntry[],
  montoActual: number,
  mesesVentana = 12,
  ahora: Date = new Date()
): AumentoPrecio {
  const limite = new Date(ahora);
  limite.setMonth(limite.getMonth() - mesesVentana);

  const dentroDeVentana = historial
    .filter((h) => h.changedAt >= limite)
    .sort((a, b) => a.changedAt.getTime() - b.changedAt.getTime());

  const montoInicial = dentroDeVentana[0]?.amount ?? montoActual;

  if (montoInicial <= 0 || montoInicial === montoActual) {
    return { huboAumento: false, porcentaje: 0, montoInicial, montoActual };
  }

  const porcentaje = ((montoActual - montoInicial) / montoInicial) * 100;
  return {
    huboAumento: porcentaje > 0,
    porcentaje: Math.round(porcentaje * 10) / 10,
    montoInicial,
    montoActual,
  };
}
