import { useEffect, useMemo, useRef, useState } from "react";
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { GestureDetector, GestureHandlerRootView } from "react-native-gesture-handler";
import Animated from "react-native-reanimated";
import { useDragToDismiss } from "../../../core/design-system/hooks/useDragToDismiss";
import { formatCurrency, convertCurrency } from "../../../core/currency/exchangeRate";
import { useAppSettings } from "../../settings/hooks/useAppSettings";
import { useTheme } from "../../../core/design-system/hooks/useTheme";
import { FONT } from "../dashboardTheme";
import type { Subscription } from "../../../core/database/schema";

const CHART_YEARS_COUNT = 8;
const COLUMN_WIDTH = 58;
const BADGE_SLOT_HEIGHT = 26;
const BAR_MAX_HEIGHT = 96;
const LABEL_SLOT_HEIGHT = 26;

const CURRENCY_SYMBOL: Record<string, string> = { COP: "$", USD: "$", EUR: "€" };

/** Monto corto para el badge del gráfico ($3,2M / $264K) — evita que el
 * tooltip se trunque o se envuelva con montos grandes. */
function formatCompact(amount: number, currency: string): string {
  const symbol = CURRENCY_SYMBOL[currency] ?? "$";
  if (amount >= 1_000_000) return `${symbol}${(amount / 1_000_000).toFixed(1).replace(".", ",")}M`;
  if (amount >= 1_000) return `${symbol}${Math.round(amount / 1000)}K`;
  return `${symbol}${Math.round(amount)}`;
}

type Frecuencia = "mensual" | "anual";

function useChartData(activas: Subscription[], frecuencia: Frecuencia, mainCurrency: string) {
  return useMemo(() => {
    const currentYear = new Date().getFullYear();
    const years = Array.from({ length: CHART_YEARS_COUNT }, (_, i) => currentYear - (CHART_YEARS_COUNT - 1) + i);

    const totals = years.map((year) => {
      const mensual = activas
        .filter((s) => s.createdAt.getFullYear() <= year)
        .reduce((sum, s) => sum + convertCurrency(s.amount, s.currency, mainCurrency), 0);
      return frecuencia === "anual" ? mensual * 12 : mensual;
    });

    const max = Math.max(...totals, 1);
    const bars = years.map((year, i) => ({
      year,
      total: totals[i],
      height: totals[i] > 0 ? Math.max((totals[i] / max) * BAR_MAX_HEIGHT, 4) : 4,
    }));

    return { bars, currentYear };
  }, [activas, frecuencia]);
}

