import { useEffect, useMemo, useState } from "react";
import { View, Text, FlatList, Pressable } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useSubscriptions } from "../../features/subscriptions/hooks/useSubscriptions";
import { ServiceBadge } from "../../core/design-system/components/ServiceBadge";
import { DashEmptyState } from "../../core/design-system/components/DashEmptyState";
import { CalendarSheet } from "../../features/calendar/components/CalendarSheet";
import { formatCurrency, convertToCOP, convertCurrency } from "../../core/currency/exchangeRate";
import { useAppSettings } from "../../features/settings/hooks/useAppSettings";
import { useSubscriptionSheets } from "../../features/subscriptions/hooks/useSubscriptionSheets";
import { FONT } from "../../features/dashboard/dashboardTheme";
import { useTheme } from "../../core/design-system/hooks/useTheme";
import { montoMensualYAnual } from "../../features/subscriptions/domain/montoMensualYAnual";
import type { Subscription } from "../../core/database/schema";

type StatusFilter = "all" | "active" | "cancelled";
type SortMode = "name_asc" | "name_desc" | "amount_desc" | "amount_asc";

const STATUS_FILTER_CYCLE: { key: StatusFilter; label: string }[] = [
  { key: "all", label: "Todas" },
  { key: "active", label: "Activas" },
  { key: "cancelled", label: "Canceladas" },
];

const SORT_CYCLE: { key: SortMode; label: string }[] = [
  { key: "name_asc", label: "Nombre (A–Z)" },
  { key: "name_desc", label: "Nombre (Z–A)" },
  { key: "amount_desc", label: "Monto (mayor a menor)" },
  { key: "amount_asc", label: "Monto (menor a mayor)" },
];

const UNIT_LABEL: Record<Subscription["billingCycle"], string> = {
  monthly: "mes",
  yearly: "año",
  weekly: "sem",
  custom: "mes",
};

function formatFechaCorta(fecha: Date): string {
  return fecha.toLocaleDateString("es-CO", { day: "2-digit", month: "short" }).replace(".", "");
}

function subtituloCobro(subscription: Subscription): string {
  if (subscription.status === "cancelled") return "Cancelada";
  const fecha = formatFechaCorta(subscription.nextBillingDate);
  if (subscription.billingCycle === "yearly") return `Renovación anual · ${fecha}`;
  return `Siguiente cobro: ${fecha}`;
}

function SubscriptionCard({
  subscription,
  onPress,
}: {
  subscription: Subscription;
  onPress: () => void;
}) {
  const DASH = useTheme();
  const isCancelled = subscription.status === "cancelled";

  return (
    <Pressable
      onPress={onPress}
      className="rounded-[22px] p-4 flex-row items-center justify-between active:scale-[0.99]"
      style={{
        backgroundColor: DASH.card,
        borderWidth: 1,
        borderColor: DASH.cardBorder,
        opacity: isCancelled ? 0.5 : 1,
      }}
    >
      <View className="flex-row items-center gap-3.5 flex-1 mr-3">
        <ServiceBadge subscription={subscription} size={48} />
        <View className="flex-1">
          <Text
            className="text-[16px] leading-snug"
            numberOfLines={1}
            style={{ color: DASH.textPrimary, fontFamily: FONT.semibold }}
          >
            {subscription.name}
          </Text>
          <Text
            className="text-[13px] mt-0.5"
            numberOfLines={1}
            style={{ color: DASH.textSecondary, fontFamily: FONT.regular }}
          >
            {subtituloCobro(subscription)}
          </Text>
        </View>
      </View>

      <View className="items-end shrink-0">
        <Text className="text-[17px]" style={{ color: DASH.textPrimary, fontFamily: FONT.semibold }}>
          {formatCurrency(subscription.amount, subscription.currency)}
        </Text>
        <Text className="text-[12px] mt-0.5" style={{ color: DASH.textSecondary, fontFamily: FONT.regular }}>
          {UNIT_LABEL[subscription.billingCycle]}
        </Text>
      </View>
    </Pressable>
  );
}

