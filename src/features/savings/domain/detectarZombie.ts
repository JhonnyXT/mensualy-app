import { differenceInDays } from "date-fns";

export const DIAS_UMBRAL_ZOMBIE = 90;

/**
 * Una suscripción es "zombie" cuando el usuario no la ha marcado como usada
 * en más de `DIAS_UMBRAL_ZOMBIE` días. Si nunca se marcó (`lastUsedAt` es
 * null), se usa la fecha de creación como referencia: una suscripción
 * registrada hace 4 meses y nunca "usada" también cuenta como candidata.
 */
export function esSuscripcionZombie(
  lastUsedAt: Date | null,
  createdAt: Date,
  ahora: Date = new Date()
): boolean {
  const referencia = lastUsedAt ?? createdAt;
  return differenceInDays(ahora, referencia) >= DIAS_UMBRAL_ZOMBIE;
}

export function diasSinUsar(
  lastUsedAt: Date | null,
  createdAt: Date,
  ahora: Date = new Date()
): number {
  const referencia = lastUsedAt ?? createdAt;
  return differenceInDays(ahora, referencia);
}

export const DIAS_UMBRAL_AVISO_TEMPRANO = 45;

/**
 * Aviso más suave que "zombie": uso bajo pero todavía no cruzó el umbral
 * fuerte de `DIAS_UMBRAL_ZOMBIE`. Da tiempo a actuar antes de que se vuelva
 * zombie del todo.
 */
export function esUsoBajoTemprano(
  lastUsedAt: Date | null,
  createdAt: Date,
  ahora: Date = new Date()
): boolean {
  const dias = diasSinUsar(lastUsedAt, createdAt, ahora);
  return dias >= DIAS_UMBRAL_AVISO_TEMPRANO && dias < DIAS_UMBRAL_ZOMBIE;
}
