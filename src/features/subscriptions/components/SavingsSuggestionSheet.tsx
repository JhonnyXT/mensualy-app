import { useEffect, useState } from "react";
import { View, Text, Pressable, ScrollView, ActivityIndicator, Modal, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { GestureDetector, GestureHandlerRootView } from "react-native-gesture-handler";
import Animated from "react-native-reanimated";
import { useDragToDismiss } from "../../../core/design-system/hooks/useDragToDismiss";
import { useTheme } from "../../../core/design-system/hooks/useTheme";
import { useSubscriptionSheets } from "../hooks/useSubscriptionSheets";
import * as subscriptionRepository from "../repository/subscriptionRepository";
import { calcularDivisionCosto } from "../../sharing/domain/calcularDivisionCosto";
import { montoMensualYAnual } from "../domain/montoMensualYAnual";
import { formatCurrency } from "../../../core/currency/exchangeRate";
import { ServiceBadge } from "../../../core/design-system/components/ServiceBadge";
import { FONT } from "../../dashboard/dashboardTheme";
import type { Subscription } from "../../../core/database/schema";

/**
 * Sugerencia de ahorro "comparte con tu pareja" — mismo patrón de `<Modal>`
 * global que el resto de sheets de suscripciones (ver `NewSubscriptionSheet`
 * para el porqué de no usar rutas `transparentModal`).
 */
export function SavingsSuggestionSheet() {
  const DASH = useTheme();
  const id = useSubscriptionSheets((s) => s.savingsSubscriptionId);
  const closeSavings = useSubscriptionSheets((s) => s.closeSavings);
  const openEdit = useSubscriptionSheets((s) => s.openEdit);
  const { gesture, animatedStyle, close } = useDragToDismiss(closeSavings, id);

  const [subscription, setSubscription] = useState<Subscription | null>(null);

  useEffect(() => {
    if (!id) return;
    subscriptionRepository.getSubscriptionById(id).then(setSubscription);
  }, [id]);

  function activarModoPareja() {
    if (!subscription) return;
    closeSavings();
    openEdit(subscription.id);
  }

  return (
    <Modal visible={!!id} transparent animationType="none" onRequestClose={close}>
      {/* El gesto de arrastrar-para-cerrar necesita su propio
          GestureHandlerRootView acá adentro: en Android, `<Modal>` de RN
          renderiza en una ventana nativa separada del árbol principal, así
          que el GestureHandlerRootView montado en _layout.tsx no llega hasta
          acá y los gestos del handle simplemente no se registran. */}
      <GestureHandlerRootView style={{ flex: 1 }}>
        <Pressable style={StyleSheet.absoluteFill} onPress={close} />
        <View style={{ flex: 1, justifyContent: "flex-end" }} pointerEvents="box-none">
          <Animated.View
            style={[
              {
                maxHeight: "85%",
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

            {!subscription ? (
              <View className="py-16 items-center justify-center">
                <ActivityIndicator color={DASH.violet} />
              </View>
            ) : (
              <SavingsContent subscription={subscription} onClose={close} onActivate={activarModoPareja} />
            )}
          </Animated.View>
        </View>
      </GestureHandlerRootView>
    </Modal>
  );
}

function SavingsContent({
  subscription,
  onClose,
  onActivate,
}: {
  subscription: Subscription;
  onClose: () => void;
  onActivate: () => void;
}) {
  const DASH = useTheme();
  // Equivalente mensual, no `amount` directo — una suscripción anual o
  // semanal no vale lo mismo que su monto nominal por mes.
  const { mensual: montoMensual } = montoMensualYAnual(subscription);
  const division = calcularDivisionCosto(montoMensual, 50);
  const ahorroMensual = montoMensual - division.montoUsuario;
  const ahorroAnual = ahorroMensual * 12;

  return (
    <ScrollView contentContainerStyle={{ padding: 20, paddingTop: 8 }}>
      <View className="flex-row items-center justify-between">
        <Text className="text-lg" style={{ color: DASH.textPrimary, fontFamily: FONT.bold }}>
          Sugerencia de ahorro
        </Text>
        <Pressable
          onPress={onClose}
          hitSlop={12}
          className="w-7 h-7 rounded-full items-center justify-center active:scale-95"
          style={{ backgroundColor: DASH.card, borderWidth: 1, borderColor: DASH.cardBorder }}
        >
          <Ionicons name="close" size={15} color={DASH.textPrimary} />
        </Pressable>
      </View>

      <View className="flex-row items-center mt-4">
        <ServiceBadge subscription={subscription} size={40} />
        <View className="ml-3">
          <Text className="text-[15px]" style={{ color: DASH.textPrimary, fontFamily: FONT.semibold }}>
            {subscription.name}
          </Text>
          <Text className="text-xs" style={{ color: DASH.textSecondary, fontFamily: FONT.regular }}>
            Plan individual
          </Text>
        </View>
      </View>

      <View className="rounded-2xl p-4 mt-5" style={{ backgroundColor: DASH.greenSoft }}>
        <Text className="text-sm" style={{ color: DASH.green, fontFamily: FONT.semibold }}>
          Ahorra ~{formatCurrency(ahorroMensual, subscription.currency)}/mes
        </Text>
        <Text className="text-xs mt-0.5" style={{ color: DASH.green, fontFamily: FONT.medium }}>
          {formatCurrency(ahorroAnual, subscription.currency)}/año en tu bolsillo
        </Text>
      </View>

      <Text
        className="text-[11px] uppercase tracking-wider mt-6 mb-2"
        style={{ color: DASH.textSecondary, fontFamily: FONT.bold }}
      >
        Comparativa
      </Text>
      <View style={{ borderTopWidth: 1, borderColor: DASH.border }}>
        <View
          className="flex-row items-center justify-between py-3"
          style={{ borderBottomWidth: 1, borderColor: DASH.border }}
        >
          <Text className="text-sm" style={{ color: DASH.textSecondary, fontFamily: FONT.regular }}>
            Plan individual
          </Text>
          <Text className="text-sm" style={{ color: DASH.textPrimary, fontFamily: FONT.medium }}>
            {formatCurrency(montoMensual, subscription.currency)}/mes
          </Text>
        </View>
        <View
          className="flex-row items-center justify-between py-3"
          style={{ borderBottomWidth: 1, borderColor: DASH.border }}
        >
          <Text className="text-sm" style={{ color: DASH.textSecondary, fontFamily: FONT.regular }}>
            Compartida contigo y tu pareja
          </Text>
          <Text className="text-sm" style={{ color: DASH.green, fontFamily: FONT.semibold }}>
            ~{formatCurrency(division.montoUsuario, subscription.currency)}/mes
          </Text>
        </View>
      </View>

      <Text className="text-xs leading-relaxed mt-4" style={{ color: DASH.textSecondary, fontFamily: FONT.regular }}>
        Al compartir esta suscripción, el costo se divide entre los dos pero cada quien mantiene su
        propio acceso. Actívalo desde el detalle de la suscripción, en "Modo pareja".
      </Text>

      <Pressable
        onPress={onActivate}
        className="mt-6 rounded-2xl py-3.5 items-center active:opacity-80"
        style={{ backgroundColor: DASH.violet }}
      >
        <Text className="text-[15px]" style={{ color: "#FFFFFF", fontFamily: FONT.bold }}>
          Activar modo pareja
        </Text>
      </Pressable>
    </ScrollView>
  );
}
