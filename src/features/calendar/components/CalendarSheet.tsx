import { useMemo, useState } from "react";
import { Modal, Pressable, StyleSheet, Text, View } from "react-native";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { GestureDetector, GestureHandlerRootView } from "react-native-gesture-handler";
import Animated from "react-native-reanimated";
import {
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  format,
} from "date-fns";
import { es } from "date-fns/locale";
import { ServiceBadge } from "../../../core/design-system/components/ServiceBadge";
import { DashEmptyState } from "../../../core/design-system/components/DashEmptyState";
import { useDragToDismiss } from "../../../core/design-system/hooks/useDragToDismiss";
import { formatCurrency, convertToCOP, convertCurrency } from "../../../core/currency/exchangeRate";
import { useAppSettings } from "../../settings/hooks/useAppSettings";
import { useTheme } from "../../../core/design-system/hooks/useTheme";
import { FONT } from "../../dashboard/dashboardTheme";
import type { Subscription } from "../../../core/database/schema";

const WEEKDAY_LABELS = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];

/**
 * Bottom sheet con el calendario mensual de renovaciones — pedido exacto del
 * usuario a partir de un mockup HTML, distinto de la pantalla `calendar.tsx`
 * (tab clara de página completa). Mismo criterio que ExpenseAnalysisSheet:
 * modal oscuro propio en vez de una segunda navegación.
 */
