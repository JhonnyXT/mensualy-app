import { Platform } from "react-native";
import * as Notifications from "expo-notifications";
import { File, Paths } from "expo-file-system";
import type { Subscription } from "../../core/database/schema";
import * as subscriptionRepository from "../subscriptions/repository/subscriptionRepository";
import { formatCurrency } from "../../core/currency/exchangeRate";

const CHANNEL_ID = "subscription-reminders";
const REMINDER_PREFIX = "subscription-reminder-";
const NOTIFICATION_HOUR = 9;

// `rescheduleAllReminders` corre en cada refresh de la lista: sin este registro,
// el aviso de "rescate" (hora de hoy ya pasada) se volvía a disparar cada vez
// que se abría el dashboard. Guarda, por suscripción, el día en que ya salió.
const CATCH_UP_LOG = new File(Paths.document, "reminders-catch-up.json");

function readCatchUpLog(): Record<string, string> {
  try {
    return CATCH_UP_LOG.exists ? JSON.parse(CATCH_UP_LOG.textSync()) : {};
  } catch {
    return {};
  }
}

// Sin esto, una notificación programada que llega con la app en primer
// plano no se muestra (comportamiento por defecto de expo-notifications) —
// acá SÍ queremos que se vea igual, foreground o no.
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

async function ensureChannelAsync() {
  if (Platform.OS !== "android") return;
  await Notifications.setNotificationChannelAsync(CHANNEL_ID, {
    name: "Recordatorios de cobro",
    importance: Notifications.AndroidImportance.DEFAULT,
  });
}

function reminderIdentifier(subscriptionId: string) {
  return `${REMINDER_PREFIX}${subscriptionId}`;
}

/** Extrae el `subscriptionId` que viajó en `content.data` al tocar la notificación (null si no es una de recordatorio de cobro). */
export function getSubscriptionIdFromNotificationResponse(
  response: Notifications.NotificationResponse | null | undefined
): string | null {
  const id = response?.notification.request.content.data?.subscriptionId;
  return typeof id === "string" ? id : null;
}

function buildTriggerDate(billingDate: Date, daysBefore: number): Date {
  const trigger = new Date(billingDate);
  trigger.setDate(trigger.getDate() - daysBefore);
  trigger.setHours(NOTIFICATION_HOUR, 0, 0, 0);
  return trigger;
}

/**
 * Reprograma TODAS las notificaciones locales de cobro desde cero: cancela
 * las propias (prefijo `subscription-reminder-`, nunca toca otras
 * notificaciones que la app pudiera programar) y vuelve a crear una por
 * cada suscripción activa.
 *
 * Días de aviso: el propio de la suscripción si existe, si no el global de
 * Ajustes, y si NINGUNO de los dos está configurado, se usa 0 (el mismo
 * día) en vez de no avisar nada — pedido explícito: toda suscripción activa
 * con fecha de cobro debe generar al menos el aviso del día del cobro.
 */
async function doReschedule(subscriptions: Subscription[]) {
  const { status } = await Notifications.getPermissionsAsync();
  if (status !== "granted") return;

  await ensureChannelAsync();

  const scheduled = (await Notifications.getAllScheduledNotificationsAsync()).filter((n) =>
    n.identifier.startsWith(REMINDER_PREFIX)
  );
  const pending = new Set(scheduled.map((n) => n.identifier));
  await Promise.all(scheduled.map((n) => Notifications.cancelScheduledNotificationAsync(n.identifier)));

  const now = new Date();
  const today = now.toDateString();
  const active = subscriptions.filter((s) => s.status === "active");
  const catchUpLog = readCatchUpLog();
  let catchUpLogChanged = false;

  await Promise.all(
    active.map(async (sub) => {
      const configured = await subscriptionRepository.getReminderDaysBefore(sub.id);
      const daysBefore = configured ?? 0;
      const triggerDate = buildTriggerDate(new Date(sub.nextBillingDate), daysBefore);

      let effectiveTrigger = triggerDate;
      if (triggerDate <= now) {
        // Si el día del aviso (hoy, normalmente) ya pasó su hora fija de
        // las 9am — ej. se creó la suscripción o se activó el recordatorio
        // más tarde en el día — igual debe avisar HOY, no saltearse el
        // aviso hasta el ciclo siguiente. Se dispara casi de inmediato en
        // vez de a las 9am.
        const esMismoDia = triggerDate.toDateString() === today;
        if (!esMismoDia) return; // el día del aviso ya quedó completamente atrás
        // Ya avisó hoy — salvo que ese aviso siguiera pendiente (lo acabamos de
        // cancelar arriba): entonces se vuelve a programar para no perderlo.
        if (catchUpLog[sub.id] === today && !pending.has(reminderIdentifier(sub.id))) return;
        catchUpLog[sub.id] = today;
        catchUpLogChanged = true;
        effectiveTrigger = new Date(now.getTime() + 10_000);
      }

      await Notifications.scheduleNotificationAsync({
        identifier: reminderIdentifier(sub.id),
        content: {
          title: daysBefore === 0 ? `${sub.name} se cobra hoy` : `${sub.name} se cobra pronto`,
          body:
            daysBefore === 0
              ? `Hoy se renueva por ${formatCurrency(sub.amount, sub.currency)}.`
              : `Se renueva en ${daysBefore} día${daysBefore === 1 ? "" : "s"} por ${formatCurrency(sub.amount, sub.currency)}.`,
          data: { subscriptionId: sub.id },
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.DATE,
          date: effectiveTrigger,
          channelId: CHANNEL_ID,
        },
      });
    })
  );

  if (catchUpLogChanged) CATCH_UP_LOG.write(JSON.stringify(catchUpLog));
}

// Las pasadas corren en fila: dos refresh() seguidos no deben pisarse (una
// cancelando lo que la otra acaba de programar).
let queue: Promise<void> = Promise.resolve();

export function rescheduleAllReminders(subscriptions: Subscription[]): Promise<void> {
  const run = queue.then(() => doReschedule(subscriptions));
  queue = run.catch(() => {});
  return run;
}