export default function SubscriptionsScreen() {
  const DASH = useTheme();
  const insets = useSafeAreaInsets();
  const { subscriptions, refresh } = useSubscriptions();
  const [filter, setFilter] = useState<StatusFilter>("all");
  const [sort, setSort] = useState<SortMode>("name_asc");
  const [calendarVisible, setCalendarVisible] = useState(false);
  const mainCurrency = useAppSettings((s) => s.mainCurrency);
  const openDetail = useSubscriptionSheets((s) => s.openDetail);

  useEffect(() => {
    refresh();
  }, []);

  const activas = useMemo(() => subscriptions.filter((s) => s.status === "active"), [subscriptions]);
  // Equivalente mensual de cada una, no `amount` directo — ver dashboard.tsx.
  const gastoMensualCOP = useMemo(
    () =>
      activas.reduce((total, s) => total + convertToCOP(montoMensualYAnual(s).mensual, s.currency), 0),
    [activas]
  );

  const filtered = useMemo(() => {
    const base = subscriptions.filter((s) => {
      if (filter === "active") return s.status === "active";
      if (filter === "cancelled") return s.status === "cancelled";
      return true;
    });
    const ordenado = [...base].sort((a, b) => {
      switch (sort) {
        case "name_desc":
          return b.name.localeCompare(a.name);
        case "amount_desc":
          return convertToCOP(b.amount, b.currency) - convertToCOP(a.amount, a.currency);
        case "amount_asc":
          return convertToCOP(a.amount, a.currency) - convertToCOP(b.amount, b.currency);
        case "name_asc":
        default:
          return a.name.localeCompare(b.name);
      }
    });
    // En "Todas" las activas van primero (el orden elegido se respeta dentro
    // de cada grupo) — las canceladas quedan al final, ya pagadas de más.
    if (filter !== "all") return ordenado;
    const activas = ordenado.filter((s) => s.status === "active");
    const resto = ordenado.filter((s) => s.status !== "active");
    return [...activas, ...resto];
  }, [subscriptions, filter, sort]);

  function cicloFiltro() {
    const idx = STATUS_FILTER_CYCLE.findIndex((f) => f.key === filter);
    setFilter(STATUS_FILTER_CYCLE[(idx + 1) % STATUS_FILTER_CYCLE.length].key);
  }

  function cicloOrden() {
    const idx = SORT_CYCLE.findIndex((s) => s.key === sort);
    setSort(SORT_CYCLE[(idx + 1) % SORT_CYCLE.length].key);
  }

  const filtroLabel = STATUS_FILTER_CYCLE.find((f) => f.key === filter)!.label;
  const ordenLabel = SORT_CYCLE.find((s) => s.key === sort)!.label;

  return (
    <View className="flex-1" style={{ backgroundColor: DASH.bg }}>
      <View className="px-5" style={{ paddingTop: insets.top + 12 }}>
        <View className="flex-row items-center justify-between">
          <Text
            className="text-[32px] tracking-tight"
            style={{ color: DASH.textPrimary, fontFamily: FONT.extrabold }}
          >
            Mis suscripciones
          </Text>
          <Pressable
            onPress={() => setCalendarVisible(true)}
            className="w-10 h-10 rounded-2xl items-center justify-center active:scale-95"
            style={{ backgroundColor: DASH.card, borderWidth: 1, borderColor: DASH.cardBorder }}
          >
            <MaterialIcons name="calendar-today" size={18} color={DASH.textPrimary} />
          </Pressable>
        </View>

        <View className="mt-2">
          <Text className="text-[17px]" style={{ color: DASH.textSecondary, fontFamily: FONT.regular }}>
            Pagas{" "}
            <Text style={{ color: DASH.textPrimary, fontFamily: FONT.medium }}>
              {formatCurrency(convertCurrency(gastoMensualCOP, "COP", mainCurrency), mainCurrency)}
            </Text>{" "}
            al mes.
          </Text>
          <Text className="text-[17px]" style={{ color: DASH.textSecondary, fontFamily: FONT.regular }}>
            Tienes {activas.length} suscripciones{" "}
            <Text style={{ color: DASH.green, fontFamily: FONT.medium }}>activas.</Text>
          </Text>
        </View>

        <View className="flex-row items-center justify-between mt-4 py-1">
          <Pressable onPress={cicloOrden} className="flex-row items-center active:opacity-60" hitSlop={6}>
            <Text className="text-[14px]" style={{ color: DASH.textSecondary, fontFamily: FONT.regular }}>
              Ordenar por:{" "}
              <Text style={{ color: DASH.textPrimary, fontFamily: FONT.medium }}>{ordenLabel}</Text>
            </Text>
            <MaterialIcons
              name="unfold-more"
              size={15}
              color={DASH.textSecondary}
              style={{ marginLeft: 3 }}
            />
          </Pressable>

          <Pressable onPress={cicloFiltro} className="flex-row items-center active:opacity-60" hitSlop={6}>
            <Text className="text-[14px]" style={{ color: DASH.textSecondary, fontFamily: FONT.regular }}>
              {filter === "all" ? "Filtrar" : filtroLabel}
            </Text>
            <MaterialIcons
              name="unfold-more"
              size={15}
              color={DASH.textSecondary}
              style={{ marginLeft: 3 }}
            />
          </Pressable>
        </View>
      </View>

      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{
          padding: 20,
          paddingBottom: 140,
          gap: 12,
          flexGrow: filtered.length === 0 ? 1 : undefined,
        }}
        ListEmptyComponent={
          <View style={{ flex: 1, justifyContent: "center" }}>
            {subscriptions.length === 0 ? (
              <DashEmptyState
                icon="list-outline"
                title="Aún no tienes suscripciones"
                description="Agrega la primera con el botón + de abajo."
              />
            ) : (
              <DashEmptyState
                icon="filter-outline"
                title="No hay suscripciones aquí"
                description="Prueba otro filtro o agrega una nueva suscripción."
              />
            )}
          </View>
        }
        renderItem={({ item }) => (
          <SubscriptionCard
            subscription={item}
            onPress={() => openDetail(item.id)}
          />
        )}
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
