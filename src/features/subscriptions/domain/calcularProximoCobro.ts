import type { BillingCycle } from "../types";

/** Un paso del ciclo de cobro, en la unidad que corresponda (mes/semana/año/días). */
function avanzarUnCiclo(fecha: Date, cycle: BillingCycle, customCycleDays: number | null): Date {
  const next = new Date(fecha);
  switch (cycle) {
    case "weekly":
      next.setDate(next.getDate() + 7);
      return next;
    case "yearly":
      next.setFullYear(next.getFullYear() + 1);
      return next;
    case "custom":
      next.setDate(next.getDate() + (customCycleDays ?? 30));
      return next;
    case "monthly":
    default:
      next.setMonth(next.getMonth() + 1);
      return next;
  }
}

/**
 * Dada una fecha de referencia (la última elegida/guardada) y el ciclo de
 * cobro, avanza en pasos del ciclo hasta encontrar la próxima ocurrencia que
 * caiga hoy o en el futuro — así el usuario elige la fecha UNA vez (ej. "21
 * de octubre") y la app sola sabe que, pasado ese día, el próximo cobro es
 * "21 de noviembre", sin que nadie tenga que editarlo a mano cada mes.
 */
export function calcularProximoCobro(
  fecha: Date,
  cycle: BillingCycle,
  customCycleDays: number | null,
  ahora: Date = new Date()
): Date {
  const hoy = new Date(ahora.getFullYear(), ahora.getMonth(), ahora.getDate());
  let proxima = new Date(fecha);

  // Tope de seguridad: una suscripción semanal nunca vista en años no debe
  // trabar el hilo de JS reintentando miles de veces.
  let guard = 0;
  while (proxima < hoy && guard < 1000) {
    proxima = avanzarUnCiclo(proxima, cycle, customCycleDays);
    guard++;
  }
  return proxima;
}
