import { create } from "zustand";
import type { Subscription } from "../../../core/database/schema";
import * as subscriptionRepository from "../repository/subscriptionRepository";
import { calcularProximoCobro } from "../domain/calcularProximoCobro";
import { rescheduleAllReminders } from "../../reminders/notifications";
import type { SubscriptionFormInput } from "../types";

type SubscriptionsState = {
  subscriptions: Subscription[];
  isLoading: boolean;
  refresh: () => Promise<void>;
  create: (input: SubscriptionFormInput) => Promise<string>;
  update: (id: string, input: Partial<SubscriptionFormInput>) => Promise<void>;
  markAsUsedToday: (id: string) => Promise<void>;
  setStatus: (id: string, status: "active" | "paused" | "cancelled") => Promise<void>;
  remove: (id: string) => Promise<void>;
};

/**
 * Store global de suscripciones. Es deliberadamente "tonto" (solo cachea lo
 * último leído de SQLite y vuelve a leer todo tras cada escritura) porque el
 * volumen de datos de un usuario real (decenas de suscripciones, no miles)
 * no justifica actualizaciones optimistas ni normalización.
 */
export const useSubscriptions = create<SubscriptionsState>((set, get) => ({
  subscriptions: [],
  isLoading: false,

  refresh: async () => {
    set({ isLoading: true });
    let subscriptions = await subscriptionRepository.listSubscriptions();

    // Fechas de cobro ya vencidas se avanzan solas al próximo ciclo real
    // (ver calcularProximoCobro) y se persisten — así "próximo cobro"
    // siempre refleja la ocurrencia futura de verdad, sin que el usuario
    // tenga que reeditarla a mano cada mes/semana/año.
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    const vencidas = subscriptions.filter(
      (s) => s.status === "active" && s.nextBillingDate < hoy
    );
    if (vencidas.length > 0) {
      await Promise.all(
        vencidas.map((s) =>
          subscriptionRepository.updateSubscription(s.id, {
            nextBillingDate: calcularProximoCobro(s.nextBillingDate, s.billingCycle, s.customCycleDays, hoy),
          })
        )
      );
      subscriptions = await subscriptionRepository.listSubscriptions();
    }

    set({ subscriptions, isLoading: false });
    // Fire-and-forget: reprograma los recordatorios locales con la lista
    // recién leída. No se espera (`await`) porque no debe bloquear la UI
    // que llamó a refresh() — y si falla (ej. sin permiso de notificaciones)
    // no debe romper el refresh en sí, rescheduleAllReminders ya maneja eso.
    rescheduleAllReminders(subscriptions).catch(() => {});
  },

  create: async (input) => {
    const id = await subscriptionRepository.createSubscription(input);
    await get().refresh();
    return id;
  },

  update: async (id, input) => {
    await subscriptionRepository.updateSubscription(id, input);
    await get().refresh();
  },

  markAsUsedToday: async (id) => {
    await subscriptionRepository.markAsUsedToday(id);
    await get().refresh();
  },

  setStatus: async (id, status) => {
    await subscriptionRepository.setSubscriptionStatus(id, status);
    await get().refresh();
  },

  remove: async (id) => {
    await subscriptionRepository.deleteSubscription(id);
    await get().refresh();
  },
}));
