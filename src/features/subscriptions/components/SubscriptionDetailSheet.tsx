import { useEffect, useMemo, useState } from "react";
import { View, Text, Pressable, ScrollView, ActivityIndicator, Modal, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { GestureDetector, GestureHandlerRootView } from "react-native-gesture-handler";
import Animated, { FadeIn, FadeOut, ZoomIn, ZoomOut } from "react-native-reanimated";
import { isSameDay } from "date-fns";
import { useDragToDismiss } from "../../../core/design-system/hooks/useDragToDismiss";
import { useTheme } from "../../../core/design-system/hooks/useTheme";
import { useSubscriptions } from "../hooks/useSubscriptions";
import { useSubscriptionSheets } from "../hooks/useSubscriptionSheets";
import * as subscriptionRepository from "../repository/subscriptionRepository";
import { detectarAumentoPrecio } from "../domain/detectarAumentoPrecio";
import { esSuscripcionZombie, diasSinUsar } from "../../savings/domain/detectarZombie";
import { calcularDivisionCosto } from "../../sharing/domain/calcularDivisionCosto";
import { montoMensualYAnual } from "../domain/montoMensualYAnual";
import { formatCurrency } from "../../../core/currency/exchangeRate";
import { ServiceBadge } from "../../../core/design-system/components/ServiceBadge";
import { FONT } from "../../dashboard/dashboardTheme";
import type { PriceHistoryEntry, Subscription } from "../../../core/database/schema";

const CYCLE_LABEL: Record<Subscription["billingCycle"], string> = {
  weekly: "Semanal",
  monthly: "Mensual",
  yearly: "Anual",
  custom: "Personalizado",
};

/** Duración estimada del ciclo actual en días, usada solo para la barra de progreso. */
function duracionCicloDias(subscription: Subscription): number {
  switch (subscription.billingCycle) {
    case "weekly":
      return 7;
    case "yearly":
      return 365;
    case "custom":
      return subscription.customCycleDays ?? 30;
    case "monthly":
    default:
      return 30;
  }
}

/**
 * Sheet de detalle de suscripción — montado siempre en `_layout.tsx` (mismo
 * patrón que `NewSubscriptionSheet`, ver ese archivo para el porqué de
 * migrar de ruta `transparentModal` a `<Modal>` nativo).
 */
export function SubscriptionDetailSheet() {
  const DASH = useTheme();
  const id = useSubscriptionSheets((s) => s.detailSubscriptionId);
  const closeDetail = useSubscriptionSheets((s) => s.closeDetail);
  const openEdit = useSubscriptionSheets((s) => s.openEdit);
  const { markAsUsedToday, setStatus } = useSubscriptions();
  const { gesture, animatedStyle, close } = useDragToDismiss(closeDetail, id);

  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [history, setHistory] = useState<PriceHistoryEntry[]>([]);
  const [reminderDays, setReminderDays] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [confirmingCancel, setConfirmingCancel] = useState(false);

  async function load() {
    if (!id) return;
    const [sub, hist, reminder] = await Promise.all([
      subscriptionRepository.getSubscriptionById(id),
      subscriptionRepository.getPriceHistory(id),
      subscriptionRepository.getReminderDaysBefore(id),
    ]);
    setSubscription(sub);
    setHistory(hist);
    setReminderDays(reminder);
    setLoading(false);
  }

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const aumento = useMemo(
    () => (subscription ? detectarAumentoPrecio(history, subscription.amount) : null),
    [subscription, history]
  );

  function goToEdit() {
    if (!subscription) return;
    closeDetail();
    openEdit(subscription.id);
  }

  const visible = !!id;

  return (
    <>
      <Modal visible={visible} transparent animationType="none" onRequestClose={close}>
        {/* animationType="none": la entrada/salida las maneja
            useDragToDismiss (Reanimated) de punta a punta — ver la nota
            larga en ese hook sobre el fogonazo negro que dejaba la
            transición nativa del Modal en este dispositivo.
            GestureHandlerRootView propio: en Android el gesto de
            arrastrar-para-cerrar necesita el suyo, el de _layout.tsx no
            llega dentro del <Modal>. */}
        <GestureHandlerRootView style={{ flex: 1 }}>
        <Pressable style={StyleSheet.absoluteFill} onPress={close} />
        <View style={{ flex: 1, justifyContent: "flex-end" }} pointerEvents="box-none">
          {loading || !subscription ? (
            <Animated.View
              style={[
                {
                  height: "60%",
                  borderTopLeftRadius: 32,
                  borderTopRightRadius: 32,
                  overflow: "hidden",
                  backgroundColor: DASH.bg,
                  alignItems: "center",
                  justifyContent: "center",
                },
                animatedStyle,
              ]}
            >
              <ActivityIndicator color={DASH.violet} />
            </Animated.View>
          ) : (
            <DetailContent
              subscription={subscription}
              history={history}
              reminderDays={reminderDays}
              aumento={aumento}
              gesture={gesture}
              animatedStyle={animatedStyle}
              onReload={load}
              onClose={close}
              onEdit={goToEdit}
              onMarkUsed={() => markAsUsedToday(subscription.id).then(load)}
              onRemove={() => setConfirmingCancel(true)}
              onReactivate={() => setStatus(subscription.id, "active").then(load)}
            />
          )}
        </View>
        </GestureHandlerRootView>
      </Modal>

      <CancelConfirmSheet
        visible={confirmingCancel}
        subscription={subscription}
        onDismiss={() => setConfirmingCancel(false)}
        onConfirm={() => (subscription ? setStatus(subscription.id, "cancelled") : Promise.resolve())}
        onDone={() => {
          setConfirmingCancel(false);
          close();
        }}
      />
    </>
  );
}

/**
 * Sheet de confirmación al cancelar, reemplaza el `Alert.alert` nativo por
 * uno con la estética DASH — pedido explícito del usuario a partir de un
 * mockup de referencia. Sin selector de duración de pausa: la app ya no
 * tiene "pausar", solo cancelar (soft-delete vía `status: "cancelled"`).
 */
function CancelConfirmSheet({
  visible,
  subscription,
  onDismiss,
  onConfirm,
  onDone,
}: {
  visible: boolean;
  subscription: Subscription | null;
  onDismiss: () => void;
  onConfirm: () => Promise<void>;
  onDone: () => void;
}) {
  const DASH = useTheme();
  const [confirming, setConfirming] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (visible) {
      setConfirming(false);
      setSuccess(false);
    }
  }, [visible]);

  if (!subscription) return null;

  async function handleConfirm() {
    setConfirming(true);
    await onConfirm();
    setSuccess(true);
    setTimeout(onDone, 1900);
  }

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={() => {
        if (!success) onDismiss();
      }}
    >
      <Animated.View
        entering={FadeIn.duration(180)}
        exiting={FadeOut.duration(150)}
        style={[StyleSheet.absoluteFill, { backgroundColor: "rgba(0,0,0,0.6)" }]}
      >
        <Pressable style={StyleSheet.absoluteFill} onPress={success ? undefined : onDismiss} />
      </Animated.View>

      <View
        style={{ flex: 1, alignItems: "center", justifyContent: "center", padding: 24 }}
        pointerEvents="box-none"
      >
        <Animated.View
          entering={ZoomIn.duration(220)}
          exiting={ZoomOut.duration(160)}
          style={{
            width: "100%",
            maxWidth: 336,
            backgroundColor: DASH.card,
            borderWidth: 1,
            borderColor: DASH.cardBorder,
            borderRadius: 28,
            padding: 24,
            alignItems: "center",
          }}
        >
          {success ? (
            <Animated.View entering={FadeIn.duration(200)} style={{ alignItems: "center" }}>
              <View
                className="w-16 h-16 rounded-full items-center justify-center mb-4"
                style={{ backgroundColor: DASH.greenSoft }}
              >
                <Ionicons name="checkmark-circle" size={34} color={DASH.green} />
              </View>
              <Text className="text-[17px]" style={{ color: DASH.textPrimary, fontFamily: FONT.bold }}>
                {subscription.name} cancelada
              </Text>
              <Text
                className="text-[13px] mt-1 text-center"
                style={{ color: DASH.textSecondary, fontFamily: FONT.regular }}
              >
                Ya no aparecerá en tu lista ni en tus gastos.
              </Text>
            </Animated.View>
          ) : (
            <>
              <View className="mb-4" style={{ width: 56, height: 56 }}>
                <ServiceBadge subscription={subscription} size={56} />
                <View
                  className="absolute -bottom-0.5 -right-0.5 w-6 h-6 rounded-full items-center justify-center"
                  style={{ backgroundColor: DASH.red }}
                >
                  <Ionicons name="close" size={14} color="#FFFFFF" />
                </View>
              </View>
              <Text
                className="text-[18px] text-center"
                style={{ color: DASH.textPrimary, fontFamily: FONT.bold }}
              >
                ¿Cancelar {subscription.name}?
              </Text>
              <Text
                className="text-[13px] mt-2 text-center leading-relaxed"
                style={{ color: DASH.textSecondary, fontFamily: FONT.regular }}
              >
                Dejará de sumarse a tu gasto mensual de{" "}
                <Text style={{ color: DASH.textPrimary, fontFamily: FONT.semibold }}>
                  {formatCurrency(subscription.amount, subscription.currency)}
                </Text>{" "}
                y desaparecerá de tu lista.
              </Text>
              <View style={{ width: "100%", marginTop: 20, gap: 10 }}>
                <Pressable
                  onPress={handleConfirm}
                  disabled={confirming}
                  className="w-full py-3 rounded-full items-center active:opacity-80"
                  style={{ backgroundColor: DASH.red, opacity: confirming ? 0.7 : 1 }}
                >
                  {confirming ? (
                    <ActivityIndicator color="#FFFFFF" size="small" />
                  ) : (
                    <Text className="text-sm" style={{ color: "#FFFFFF", fontFamily: FONT.semibold }}>
                      Cancelar suscripción
                    </Text>
                  )}
                </Pressable>
                <Pressable
                  onPress={onDismiss}
                  className="w-full py-3 rounded-full items-center active:opacity-80"
                  style={{ backgroundColor: DASH.iconBg }}
                >
                  <Text className="text-sm" style={{ color: DASH.textPrimary, fontFamily: FONT.medium }}>
                    Mantener activa
                  </Text>
                </Pressable>
              </View>
            </>
          )}
        </Animated.View>
      </View>
    </Modal>
  );
}

