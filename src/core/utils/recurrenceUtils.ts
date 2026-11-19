import { addDays, addWeeks } from "date-fns";

export type BillingCycle = "weekly" | "monthly" | "yearly" | "custom";

/**
 * Suma `months` meses a `date` anclando el DÍA al de `date`, pero recortando
 * al último día del mes destino si este es más corto.
 *
 * Por qué existe: `date-fns`' `addMonths` normaliza fechas que "se pasan"
 * de mes (ej. 31 ene + 1 mes -> como el resultado ingenuo sería 31 feb,
 * que no existe, JS lo hace rodar al 2-3 de marzo). Para una suscripción
 * eso está mal: el usuario espera que el cobro del 31 de enero caiga el
 * último día de febrero, no en marzo.
 */
function addMonthsClamped(date: Date, months: number): Date {
  const day = date.getDate();
  const result = new Date(date.getFullYear(), date.getMonth() + months, 1);
  const lastDayOfTargetMonth = new Date(result.getFullYear(), result.getMonth() + 1, 0).getDate();
  result.setDate(Math.min(day, lastDayOfTargetMonth));
  result.setHours(date.getHours(), date.getMinutes(), date.getSeconds(), date.getMilliseconds());
  return result;
}

/**
 * Calcula la siguiente fecha de cobro a partir de la fecha del cobro anterior
 * (o de creación) y el ciclo de facturación.
 *
 * Caso borde documentado en el prompt original: una suscripción ANUAL creada
 * el 29 de febrero de un año bisiesto. `addMonthsClamped` con months=12
 * recorta al 28 de febrero en los años no bisiestos, en vez de desbordar a
 * marzo — así el cobro "anual" siempre cae en febrero.
 */
export function calcularProximoCobro(
  fechaBase: Date,
  billingCycle: BillingCycle,
  customCycleDays?: number | null
): Date {
  switch (billingCycle) {
    case "weekly":
      return addWeeks(fechaBase, 1);
    case "monthly":
      return addMonthsClamped(fechaBase, 1);
    case "yearly":
      return addMonthsClamped(fechaBase, 12);
    case "custom":
      if (!customCycleDays || customCycleDays <= 0) {
        throw new Error("customCycleDays debe ser un entero positivo para el ciclo 'custom'");
      }
      return addDays(fechaBase, customCycleDays);
  }
}

/** Avanza `fechaBase` repetidamente hasta que la próxima fecha de cobro sea futura respecto a `referencia`. */
export function calcularProximoCobroDesdeHoy(
  fechaBase: Date,
  billingCycle: BillingCycle,
  customCycleDays?: number | null,
  referencia: Date = new Date()
): Date {
  let proxima = fechaBase;
  // Límite de seguridad para evitar loops infinitos ante datos corruptos.
  for (let i = 0; i < 1000 && proxima <= referencia; i++) {
    proxima = calcularProximoCobro(proxima, billingCycle, customCycleDays);
  }
  return proxima;
}
