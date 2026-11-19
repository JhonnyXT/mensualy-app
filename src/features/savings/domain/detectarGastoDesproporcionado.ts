import type { Subscription } from "../../../core/database/schema";
import { convertToCOP } from "../../../core/currency/exchangeRate";
import { montoMensualYAnual } from "../../subscriptions/domain/montoMensualYAnual";

export const UMBRAL_PORCENTAJE_DESPROPORCIONADO = 25;

/**
 * Suscripciones activas cuyo costo mensual representa una porción
 * desproporcionada del gasto total en suscripciones — útil incluso si SÍ se
 * usan, porque el problema no es el uso sino el peso en el presupuesto.
 * Solo aplica con 3+ activas: con 1-2, cualquiera pesa "mucho" por pura
 * aritmética y la señal deja de ser informativa.
 */
export function detectarGastoDesproporcionado(
  activas: Subscription[],
  gastoMensualTotalCOP: number,
  umbralPorcentaje = UMBRAL_PORCENTAJE_DESPROPORCIONADO
): { subscription: Subscription; porcentaje: number }[] {
  if (activas.length < 3 || gastoMensualTotalCOP <= 0) return [];
  return activas
    .map((s) => ({
      subscription: s,
      porcentaje: (convertToCOP(montoMensualYAnual(s).mensual, s.currency) / gastoMensualTotalCOP) * 100,
    }))
    .filter((r) => r.porcentaje >= umbralPorcentaje);
}