function DetailContent({
  subscription,
  history,
  reminderDays,
  aumento,
  gesture,
  animatedStyle,
  onClose,
  onEdit,
  onMarkUsed,
  onRemove,
  onReactivate,
}: {
  subscription: Subscription;
  history: PriceHistoryEntry[];
  reminderDays: number | null;
  aumento: ReturnType<typeof detectarAumentoPrecio> | null;
  gesture: ReturnType<typeof useDragToDismiss>["gesture"];
  animatedStyle: ReturnType<typeof useDragToDismiss>["animatedStyle"];
  onReload: () => void;
  onClose: () => void;
  onEdit: () => void;
  onMarkUsed: () => void;
  onRemove: () => void;
  onReactivate: () => void;
}) {
  const DASH = useTheme();

  const esZombie = esSuscripcionZombie(subscription.lastUsedAt, subscription.createdAt);
  const dias = diasSinUsar(subscription.lastUsedAt, subscription.createdAt);
  const usedToday = subscription.lastUsedAt ? isSameDay(subscription.lastUsedAt, new Date()) : false;
  const isCancelled = subscription.status === "cancelled";
  const division = subscription.isShared
    ? calcularDivisionCosto(subscription.amount, subscription.sharedSplitPercent ?? 50)
    : null;

  /**
   * Estado local de la tarjeta "Actividad", desacoplado de `usedToday`
   * (derivado de la BD) para poder mostrar la confirmación "Usada hoy" un
   * momento antes de desvanecer toda la tarjeta — si se derivara solo de
   * `usedToday`, la tarjeta desaparecía de golpe apenas se recargaba la
   * suscripción, sin dar tiempo a apreciar la confirmación.
   */
  const [markState, setMarkState] = useState<"idle" | "confirmed" | "hidden">(() =>
    usedToday ? "hidden" : "idle"
  );

  useEffect(() => {
    setMarkState(usedToday ? "hidden" : "idle");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [subscription.id]);

  function handleMarkUsed() {
    setMarkState("confirmed");
    onMarkUsed();
    setTimeout(() => setMarkState("hidden"), 1400);
  }

  const { mensual, anual } = montoMensualYAnual(subscription);

  const duracionCiclo = duracionCicloDias(subscription);
  const msRestantes = subscription.nextBillingDate.getTime() - Date.now();
  const diasRestantes = Math.max(0, Math.ceil(msRestantes / (1000 * 60 * 60 * 24)));
  const progreso = Math.min(1, Math.max(0, 1 - msRestantes / (duracionCiclo * 24 * 60 * 60 * 1000)));

  const filas: { icon: keyof typeof Ionicons.glyphMap; label: string; value: string; bold?: boolean }[] = [
    {
      icon: "calendar-outline",
      label: "Siguiente cobro",
      value: subscription.nextBillingDate.toLocaleDateString("es-CO", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }),
    },
    {
      icon: "card-outline",
      label: "Importe del cobro",
      value: formatCurrency(subscription.amount, subscription.currency),
    },
    {
      icon: "repeat-outline",
      label: "Frecuencia de cobro",
      value: CYCLE_LABEL[subscription.billingCycle],
      bold: true,
    },
  ];

  return (
    <Animated.View
      style={[
        {
          maxHeight: "92%",
          borderTopLeftRadius: 32,
          borderTopRightRadius: 32,
          overflow: "hidden",
          backgroundColor: DASH.bg,
        },
        animatedStyle,
      ]}
    >
      <GestureDetector gesture={gesture}>
        <View className="items-center pt-3" hitSlop={{ top: 10, bottom: 10, left: 40, right: 40 }}>
          <View className="w-10 h-1.5 rounded-full" style={{ backgroundColor: DASH.dragHandle }} />
        </View>
      </GestureDetector>

      <ScrollView
        removeClippedSubviews={false}
        contentContainerStyle={{ paddingTop: 12, paddingBottom: 40, paddingHorizontal: 20 }}
      >
        <View className="flex-row justify-end">
          <Pressable
            onPress={onClose}
            hitSlop={12}
            className="w-7 h-7 rounded-full items-center justify-center active:scale-95"
            style={{ backgroundColor: DASH.card, borderWidth: 1, borderColor: DASH.cardBorder }}
          >
            <Ionicons name="close" size={15} color={DASH.textPrimary} />
          </Pressable>
        </View>

        <View className="items-center mt-3">
          <ServiceBadge subscription={subscription} size={64} />
          <Text className="text-xl mt-3" style={{ color: DASH.textPrimary, fontFamily: FONT.bold }}>
            {subscription.name}
          </Text>
          {subscription.status === "active" ? (
            <View
              className="flex-row items-center rounded-full px-3 py-1 mt-2"
              style={{ backgroundColor: DASH.greenSoft, borderWidth: 1, borderColor: "rgba(52,199,122,0.2)" }}
            >
              <View className="w-1.5 h-1.5 rounded-full mr-1.5" style={{ backgroundColor: DASH.green }} />
              <Text className="text-xs" style={{ color: DASH.green, fontFamily: FONT.semibold }}>
                Activa
              </Text>
            </View>
          ) : isCancelled ? (
            <View
              className="flex-row items-center rounded-full px-3 py-1 mt-2"
              style={{ backgroundColor: "rgba(255,98,89,0.12)" }}
            >
              <View className="w-1.5 h-1.5 rounded-full mr-1.5" style={{ backgroundColor: DASH.red }} />
              <Text className="text-xs" style={{ color: DASH.red, fontFamily: FONT.semibold }}>
                Cancelada
              </Text>
            </View>
          ) : null}
        </View>

        <View className="flex-row mt-7 py-2" style={{ borderBottomWidth: 1, borderColor: DASH.cardBorder }}>
          <View className="flex-1 pl-0.5">
            <Text className="text-[20px] leading-none" style={{ color: DASH.textPrimary, fontFamily: FONT.bold }}>
              {formatCurrency(mensual, subscription.currency)}
            </Text>
            <Text className="text-[11px] mt-1.5" style={{ color: DASH.textSecondary, fontFamily: FONT.medium }}>
              Al mes
            </Text>
          </View>
          <View className="flex-1 pl-7" style={{ borderLeftWidth: 1, borderColor: DASH.cardBorder }}>
            <Text className="text-[20px] leading-none" style={{ color: DASH.textPrimary, fontFamily: FONT.bold }}>
              {formatCurrency(anual, subscription.currency)}
            </Text>
            <Text className="text-[11px] mt-1.5" style={{ color: DASH.textSecondary, fontFamily: FONT.medium }}>
              Anualmente
            </Text>
          </View>
        </View>

        <View>
          {filas.map((row, i) => (
            <View
              key={row.label}
              className="py-3.5 flex-row items-center justify-between"
              style={i < filas.length - 1 ? { borderBottomWidth: 1, borderColor: DASH.border } : undefined}
            >
              <View className="flex-row items-center gap-3">
                <Ionicons name={row.icon} size={16} color={DASH.textSecondary} />
                <Text className="text-[13px]" style={{ color: DASH.textSecondary, fontFamily: FONT.regular }}>
                  {row.label}
                </Text>
              </View>
              <Text
                className="text-[13px]"
                style={{ color: DASH.textPrimary, fontFamily: row.bold ? FONT.bold : FONT.medium }}
              >
                {row.value}
              </Text>
            </View>
          ))}
        </View>

        <View className="mt-4 pt-3" style={{ borderTopWidth: 1, borderColor: DASH.border }}>
          <Text
            className="text-[10px] uppercase tracking-wider"
            style={{ color: DASH.textSecondary, fontFamily: FONT.bold }}
          >
            Tiempo hasta el siguiente cobro
          </Text>
          <View className="flex-row justify-between mt-2.5">
            <Text className="text-[11px]" style={{ color: DASH.textSecondary, fontFamily: FONT.medium }}>
              Hoy
            </Text>
            <Text className="text-[11px]" style={{ color: DASH.textSecondary, fontFamily: FONT.medium }}>
              {subscription.nextBillingDate.toLocaleDateString("es-CO", {
                day: "2-digit",
                month: "short",
                year: "numeric",
              })}
            </Text>
          </View>
          <View
            className="h-2 rounded-full mt-1.5 overflow-hidden"
            style={{ backgroundColor: DASH.iconBg }}
          >
            <View
              className="h-full rounded-full"
              style={{ width: `${progreso * 100}%`, backgroundColor: DASH.green }}
            />
          </View>
          <Text className="text-[13px] mt-2" style={{ color: DASH.textPrimary, fontFamily: FONT.bold }}>
            {diasRestantes <= 0 ? "Es hoy" : `En ${diasRestantes} días`}
          </Text>
        </View>

        <View
          className="mt-4 pt-3.5 flex-row items-center justify-between"
          style={{ borderTopWidth: 1, borderColor: DASH.border }}
        >
          <View className="flex-row items-center gap-3">
            <Ionicons name="notifications-outline" size={16} color={DASH.textSecondary} />
            <Text className="text-[13px]" style={{ color: DASH.textSecondary, fontFamily: FONT.regular }}>
              Aviso de renovación
            </Text>
          </View>
          <Text className="text-[13px]" style={{ color: DASH.textSecondary, fontFamily: FONT.regular }}>
            {/* Sin recordatorio propio ni global, `rescheduleAllReminders` avisa el
                mismo día del cobro: nunca hay "sin aviso". */}
            {!reminderDays ? "El mismo día" : `${reminderDays} ${reminderDays === 1 ? "día" : "días"} antes`}
          </Text>
        </View>

        {aumento?.huboAumento && (
          <View
            className="mt-5 rounded-2xl p-3.5 flex-row items-center"
            style={{ backgroundColor: DASH.amberSoft, borderWidth: 1, borderColor: DASH.amberSoftBorder }}
          >
            <Ionicons name="trending-up" size={18} color={DASH.amber} />
            <Text className="text-sm ml-2" style={{ color: DASH.amber, fontFamily: FONT.semibold }}>
              Subió {aumento.porcentaje}% en los últimos 12 meses
            </Text>
          </View>
        )}

        {!isCancelled && markState !== "hidden" && (
          <Animated.View
            exiting={FadeOut.duration(380)}
            className="mt-5 rounded-2xl p-4"
            style={{ backgroundColor: DASH.card, borderWidth: 1, borderColor: DASH.cardBorder }}
          >
            <View className="flex-row items-center justify-between">
              <Text className="text-sm" style={{ color: DASH.textPrimary, fontFamily: FONT.semibold }}>
                Actividad
              </Text>
              {esZombie && markState === "idle" && (
                <View className="rounded-full px-2.5 py-1" style={{ backgroundColor: DASH.amberSoft }}>
                  <Text className="text-xs" style={{ color: DASH.amber, fontFamily: FONT.medium }}>
                    Sin usar hace {dias} días
                  </Text>
                </View>
              )}
            </View>
            {markState === "confirmed" ? (
              <Animated.View
                entering={FadeIn.duration(320)}
                className="mt-3 rounded-full py-2.5 items-center flex-row justify-center"
                style={{ backgroundColor: DASH.greenSoft, borderWidth: 1, borderColor: "rgba(52,199,122,0.2)" }}
              >
                <Ionicons name="checkmark-circle" size={16} color={DASH.green} />
                <Text className="text-sm ml-1.5" style={{ color: DASH.green, fontFamily: FONT.medium }}>
                  Usada hoy
                </Text>
              </Animated.View>
            ) : (
              <Pressable
                onPress={handleMarkUsed}
                className="mt-3 rounded-full py-2.5 items-center active:opacity-80"
                style={{ backgroundColor: DASH.iconBg }}
              >
                <Text className="text-sm" style={{ color: DASH.textPrimary, fontFamily: FONT.medium }}>
                  Marcar como usada hoy
                </Text>
              </Pressable>
            )}
          </Animated.View>
        )}

        {division && (
          <View
            className="mt-4 rounded-2xl p-4"
            style={{ backgroundColor: DASH.card, borderWidth: 1, borderColor: DASH.cardBorder }}
          >
            <Text className="text-sm" style={{ color: DASH.textPrimary, fontFamily: FONT.semibold }}>
              Compartida con {subscription.sharedWithName}
            </Text>
            <Text className="text-sm mt-1" style={{ color: DASH.textSecondary, fontFamily: FONT.regular }}>
              Tú pagas {formatCurrency(division.montoUsuario, subscription.currency)} ·{" "}
              {subscription.sharedWithName} paga{" "}
              {formatCurrency(division.montoCompartido, subscription.currency)}
            </Text>
          </View>
        )}

        <View className="mt-6">
          {isCancelled ? (
            <Pressable
              onPress={onReactivate}
              className="rounded-2xl py-3 items-center active:opacity-80"
              style={{ backgroundColor: DASH.violetSoft, borderWidth: 1, borderColor: DASH.violetSoftBorder }}
            >
              <Text className="text-sm" style={{ color: DASH.violet, fontFamily: FONT.medium }}>
                Reactivar suscripción
              </Text>
            </Pressable>
          ) : (
            <Pressable
              onPress={onRemove}
              className="rounded-2xl py-3 items-center active:opacity-80"
              style={{ backgroundColor: "rgba(255,98,89,0.12)" }}
            >
              <Text className="text-sm" style={{ color: DASH.red, fontFamily: FONT.medium }}>
                Cancelar
              </Text>
            </Pressable>
          )}
        </View>

        <Pressable onPress={onEdit} className="mt-3 py-2 items-center">
          <Text className="text-sm" style={{ color: DASH.textSecondary, fontFamily: FONT.medium }}>
            Editar suscripción
          </Text>
        </Pressable>
      </ScrollView>
    </Animated.View>
  );
}
