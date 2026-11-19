import { randomUUID } from "expo-crypto";
import { eq, isNull } from "drizzle-orm";
import { db } from "../../../core/database/client";
import { subscriptions, priceHistory, reminderSettings } from "../../../core/database/schema";
import type { SubscriptionFormInput } from "../types";

export async function listSubscriptions() {
  return db.select().from(subscriptions);
}

export async function getSubscriptionById(id: string) {
  const rows = await db.select().from(subscriptions).where(eq(subscriptions.id, id)).limit(1);
  return rows[0] ?? null;
}

export async function getPriceHistory(subscriptionId: string) {
  return db.select().from(priceHistory).where(eq(priceHistory.subscriptionId, subscriptionId));
}

/** Historial completo de todas las suscripciones en una sola consulta — para
 * el dashboard, que necesita revisar aumentos de precio de todas a la vez. */
export async function listAllPriceHistory() {
  return db.select().from(priceHistory);
}

/**
 * Días de aviso antes del cobro para esta suscripción: usa el recordatorio
 * propio si existe, si no cae al global (subscriptionId null). null = sin aviso.
 */
export async function getReminderDaysBefore(subscriptionId: string) {
  const [propio, global] = await Promise.all([
    db
      .select()
      .from(reminderSettings)
      .where(eq(reminderSettings.subscriptionId, subscriptionId))
      .limit(1),
    db.select().from(reminderSettings).where(isNull(reminderSettings.subscriptionId)).limit(1),
  ]);
  return propio[0]?.daysBefore ?? global[0]?.daysBefore ?? null;
}

/** Recordatorio propio de esta suscripción únicamente (sin caer al global) — para precargar el selector al editar. */
export async function getOwnReminderDaysBefore(subscriptionId: string): Promise<number | null> {
  const [row] = await db
    .select()
    .from(reminderSettings)
    .where(eq(reminderSettings.subscriptionId, subscriptionId))
    .limit(1);
  return row?.daysBefore ?? null;
}

/** `days = null` borra el recordatorio propio (vuelve a usar el predeterminado global). */
export async function setSubscriptionReminderDaysBefore(
  subscriptionId: string,
  days: number | null
): Promise<void> {
  const [existing] = await db
    .select()
    .from(reminderSettings)
    .where(eq(reminderSettings.subscriptionId, subscriptionId))
    .limit(1);

  if (days === null) {
    if (existing) await db.delete(reminderSettings).where(eq(reminderSettings.id, existing.id));
    return;
  }
  if (existing) {
    await db.update(reminderSettings).set({ daysBefore: days }).where(eq(reminderSettings.id, existing.id));
  } else {
    await db.insert(reminderSettings).values({ id: randomUUID(), subscriptionId, daysBefore: days });
  }
}

/** Recordatorio global (subscriptionId null), aplica a toda suscripción sin uno propio. */
export async function getGlobalReminderDaysBefore(): Promise<number | null> {
  const [row] = await db
    .select()
    .from(reminderSettings)
    .where(isNull(reminderSettings.subscriptionId))
    .limit(1);
  return row?.daysBefore ?? null;
}

/** `days = null` borra el recordatorio global (vuelve a "sin aviso"). */
export async function setGlobalReminderDaysBefore(days: number | null): Promise<void> {
  const [existing] = await db
    .select()
    .from(reminderSettings)
    .where(isNull(reminderSettings.subscriptionId))
    .limit(1);

  if (days === null) {
    if (existing) await db.delete(reminderSettings).where(eq(reminderSettings.id, existing.id));
    return;
  }
  if (existing) {
    await db.update(reminderSettings).set({ daysBefore: days }).where(eq(reminderSettings.id, existing.id));
  } else {
    await db.insert(reminderSettings).values({ id: randomUUID(), subscriptionId: null, daysBefore: days });
  }
}

export async function createSubscription(input: SubscriptionFormInput) {
  const id = randomUUID();
  await db.insert(subscriptions).values({ id, status: "active", ...input });
  await db.insert(priceHistory).values({
    id: randomUUID(),
    subscriptionId: id,
    amount: input.amount,
  });
  return id;
}

/**
 * Actualiza una suscripción. Si `amount` cambia respecto al valor guardado,
 * inserta una fila en `price_history` — así el historial de precio (y la
 * detección de aumentos) se alimenta automáticamente de cada edición manual,
 * sin que las pantallas tengan que acordarse de hacerlo aparte.
 */
export async function updateSubscription(
  id: string,
  input: Partial<SubscriptionFormInput>
) {
  if (input.amount !== undefined) {
    const current = await getSubscriptionById(id);
    if (current && current.amount !== input.amount) {
      await db.insert(priceHistory).values({
        id: randomUUID(),
        subscriptionId: id,
        amount: input.amount,
      });
    }
  }
  await db.update(subscriptions).set(input).where(eq(subscriptions.id, id));
}

export async function markAsUsedToday(id: string) {
  await db.update(subscriptions).set({ lastUsedAt: new Date() }).where(eq(subscriptions.id, id));
}

export async function setSubscriptionStatus(
  id: string,
  status: "active" | "paused" | "cancelled"
) {
  await db.update(subscriptions).set({ status }).where(eq(subscriptions.id, id));
}

export async function deleteSubscription(id: string) {
  await db.delete(subscriptions).where(eq(subscriptions.id, id));
}
