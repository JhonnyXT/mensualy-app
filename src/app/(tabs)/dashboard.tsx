import { useEffect, useMemo, useState } from "react";
import { View, Text, ScrollView, Pressable, StyleSheet, Image } from "react-native";
import Svg, { Defs, RadialGradient, Stop, Rect } from "react-native-svg";
import { useRouter } from "expo-router";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useSubscriptions } from "../../features/subscriptions/hooks/useSubscriptions";
import { useCategories } from "../../features/categories/hooks/useCategories";
import { ServiceBadge } from "../../core/design-system/components/ServiceBadge";
import { DashEmptyState } from "../../core/design-system/components/DashEmptyState";
import { esSuscripcionZombie, diasSinUsar, esUsoBajoTemprano } from "../../features/savings/domain/detectarZombie";
import { detectarCategoriasDuplicadas } from "../../features/savings/domain/detectarCategoriaDuplicada";
import { detectarGastoDesproporcionado } from "../../features/savings/domain/detectarGastoDesproporcionado";
import { detectarAumentoPrecio } from "../../features/subscriptions/domain/detectarAumentoPrecio";
import { montoMensualYAnual } from "../../features/subscriptions/domain/montoMensualYAnual";
import * as subscriptionRepository from "../../features/subscriptions/repository/subscriptionRepository";
import { formatCurrency, convertToCOP, convertCurrency } from "../../core/currency/exchangeRate";
import { FONT } from "../../features/dashboard/dashboardTheme";
import { useTheme } from "../../core/design-system/hooks/useTheme";
import { ExpenseAnalysisSheet } from "../../features/dashboard/components/ExpenseAnalysisSheet";
import { CalendarSheet } from "../../features/calendar/components/CalendarSheet";
import { useAppSettings } from "../../features/settings/hooks/useAppSettings";
import { useSubscriptionSheets } from "../../features/subscriptions/hooks/useSubscriptionSheets";
import type { PriceHistoryEntry, Subscription } from "../../core/database/schema";

const MAX_BADGES_RESUMEN = 3;
const MAX_PROXIMAS_RENOVACIONES = 4;

function diasHasta(fecha: Date): number {
  return Math.max(0, Math.ceil((fecha.getTime() - Date.now()) / (1000 * 60 * 60 * 24)));
}

function MiniBadges({ subscriptions }: { subscriptions: Subscription[] }) {
  const DASH = useTheme();
  const router = useRouter();
  const visibles = subscriptions.slice(0, MAX_BADGES_RESUMEN);
  const restantes = subscriptions.length - visibles.length;
  return (
    <View className="flex-row items-center gap-1">
      {visibles.map((s) => (
        <View key={s.id} style={{ borderRadius: 999, overflow: "hidden" }}>
          <ServiceBadge subscription={s} size={18} />
        </View>
      ))}
      {restantes > 0 && (
        <Pressable
          onPress={() => router.push("/(tabs)/subscriptions")}
          hitSlop={6}
          className="rounded-full px-1.5 h-4 items-center justify-center active:opacity-70"
          style={{ backgroundColor: DASH.cardBorder }}
        >
          <Text className="text-[9px]" style={{ color: DASH.textPrimary, fontFamily: FONT.bold }}>
            +{restantes}
          </Text>
        </Pressable>
      )}
    </View>
  );
}

