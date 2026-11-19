export type DivisionCosto = {
  /** Parte que le corresponde pagar al usuario dueño de la app. */
  montoUsuario: number;
  /** Parte que le corresponde a la persona con la que se comparte. */
  montoCompartido: number;
};

/**
 * Divide el monto total de una suscripción compartida según el porcentaje
 * que le corresponde al usuario (`sharedSplitPercent`, 0-100).
 *
 * Redondea a 2 decimales y ajusta el resto en `montoCompartido` para que
 * `montoUsuario + montoCompartido` siempre sea exactamente `montoTotal`
 * (evita descuadres de centavos por redondeo independiente de cada lado).
 */
export function calcularDivisionCosto(montoTotal: number, sharedSplitPercent: number): DivisionCosto {
  if (sharedSplitPercent < 0 || sharedSplitPercent > 100) {
    throw new Error("sharedSplitPercent debe estar entre 0 y 100");
  }
  const montoUsuario = Math.round(montoTotal * (sharedSplitPercent / 100) * 100) / 100;
  const montoCompartido = Math.round((montoTotal - montoUsuario) * 100) / 100;
  return { montoUsuario, montoCompartido };
}
