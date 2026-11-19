import { useEffect, useMemo, useState } from "react";
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
import { useDragToDismiss } from "../hooks/useDragToDismiss";
import { useTheme } from "../hooks/useTheme";
import { FONT } from "../../../features/dashboard/dashboardTheme";

const WEEKDAY_LABELS = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];

/**
 * Selector de fecha con la misma grilla mensual que `CalendarSheet` (mismo
 * layout/paleta DASH) — reemplaza al `DateTimePicker` nativo del sistema en
 * `NewSubscriptionSheet`, que se veía inconsistente con el resto de la app.
 * A diferencia de `CalendarSheet` (que muestra renovaciones existentes),
 * este es puramente un picker de un solo día, sin datos de suscripciones.
 */
export function DatePickerSheet({
  visible,
  initialDate,
  onClose,
  onConfirm,
}: {
  visible: boolean;
  initialDate: Date;
  onClose: () => void;
  onConfirm: (date: Date) => void;
}) {
  const DASH = useTheme();
  const [month, setMonth] = useState(initialDate);
  const [selected, setSelected] = useState(initialDate);
  const { gesture, animatedStyle, close } = useDragToDismiss(onClose, visible);

  // Reabrir el picker debe arrancar mostrando la fecha ya elegida, no la
  // última que se haya navegado en una apertura anterior.
  useEffect(() => {
    if (visible) {
      setMonth(initialDate);
      setSelected(initialDate);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible]);

  const days = useMemo(() => {
    const start = startOfWeek(startOfMonth(month), { weekStartsOn: 1 });
    const end = endOfWeek(endOfMonth(month), { weekStartsOn: 1 });
    return eachDayOfInterval({ start, end });
  }, [month]);

  const hoy = new Date();

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
                  Fecha de cobro
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

              <View className="flex-row items-center justify-between mb-4">
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
                  const esSeleccionado = isSameDay(day, selected);
                  const esHoy = isSameDay(day, hoy);

                  return (
                    <View key={day.toISOString()} style={{ width: `${100 / 7}%`, padding: 3 }}>
                      <Pressable
                        onPress={() => setSelected(day)}
                        className="h-11 rounded-xl items-center justify-center"
                        style={{
                          backgroundColor: esSeleccionado ? DASH.violet : enMes ? DASH.iconBg : "transparent",
                          borderWidth: esHoy && !esSeleccionado ? 1 : 0,
                          borderColor: DASH.violet,
                          opacity: enMes ? 1 : 0.35,
                        }}
                      >
                        <Text
                          className="text-[13px]"
                          style={{
                            color: esSeleccionado ? "#FFFFFF" : DASH.textPrimary,
                            fontFamily: esSeleccionado ? FONT.bold : FONT.regular,
                          }}
                        >
                          {day.getDate()}
                        </Text>
                      </Pressable>
                    </View>
                  );
                })}
              </View>

              <Pressable
                onPress={() => onConfirm(selected)}
                className="mt-5 rounded-2xl py-3.5 items-center active:opacity-80"
                style={{ backgroundColor: DASH.violet }}
              >
                <Text className="text-[15px]" style={{ color: "#FFFFFF", fontFamily: FONT.bold }}>
                  Confirmar {format(selected, "d 'de' MMMM", { locale: es })}
                </Text>
              </Pressable>
            </Pressable>
          </Animated.View>
        </View>
      </GestureHandlerRootView>
    </Modal>
  );
}