function MetricCard({
  icon,
  iconColor,
  label,
  title,
  amount,
  amountSuffix,
  subtitle,
  onPress,
}: {
  icon: keyof typeof MaterialIcons.glyphMap;
  iconColor: string;
  label: string;
  title: string;
  amount: string;
  amountSuffix?: string;
  subtitle?: string;
  onPress?: () => void;
}) {
  const DASH = useTheme();
  return (
    <Pressable
      onPress={onPress}
      className="p-3.5 rounded-2xl flex-row items-center justify-between"
      style={{ backgroundColor: DASH.card, borderWidth: 1, borderColor: DASH.cardBorder }}
    >
      <View className="flex-row items-center gap-3 flex-1">
        <View
          className="w-11 h-11 rounded-xl items-center justify-center shrink-0"
          style={{ backgroundColor: DASH.iconBg, borderWidth: 1, borderColor: "rgba(255,255,255,0.05)" }}
        >
          <MaterialIcons name={icon} size={22} color={iconColor} />
        </View>
        <View className="flex-1">
          <Text
            className="text-[12px] leading-tight"
            style={{ color: DASH.textSecondary, fontFamily: FONT.medium }}
          >
            {label}
          </Text>
          <Text
            className="text-[15px] leading-snug"
            numberOfLines={1}
            style={{ color: DASH.textPrimary, fontFamily: FONT.bold }}
          >
            {title}
          </Text>
        </View>
      </View>
      <View className="items-end">
        <Text className="text-[15px]" style={{ color: DASH.textPrimary, fontFamily: FONT.bold }}>
          {amount}
          {amountSuffix && (
            <Text className="text-[12px]" style={{ color: DASH.textSecondary, fontFamily: FONT.regular }}>
              {" "}
              {amountSuffix}
            </Text>
          )}
        </Text>
        {!!subtitle && (
          <Text
            className="text-[12px] mt-0.5"
            style={{ color: DASH.textSecondary, fontFamily: FONT.medium }}
          >
            {subtitle}
          </Text>
        )}
      </View>
    </Pressable>
  );
}

