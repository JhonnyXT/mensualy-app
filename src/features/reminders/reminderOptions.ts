/** Opciones de recordatorio PROPIO de una suscripción (New/EditSubscriptionSheet) — `null` = usa el predeterminado de Ajustes, no "sin aviso". */
export const OWN_REMINDER_OPTIONS: { days: number | null; label: string }[] = [
  { days: null, label: "Predeterminado" },
  { days: 0, label: "El mismo día" },
  { days: 1, label: "1 día antes" },
  { days: 2, label: "2 días antes" },
  { days: 3, label: "3 días antes" },
];

export function ownReminderLabel(days: number | null): string {
  return OWN_REMINDER_OPTIONS.find((o) => o.days === days)?.label ?? "Predeterminado";
}

/** Para mostrar qué significa "Predeterminado" en el momento — el global de Ajustes, o 0 (el mismo día) si tampoco hay uno configurado ahí. */
export function globalReminderFallbackLabel(globalDays: number | null): string {
  if (globalDays === null) return "el mismo día";
  if (globalDays === 0) return "el mismo día";
  return `${globalDays} día${globalDays === 1 ? "" : "s"} antes`;
}