export function CalendarSheet({
  visible,
  onClose,
  subscriptions,
  onSelectSubscription,
}: {
  visible: boolean;
  onClose: () => void;
  subscriptions: Subscription[];
  onSelectSubscription: (subscription: Subscription) => void;
}) {
  const DASH = useTheme();
  const [month, setMonth] = useState(() => new Date());
  const { gesture, animatedStyle, close } = useDragToDismiss(onClose, visible);
  const mainCurrency = useAppSettings((s) => s.mainCurrency);

  const days = useMemo(() => {
    const start = startOfWeek(startOfMonth(month), { weekStartsOn: 1 });
    const end = endOfWeek(endOfMonth(month), { weekStartsOn: 1 });
    return eachDayOfInterval({ start, end });
  }, [month]);

  const subscriptionsByDay = useMemo(() => {
    const map = new Map<string, Subscription[]>();
    for (const sub of subscriptions) {
      const key = sub.nextBillingDate.toDateString();
      const group = map.get(key) ?? [];
      group.push(sub);
      map.set(key, group);
    }
    return map;
  }, [subscriptions]);

  const delMes = useMemo(
    () => subscriptions.filter((s) => isSameMonth(s.nextBillingDate, month)),
    [subscriptions, month]
  );
  const totalMesCOP = useMemo(
    () => delMes.reduce((total, s) => total + convertToCOP(s.amount, s.currency), 0),
    [delMes]
  );

  return (
    <Modal visible={visible} transparent animationType="none" onRequestClose={close}>
      {/* Ver nota larga en useDragToDismiss.ts: animationType="none" porque
          la entrada/salida las maneja el hook de punta a punta. Android
          también necesita su propio GestureHandlerRootView acá adentro, el
          de _layout.tsx no llega dentro del <Modal>. */}
      <GestureHandlerRootView style={{ flex: 1 }}>
      <Pressable style={StyleSheet.absoluteFill} onPress={close} />
      <View style={{ flex: 1, justifyContent: "flex-end" }} pointerEvents="box-none">
        <Animated.View
          style={[
            { backgroundColor: DASH.card, borderTopWidth: 1, borderColor: DASH.cardBorder },
            animatedStyle,
          ]}
          className="rounded-t-[32px] pt-3 pb-8 px-5"
        >
          <GestureDetector gesture={gesture}>
            <View className="items-center mb-4" hitSlop={{ top: 10, bottom: 10, left: 40, right: 40 }}>
              <View className="w-10 h-1.5 rounded-full" style={{ backgroundColor: DASH.dragHandle }} />
            </View>
          </GestureDetector>

          <Pressable onPress={(e) => e.stopPropagation()}>
          <View className="flex-row items-center justify-between mb-3">
            <Text className="text-lg" style={{ color: DASH.textPrimary, fontFamily: FONT.bold }}>
              Calendario
            </Text>
            <Pressable
              onPress={close}
              hitSlop={12}
              className="w-7 h-7 rounded-full items-center justify-center active:scale-95"
              style={{ backgroundColor: DASH.iconBg, borderWidth: 1, borderColor: DASH.cardBorder }}
            >
              <Ionicons name="close" size={15} color={DASH.textPrimary} />
            </Pressable>
          </View>

          <View className="flex-row items-center justify-between mb-1">
            <Text
              className="text-[24px] tracking-tight capitalize"
              style={{ color: DASH.textPrimary, fontFamily: FONT.bold }}
            >
              {format(month, "MMMM yyyy", { locale: es })}
            </Text>
            <View className="flex-row items-center gap-2">
              <Pressable
                onPress={() => setMonth(new Date(month.getFullYear(), month.getMonth() - 1, 1))}
                className="w-8 h-8 rounded-full items-center justify-center active:scale-90"
                style={{ backgroundColor: DASH.iconBg, borderWidth: 1, borderColor: DASH.cardBorder }}
              >
                <MaterialIcons name="chevron-left" size={18} color={DASH.textPrimary} />
              </Pressable>
              <Pressable
                onPress={() => setMonth(new Date(month.getFullYear(), month.getMonth() + 1, 1))}
                className="w-8 h-8 rounded-full items-center justify-center active:scale-90"
                style={{ backgroundColor: DASH.iconBg, borderWidth: 1, borderColor: DASH.cardBorder }}
              >
                <MaterialIcons name="chevron-right" size={18} color={DASH.textPrimary} />
              </Pressable>
            </View>
          </View>

          <View className="flex-row items-center gap-2 mb-4">
            <Text className="text-[13px]" style={{ color: DASH.textPrimary, fontFamily: FONT.semibold }}>
              {formatCurrency(convertCurrency(totalMesCOP, "COP", mainCurrency), mainCurrency)} total
            </Text>
            <Text className="text-[13px]" style={{ color: DASH.textSecondary }}>•</Text>
            <Text className="text-[13px]" style={{ color: DASH.textSecondary, fontFamily: FONT.medium }}>
              {delMes.length} renovaciones
            </Text>
          </View>

          {subscriptions.length === 0 ? (
            <View style={{ minHeight: 340, justifyContent: "center" }}>
              <DashEmptyState
                icon="calendar-outline"
                title="Sin renovaciones todavía"
                description="Agrega una suscripción para verla en el calendario."
              />
            </View>
          ) : (
          <>
          <View className="flex-row mb-1.5">
            {WEEKDAY_LABELS.map((label) => (
              <View key={label} style={{ width: `${100 / 7}%` }} className="items-center">
                <Text className="text-[11px]" style={{ color: DASH.textSecondary, fontFamily: FONT.medium }}>
                  {label}
                </Text>
              </View>
            ))}
          </View>

          <View className="flex-row flex-wrap">
            {days.map((day) => {
              const enMes = isSameMonth(day, month);
              const cobros = subscriptionsByDay.get(day.toDateString()) ?? [];
              const principal = cobros[0];

              return (
                <View key={day.toISOString()} style={{ width: `${100 / 7}%`, padding: 3 }}>
                  <Pressable
                    disabled={!principal}
                    onPress={() => principal && onSelectSubscription(principal)}
                    className="h-12 rounded-xl items-center justify-between py-1.5"
                    style={{
                      backgroundColor: enMes ? DASH.iconBg : "transparent",
                      borderWidth: enMes ? 1 : 0,
                      borderColor: DASH.border,
                      opacity: enMes ? 1 : 0.35,
                    }}
                  >
                    <Text className="text-[11px]" style={{ color: DASH.textSecondary, fontFamily: FONT.regular }}>
                      {day.getDate()}
                    </Text>
                    {principal ? (
                      <View style={{ borderRadius: 6, overflow: "hidden" }}>
                        <ServiceBadge subscription={principal} size={20} />
                      </View>
                    ) : (
                      <View style={{ height: 20 }} />
                    )}
                  </Pressable>
                </View>
              );
            })}
          </View>
          </>
          )}
          </Pressable>
        </Animated.View>
      </View>
      </GestureHandlerRootView>
    </Modal>
  );
}