export function ExpenseAnalysisSheet({
  visible,
  onClose,
  activas,
}: {
  visible: boolean;
  onClose: () => void;
  activas: Subscription[];
}) {
  const DASH = useTheme();
  const [frecuencia, setFrecuencia] = useState<Frecuencia>("anual");
  const mainCurrency = useAppSettings((s) => s.mainCurrency);
  const { bars } = useChartData(activas, frecuencia, mainCurrency);
  const [selectedIndex, setSelectedIndex] = useState(bars.length - 1);
  const scrollRef = useRef<ScrollView>(null);
  const { gesture, animatedStyle, close } = useDragToDismiss(onClose, visible);

  // Al cambiar Mensual/Anual los totales se recalculan — vuelve a seleccionar
  // el año actual (última barra) en vez de dejar un índice con datos viejos.
  useEffect(() => {
    setSelectedIndex(bars.length - 1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [frecuencia]);

  // El gráfico abre mostrando el año actual (última barra) a la derecha —
  // sin esto, el scroll arrancaría mostrando los años más viejos (vacíos)
  // primero, obligando a desplazarse para ver el dato relevante.
  useEffect(() => {
    if (!visible) return;
    const id = setTimeout(() => scrollRef.current?.scrollToEnd({ animated: false }), 50);
    return () => clearTimeout(id);
  }, [visible, frecuencia]);

  const seleccionada = bars[selectedIndex] ?? bars[bars.length - 1];
  const anterior = bars[selectedIndex - 1];
  const variacion =
    anterior && anterior.total > 0
      ? Math.round(((seleccionada.total - anterior.total) / anterior.total) * 100)
      : null;

  return (
    <Modal visible={visible} transparent animationType="none" onRequestClose={close}>
      {/* Ver nota en SavingsSuggestionSheet.tsx: en Android el gesto de
          arrastrar-para-cerrar necesita su propio GestureHandlerRootView acá
          adentro, el de _layout.tsx no llega dentro del <Modal>. */}
      <GestureHandlerRootView style={{ flex: 1 }}>
      <Pressable style={StyleSheet.absoluteFill} onPress={close} />
      <View style={{ flex: 1, justifyContent: "flex-end" }} pointerEvents="box-none">
        <Animated.View
          style={[
            { backgroundColor: DASH.card, borderTopWidth: 1, borderColor: DASH.cardBorder },
            animatedStyle,
          ]}
          className="rounded-t-[40px] pt-2.5 pb-6 px-6"
        >
          <GestureDetector gesture={gesture}>
            <View className="items-center mb-3" hitSlop={{ top: 10, bottom: 10, left: 40, right: 40 }}>
              <View className="w-10 h-1 rounded-full" style={{ backgroundColor: DASH.dragHandle }} />
            </View>
          </GestureDetector>

          <Pressable onPress={(e) => e.stopPropagation()}>
          <View className="flex-row items-center justify-between mb-4">
            <Text className="text-[19px] tracking-tight" style={{ color: DASH.textPrimary, fontFamily: FONT.bold }}>
              Análisis de gasto
            </Text>
            <Pressable
              onPress={close}
              hitSlop={8}
              className="w-7 h-7 rounded-full items-center justify-center"
              style={{ backgroundColor: DASH.iconBg }}
            >
              <MaterialIcons name="close" size={16} color={DASH.textSecondary} />
            </Pressable>
          </View>

          <View
            className="flex-row items-center p-[3px] rounded-full mb-5"
            style={{ backgroundColor: DASH.bg, borderWidth: 1, borderColor: DASH.iconBg }}
          >
            {(["mensual", "anual"] as const).map((opcion) => {
              const activo = frecuencia === opcion;
              return (
                <Pressable
                  key={opcion}
                  onPress={() => setFrecuencia(opcion)}
                  className="flex-1 py-2 rounded-full items-center"
                  style={{ backgroundColor: activo ? DASH.dockActiveBg : "transparent" }}
                >
                  <Text
                    className="text-[14px] capitalize"
                    style={{
                      color: activo ? DASH.textPrimary : DASH.textSecondary,
                      fontFamily: activo ? FONT.bold : FONT.semibold,
                    }}
                  >
                    {opcion}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          <View className="mb-4">
            <View className="flex-row items-center justify-between mb-0.5">
              <Text className="text-[16px] tracking-tight" style={{ color: DASH.textPrimary, fontFamily: FONT.bold }}>
                {seleccionada.year}
              </Text>
              {variacion !== null && variacion !== 0 && (
                <View
                  className="flex-row items-center gap-1 px-2.5 py-0.5 rounded-full"
                  style={{
                    backgroundColor: variacion < 0 ? DASH.greenSoft : "rgba(255,98,89,0.15)",
                    borderWidth: 1,
                    borderColor: variacion < 0 ? DASH.violetSoftBorder : "rgba(255,98,89,0.3)",
                  }}
                >
                  <MaterialIcons
                    name={variacion < 0 ? "trending-down" : "trending-up"}
                    size={14}
                    color={variacion < 0 ? DASH.green : DASH.red}
                  />
                  <Text
                    className="text-[12px]"
                    style={{ color: variacion < 0 ? DASH.green : DASH.red, fontFamily: FONT.bold }}
                  >
                    {Math.abs(variacion)}%
                  </Text>
                </View>
              )}
            </View>

            <Text
              className="text-[34px] leading-tight tracking-tight my-1"
              style={{ color: DASH.textPrimary, fontFamily: FONT.extrabold }}
            >
              {formatCurrency(seleccionada.total, mainCurrency)}
            </Text>

            <View className="flex-row items-center gap-1.5">
              <MaterialIcons name="layers" size={16} color={DASH.textSecondary} />
              <Text className="text-[13px]" style={{ color: DASH.textSecondary, fontFamily: FONT.medium }}>
                {activas.length} {activas.length === 1 ? "suscripción" : "suscripciones"}
              </Text>
            </View>
          </View>

          {/* Gráfico con scroll horizontal — toca una barra para ver su
              monto arriba (reemplaza el total de arriba en vez de solo
              mostrarlo en un tooltip fijo sobre el año actual). */}
          <ScrollView
            ref={scrollRef}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingLeft: 4, paddingRight: 24, gap: 10, alignItems: "flex-end" }}
            className="mt-4 pt-2"
          >
            {bars.map((bar, i) => {
              const seleccionado = i === selectedIndex;
              return (
                <Pressable
                  key={bar.year}
                  onPress={() => setSelectedIndex(i)}
                  style={{ width: COLUMN_WIDTH, alignItems: "center" }}
                >
                  <View style={{ width: COLUMN_WIDTH, height: BADGE_SLOT_HEIGHT, justifyContent: "flex-end", alignItems: "center" }}>
                    {seleccionado && (
                      <View
                        className="px-2 py-0.5 rounded-full"
                        style={{ backgroundColor: DASH.bg, borderWidth: 1, borderColor: DASH.iconBg }}
                      >
                        <Text
                          className="text-[11px]"
                          numberOfLines={1}
                          style={{ color: DASH.textPrimary, fontFamily: FONT.semibold }}
                        >
                          {formatCompact(bar.total, mainCurrency)}
                        </Text>
                      </View>
                    )}
                  </View>
                  <View style={{ width: COLUMN_WIDTH, height: BAR_MAX_HEIGHT, justifyContent: "flex-end", alignItems: "center" }}>
                    <View
                      style={{
                        width: 28,
                        height: bar.height,
                        borderTopLeftRadius: 8,
                        borderTopRightRadius: 8,
                        backgroundColor: seleccionado ? DASH.textPrimary : DASH.iconBg,
                      }}
                    />
                  </View>
                  <View style={{ width: COLUMN_WIDTH, height: LABEL_SLOT_HEIGHT, justifyContent: "flex-start", alignItems: "center" }}>
                    <Text
                      className="text-[12px] mt-2"
                      style={{
                        color: seleccionado ? DASH.textPrimary : DASH.textSecondary,
                        fontFamily: seleccionado ? FONT.bold : FONT.medium,
                      }}
                    >
                      {bar.year}
                    </Text>
                  </View>
                </Pressable>
              );
            })}
          </ScrollView>

          <View className="w-full items-center pt-3 pb-1">
            <View className="w-32 h-1 rounded-full" style={{ backgroundColor: DASH.dragHandle }} />
          </View>
          </Pressable>
        </Animated.View>
      </View>
      </GestureHandlerRootView>
    </Modal>
  );
}
