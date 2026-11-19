import type { Subscription } from "../../../core/database/schema";

/**
 * Equivalente mensual y anual de una suscripción según su ciclo de cobro —
 * única fuente de verdad para esta conversión. Antes vivía duplicada (y a
 * veces ausente) en varias pantallas, que sumaban `amount` directo como si
 * SIEMPRE fuera mensual: una suscripción anual de $120.000 inflaba el gasto
 * mensual en $120.000 en vez de los $10.000 reales.
 */
export function montoMensualYAnual(
  subscription: Pick<Subscription, "amount" | "billingCycle" | "customCycleDays">
) {
  const { amount, billingCycle, customCycleDays } = subscription;
  switch (billingCycle) {
    case "yearly":
      return { mensual: amount / 12, anual: amount };
    case "weekly":
      return { mensual: (amount * 52) / 12, anual: amount * 52 };
    case "custom": {
      const dias = customCycleDays ?? 30;
      return { mensual: (amount * 30) / dias, anual: (amount * 365) / dias };
    }
    case "monthly":
    default:
      return { mensual: amount, anual: amount * 12 };
  }
}

/** Monto mensual equivalente, ya convertido a COP (para sumar entre monedas distintas). */
export function montoMensualCOP(
  subscription: Pick<Subscription, "amount" | "currency" | "billingCycle" | "customCycleDays">,
  convertToCOP: (amount: number, currency: string) => number
): number {
  const { mensual } = montoMensualYAnual(subscription);
  return convertToCOP(mensual, subscription.currency);
}