export default function DashboardScreen() {
  const DASH = useTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const openDetail = useSubscriptionSheets((s) => s.openDetail);
  const openSavings = useSubscriptionSheets((s) => s.openSavings);
  const { subscriptions, refresh } = useSubscriptions();
  const categories = useCategories();
  const profilePhotoUri = useAppSettings((s) => s.profilePhotoUri);
  const nombreUsuario = useAppSettings((s) => s.userName);
  const mainCurrency = useAppSettings((s) => s.mainCurrency);
  const mostrarCOP = (amountCOP: number) =>
    formatCurrency(convertCurrency(amountCOP, "COP", mainCurrency), mainCurrency);
  const mostrarMonto = (amount: number, currency: string) =>
    formatCurrency(convertCurrency(amount, currency, mainCurrency), mainCurrency);

  const [priceHistoryBySub, setPriceHistoryBySub] = useState<Record<string, PriceHistoryEntry[]>>({});

  useEffect(() => {
    refresh();
    subscriptionRepository.listAllPriceHistory().then((rows) => {
      const agrupado: Record<string, PriceHistoryEntry[]> = {};
      for (const row of rows) {
        (agrupado[row.subscriptionId] ??= []).push(row);
      }
      setPriceHistoryBySub(agrupado);
    });
  }, []);

  const activas = useMemo(() => subscriptions.filter((s) => s.status === "active"), [subscriptions]);

  // Suma el EQUIVALENTE MENSUAL de cada suscripción, no `amount` directo —
  // una anual de $120.000 debe sumar $10.000/mes, no $120.000/mes.
  const mensualCOP = (s: Subscription) => convertToCOP(montoMensualYAnual(s).mensual, s.currency);

  const gastoMensualCOP = useMemo(
    () => activas.reduce((total, s) => total + mensualCOP(s), 0),
    [activas]
  );
  const gastoAnualCOP = gastoMensualCOP * 12;

  const compartidas = useMemo(() => activas.filter((s) => s.isShared), [activas]);

  const ahorroMensualCOP = useMemo(
    () =>
      compartidas.reduce((total, s) => {
        const porcentajePareja = s.sharedSplitPercent ?? 50;
        return total + mensualCOP(s) * ((100 - porcentajePareja) / 100);
      }, 0),
    [compartidas]
  );

  const mayorGasto = useMemo<Subscription | null>(() => {
    if (activas.length === 0) return null;
    return activas.reduce((max, s) => (mensualCOP(s) > mensualCOP(max) ? s : max));
  }, [activas]);

  const categoriaTop = useMemo(() => {
    if (activas.length === 0) return null;
    const totales = new Map<string, number>();
    for (const s of activas) {
      totales.set(s.categoryId, (totales.get(s.categoryId) ?? 0) + mensualCOP(s));
    }
    const [categoryId, total] = [...totales.entries()].sort((a, b) => b[1] - a[1])[0];
    const categoria = categories.find((c) => c.id === categoryId);
    const count = activas.filter((s) => s.categoryId === categoryId).length;
    return categoria ? { categoria, total, count } : null;
  }, [activas, categories]);

  const proximasRenovaciones = useMemo(
    () => [...activas].sort((a, b) => a.nextBillingDate.getTime() - b.nextBillingDate.getTime()),
    [activas]
  );

  const [descartadas, setDescartadas] = useState<Set<string>>(new Set());
  const [analisisVisible, setAnalisisVisible] = useState(false);
  const [calendarVisible, setCalendarVisible] = useState(false);

  const sugerenciasAhorro = useMemo(() => {
    // Un mismo id no se sugiere dos veces por razones distintas — se prioriza
    // la señal más fuerte (zombie > aumento de precio > aviso temprano >
    // categoría duplicada > gasto desproporcionado > compartir).
    const usadas = new Set<string>();

    const zombies = activas
      .filter((s) => esSuscripcionZombie(s.lastUsedAt, s.createdAt) && !descartadas.has(s.id))
      .map((s) => {
        usadas.add(s.id);
        return {
          subscription: s,
          title: "Suscripción zombie detectada",
          message: `Sin uso registrado en ${s.name} hace ${diasSinUsar(s.lastUsedAt, s.createdAt)} días`,
          icon: "bedtime" as const,
          color: DASH.violet,
          softBg: DASH.violetSoft,
          softBorder: DASH.violetSoftBorder,
          onPress: () => openDetail(s.id),
        };
      });

    const aumentosPrecio = activas
      .filter((s) => !usadas.has(s.id) && !descartadas.has(s.id))
      .map((s) => ({ s, aumento: detectarAumentoPrecio(priceHistoryBySub[s.id] ?? [], s.amount) }))
      .filter(({ aumento }) => aumento.huboAumento)
      .map(({ s, aumento }) => {
        usadas.add(s.id);
        return {
          subscription: s,
          title: `${s.name} subió de precio`,
          message: `${aumento.porcentaje}% más caro en los últimos 12 meses`,
          icon: "trending-up" as const,
          color: DASH.red,
          softBg: "rgba(255,98,89,0.12)",
          softBorder: "rgba(255,98,89,0.25)",
          onPress: () => openDetail(s.id),
        };
      });

    const avisosTempranos = activas
      .filter(
        (s) => !usadas.has(s.id) && !descartadas.has(s.id) && esUsoBajoTemprano(s.lastUsedAt, s.createdAt)
      )
      .map((s) => {
        usadas.add(s.id);
        return {
          subscription: s,
          title: `Poco uso de ${s.name}`,
          message: `Sin uso registrado hace ${diasSinUsar(s.lastUsedAt, s.createdAt)} días`,
          icon: "hourglass-empty" as const,
          color: DASH.amber,
          softBg: DASH.amberSoft,
          softBorder: DASH.amberSoftBorder,
          onPress: () => openDetail(s.id),
        };
      });

    const duplicadas = detectarCategoriasDuplicadas(activas)
      .map((grupo) => {
        // Candidata a cortar: la menos usada del grupo.
        const candidata = [...grupo.subscriptions].sort(
          (a, b) => diasSinUsar(b.lastUsedAt, b.createdAt) - diasSinUsar(a.lastUsedAt, a.createdAt)
        )[0];
        return { grupo, candidata };
      })
      .filter(({ candidata }) => !usadas.has(candidata.id) && !descartadas.has(candidata.id))
      .map(({ grupo, candidata }) => {
        usadas.add(candidata.id);
        return {
          subscription: candidata,
          title: `${grupo.categoryName}: ${grupo.subscriptions.length} servicios`,
          message: `${grupo.subscriptions.map((s) => s.name).join(", ")} — ¿necesitas todos?`,
          icon: "layers" as const,
          color: DASH.violet,
          softBg: DASH.violetSoft,
          softBorder: DASH.violetSoftBorder,
          onPress: () => openDetail(candidata.id),
        };
      });

    const desproporcionadas = detectarGastoDesproporcionado(activas, gastoMensualCOP)
      .filter(({ subscription: s }) => !usadas.has(s.id) && !descartadas.has(s.id))
      .map(({ subscription: s, porcentaje }) => {
        usadas.add(s.id);
        return {
          subscription: s,
          title: `${s.name} pesa mucho en tu presupuesto`,
          message: `Es el ${Math.round(porcentaje)}% de tu gasto mensual en suscripciones`,
          icon: "warning" as const,
          color: DASH.red,
          softBg: "rgba(255,98,89,0.12)",
          softBorder: "rgba(255,98,89,0.25)",
          onPress: () => openDetail(s.id),
        };
      });

    const compartibles = activas
      .filter(
        (s) =>
          !s.isShared &&
          mensualCOP(s) >= 30000 &&
          !descartadas.has(s.id) &&
          !usadas.has(s.id)
      )
      .slice(0, 2)
      .map((s) => ({
        subscription: s,
        title: `Comparte ${s.name} con tu pareja`,
        message: "Ahorra dividiendo el costo automáticamente",
        icon: "savings" as const,
        color: DASH.amber,
        softBg: DASH.amberSoft,
        softBorder: DASH.amberSoftBorder,
        onPress: () => openSavings(s.id),
      }));

    return [...zombies, ...aumentosPrecio, ...avisosTempranos, ...duplicadas, ...desproporcionadas, ...compartibles];
  }, [activas, descartadas, priceHistoryBySub, gastoMensualCOP]);

  const iniciales = nombreUsuario.slice(0, 2).toUpperCase();

  return (
    <View className="flex-1" style={{ backgroundColor: DASH.bg }}>
      {/* Glow ambiental — degradado radial real vía react-native-svg (RN no
          tiene blur nativo), mismo mecanismo que `AuraBackground` de
          anchor-app: RadialGradient + Rect de pantalla completa en vez de un
          círculo plano, para que el borde se disuelva en vez de cortar. */}
      <Svg style={StyleSheet.absoluteFill} pointerEvents="none">
        <Defs>
          <RadialGradient id="dashGlowLeft" cx="8%" cy="-6%" r="48%">
            <Stop offset="0%" stopColor="rgb(124,107,255)" stopOpacity={0.32} />
            <Stop offset="45%" stopColor="rgb(124,107,255)" stopOpacity={0.13} />
            <Stop offset="100%" stopColor="rgb(124,107,255)" stopOpacity={0} />
          </RadialGradient>
          <RadialGradient id="dashGlowRight" cx="96%" cy="8%" r="40%">
            <Stop offset="0%" stopColor="rgb(124,107,255)" stopOpacity={0.2} />
            <Stop offset="70%" stopColor="rgb(124,107,255)" stopOpacity={0} />
          </RadialGradient>
        </Defs>
        <Rect width="100%" height="100%" fill="url(#dashGlowLeft)" />
        <Rect width="100%" height="100%" fill="url(#dashGlowRight)" />
      </Svg>

      <ScrollView
        className="flex-1 px-6"
        contentContainerStyle={{
          paddingTop: insets.top + 12,
          paddingBottom: 120,
          flexGrow: activas.length === 0 ? 1 : undefined,
        }}
      >
        {/* Header: saludo + avatar */}
        <View className="flex-row items-center justify-between mb-5">
          <Text
            className="text-[20px] tracking-tight"
            style={{ color: DASH.textPrimary, fontFamily: FONT.extrabold }}
          >
            Hola, {nombreUsuario}.
          </Text>
          <Pressable
            onPress={() => router.push("/(tabs)/settings")}
            className="w-12 h-12 rounded-full items-center justify-center active:scale-95 overflow-hidden"
            style={{ backgroundColor: "rgba(254,205,211,0.15)", borderWidth: 2, borderColor: "rgba(255,255,255,0.1)" }}
          >
            {profilePhotoUri ? (
              <Image source={{ uri: profilePhotoUri }} style={{ width: "100%", height: "100%" }} />
            ) : (
              <Text className="text-sm" style={{ color: DASH.textPrimary, fontFamily: FONT.extrabold }}>
                {iniciales}
              </Text>
            )}
          </Pressable>
        </View>

        {activas.length === 0 ? (
          <View style={{ flex: 1, justifyContent: "center" }}>
            <DashEmptyState
              icon="card-outline"
              title="Aún no tienes suscripciones"
              description="Agrega la primera con el botón de abajo para empezar a ver tu resumen."
            />
          </View>
        ) : (
          <>
            {/* Gasto mensual y anual — toca para abrir el análisis de gasto */}
            <Pressable onPress={() => setAnalisisVisible(true)} className="mb-6" style={{ gap: 16 }}>
              <View>
                <Text
                  className="text-[13px] tracking-tight"
                  style={{ color: DASH.textSecondary, fontFamily: FONT.medium }}
                >
                  Al mes gastas
                </Text>
                <Text
                  className="text-[34px] tracking-tight leading-none mt-0.5"
                  style={{ color: DASH.textPrimary, fontFamily: FONT.extrabold }}
                >
                  {mostrarCOP(gastoMensualCOP)}
                </Text>
              </View>
              <View>
                <Text
                  className="text-[13px] tracking-tight"
                  style={{ color: DASH.textSecondary, fontFamily: FONT.medium }}
                >
                  Eso al año es
                </Text>
                <Text
                  className="text-[34px] tracking-tight leading-none mt-0.5"
                  style={{ color: DASH.textPrimary, fontFamily: FONT.extrabold }}
                >
                  {mostrarCOP(gastoAnualCOP)}
                </Text>
              </View>
            </Pressable>

            {/* Resumen en texto con mini-badges */}
            <View className="mb-6" style={{ gap: 9 }}>
              <View className="flex-row items-center flex-wrap gap-1.5">
                <Text className="text-[14px]" style={{ color: DASH.textPrimary, fontFamily: FONT.semibold }}>
                  Tienes {activas.length}
                </Text>
                <MiniBadges subscriptions={activas} />
                <Text className="text-[14px]" style={{ color: DASH.textPrimary, fontFamily: FONT.semibold }}>
                  suscripciones.
                </Text>
              </View>

              {compartidas.length > 0 && (
                <View className="flex-row items-center flex-wrap gap-1.5">
                  <Text className="text-[14px]" style={{ color: DASH.textPrimary, fontFamily: FONT.semibold }}>
                    Compartes {compartidas.length}
                  </Text>
                  <MiniBadges subscriptions={compartidas} />
                  <Text className="text-[14px]" style={{ color: DASH.textPrimary, fontFamily: FONT.semibold }}>
                    suscripciones.
                  </Text>
                </View>
              )}

              {ahorroMensualCOP > 0 && (
                <Text className="text-[14px] pt-0.5" style={{ color: DASH.textPrimary, fontFamily: FONT.bold }}>
                  Reduces {mostrarCOP(ahorroMensualCOP)} tu gasto al mes.
                </Text>
              )}
            </View>

            {/* Tarjetas de métricas */}
            <View className="mb-7" style={{ gap: 10 }}>
              {mayorGasto && (
                <MetricCard
                  icon="trending-up"
                  iconColor={DASH.textPrimary}
                  label="Mayor gasto"
                  title={mayorGasto.name}
                  amount={mostrarMonto(montoMensualYAnual(mayorGasto).mensual, mayorGasto.currency)}
                  amountSuffix="/mes"
                  subtitle={categories.find((c) => c.id === mayorGasto.categoryId)?.name.toLowerCase()}
                  onPress={() => openDetail(mayorGasto.id)}
                />
              )}
              {categoriaTop && (
                <MetricCard
                  icon="grid-view"
                  iconColor={DASH.violet}
                  label="Categoría principal"
                  title={categoriaTop.categoria.name}
                  amount={mostrarCOP(categoriaTop.total)}
                  amountSuffix="/mes"
                  subtitle={`${categoriaTop.count} suscr.`}
                />
              )}
              {compartidas.length > 0 && (
                <MetricCard
                  icon="group"
                  iconColor={DASH.textPrimary}
                  label="Planes compartidos"
                  title={`${compartidas.length} ${compartidas.length === 1 ? "plan" : "planes"}`}
                  amount={`${mostrarCOP(ahorroMensualCOP)}/mes`}
                />
              )}
            </View>

            {/* Próxima renovación */}
            {proximasRenovaciones.length > 0 && (
              <View className="mb-7">
                <View className="flex-row items-center justify-between mb-3">
                  <Text
                    className="text-[15px] tracking-tight"
                    style={{ color: DASH.textPrimary, fontFamily: FONT.extrabold }}
                  >
                    Próxima renovación
                  </Text>
                  <Pressable onPress={() => setCalendarVisible(true)} hitSlop={8}>
                    <MaterialIcons name="calendar-today" size={17} color={DASH.textSecondary} />
                  </Pressable>
                </View>

                <View style={{ gap: 14 }}>
                  {proximasRenovaciones.slice(0, MAX_PROXIMAS_RENOVACIONES).map((s) => (
                    <Pressable
                      key={s.id}
                      onPress={() => openDetail(s.id)}
                      className="flex-row items-center justify-between py-1"
                    >
                      <View className="flex-row items-center gap-3.5">
                        <ServiceBadge subscription={s} size={44} />
                        <View>
                          <Text
                            className="text-[15px] leading-snug"
                            numberOfLines={1}
                            style={{ color: DASH.textPrimary, fontFamily: FONT.bold }}
                          >
                            {s.name}
                          </Text>
                          <Text
                            className="text-[13px]"
                            style={{ color: DASH.textSecondary, fontFamily: FONT.medium }}
                          >
                            {mostrarMonto(s.amount, s.currency)}/mes
                          </Text>
                        </View>
                      </View>
                      <Text className="text-[13px]" style={{ color: DASH.textSecondary, fontFamily: FONT.medium }}>
                        En {diasHasta(s.nextBillingDate)} días
                      </Text>
                    </Pressable>
                  ))}
                </View>
              </View>
            )}

            {/* Sugerencias de ahorro */}
            {sugerenciasAhorro.length > 0 && (
              <View className="mb-7" style={{ gap: 10 }}>
                <View className="flex-row items-center justify-between mb-1">
                  <Text
                    className="text-[15px] tracking-tight"
                    style={{ color: DASH.textPrimary, fontFamily: FONT.extrabold }}
                  >
                    Sugerencias de ahorro
                  </Text>
                  <Text className="text-[12px]" style={{ color: DASH.green, fontFamily: FONT.semibold }}>
                    {sugerenciasAhorro.length} {sugerenciasAhorro.length === 1 ? "activa" : "activas"}
                  </Text>
                </View>

                {sugerenciasAhorro.map((sugerencia) => (
                  <Pressable
                    key={sugerencia.subscription.id}
                    onPress={sugerencia.onPress}
                    className="flex-row items-center justify-between gap-3 p-3.5 rounded-2xl"
                    style={{ backgroundColor: DASH.card, borderWidth: 1, borderColor: DASH.cardBorder }}
                  >
                    <View className="flex-row items-center gap-3 flex-1">
                      <View
                        className="w-10 h-10 rounded-xl items-center justify-center shrink-0"
                        style={{ backgroundColor: sugerencia.softBg, borderWidth: 1, borderColor: sugerencia.softBorder }}
                      >
                        <MaterialIcons name={sugerencia.icon} size={19} color={sugerencia.color} />
                      </View>
                      <View className="flex-1">
                        <Text
                          className="text-[14px] leading-snug"
                          numberOfLines={1}
                          style={{ color: DASH.textPrimary, fontFamily: FONT.semibold }}
                        >
                          {sugerencia.title}
                        </Text>
                        <Text
                          className="text-[13px] mt-0.5"
                          numberOfLines={1}
                          style={{
                            color: sugerencia.icon === "savings" ? DASH.green : DASH.textSecondary,
                            fontFamily: FONT.medium,
                          }}
                        >
                          {sugerencia.message}
                        </Text>
                      </View>
                    </View>
                    <Pressable
                      hitSlop={8}
                      onPress={() => setDescartadas((prev) => new Set(prev).add(sugerencia.subscription.id))}
                      className="w-6 h-6 rounded-full items-center justify-center shrink-0"
                    >
                      <Ionicons name="close" size={16} color={DASH.textSecondary} />
                    </Pressable>
                  </Pressable>
                ))}
              </View>
            )}
          </>
        )}
      </ScrollView>

      <ExpenseAnalysisSheet
        visible={analisisVisible}
        onClose={() => setAnalisisVisible(false)}
        activas={activas}
      />

      <CalendarSheet
        visible={calendarVisible}
        onClose={() => setCalendarVisible(false)}
        subscriptions={activas}
        onSelectSubscription={(subscription) => {
          setCalendarVisible(false);
          openDetail(subscription.id);
        }}
      />
    </View>
  );
}
