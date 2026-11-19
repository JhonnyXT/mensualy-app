import { useEffect, useMemo, useState } from "react";
import { View, Text, TextInput, Pressable, ScrollView, Modal, StyleSheet } from "react-native";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { GestureDetector, GestureHandlerRootView } from "react-native-gesture-handler";
import Animated from "react-native-reanimated";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { useDragToDismiss } from "../../../core/design-system/hooks/useDragToDismiss";
import { useTheme } from "../../../core/design-system/hooks/useTheme";
import { useSubscriptions } from "../hooks/useSubscriptions";
import { useSubscriptionSheets } from "../hooks/useSubscriptionSheets";
import { useCategories } from "../../categories/hooks/useCategories";
import { useAppSettings } from "../../settings/hooks/useAppSettings";
import { ServiceBadge } from "../../../core/design-system/components/ServiceBadge";
import { DatePickerSheet } from "../../../core/design-system/components/DatePickerSheet";
import { SERVICES_CATALOG } from "../../../core/constants/services.catalog";
import { calcularDivisionCosto } from "../../sharing/domain/calcularDivisionCosto";
import { formatMontoInput, limpiarMontoInput } from "../../../core/currency/amountInput";
import { formatCurrency } from "../../../core/currency/exchangeRate";
import * as subscriptionRepository from "../repository/subscriptionRepository";
import { OWN_REMINDER_OPTIONS, globalReminderFallbackLabel } from "../../reminders/reminderOptions";
import { FONT } from "../../dashboard/dashboardTheme";
import type { BillingCycle } from "../types";

const CURRENCIES = ["COP", "USD", "EUR"] as const;
const CYCLES: { key: BillingCycle; label: string }[] = [
  { key: "weekly", label: "Semanal" },
  { key: "monthly", label: "Mensual" },
  { key: "yearly", label: "Anual" },
];

function SectionLabel({ children }: { children: string }) {
  const DASH = useTheme();
  return (
    <Text
      className="text-[11px] uppercase tracking-wider mb-2 px-0.5"
      style={{ color: DASH.textSecondary, fontFamily: FONT.bold }}
    >
      {children}
    </Text>
  );
}

function Toggle({ value, onToggle }: { value: boolean; onToggle: () => void }) {
  const DASH = useTheme();
  return (
    <Pressable
      onPress={onToggle}
      className="w-12 h-7 rounded-full p-0.5 justify-center"
      style={{ backgroundColor: value ? DASH.violet : DASH.iconBg }}
    >
      <View
        className="w-6 h-6 rounded-full bg-white"
        style={{ transform: [{ translateX: value ? 20 : 0 }] }}
      />
    </Pressable>
  );
}

/**
 * Sheet de "nueva suscripción" — montado siempre en `_layout.tsx` (patrón de
 * anchor-app) en vez de ser una ruta `transparentModal` de expo-router. Con
 * router.back() + drag-to-dismiss por Reanimated corriendo aparte de la
 * transición propia de la ruta, quedaba un rectángulo negro residual al
 * cerrar; un `<Modal>` nativo se monta/desmonta de forma atómica y no tiene
 * ese problema.
 */
export function NewSubscriptionSheet() {
  const DASH = useTheme();
  const insets = useSafeAreaInsets();
  const visible = useSubscriptionSheets((s) => s.newSheetVisible);
  const closeSheet = useSubscriptionSheets((s) => s.closeNewSheet);
  const { create } = useSubscriptions();
  const categories = useCategories();
  const mainCurrency = useAppSettings((s) => s.mainCurrency);
  const { gesture, animatedStyle, close } = useDragToDismiss(closeSheet, visible);

  const [serviceQuery, setServiceQuery] = useState("");
  const [serviceKey, setServiceKey] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [amount, setAmount] = useState("");
  const [currency, setCurrency] = useState<(typeof CURRENCIES)[number]>(mainCurrency);
  const [billingCycle, setBillingCycle] = useState<BillingCycle>("monthly");
  const [nextBillingDate, setNextBillingDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [categoryId, setCategoryId] = useState<string | null>(null);
  const [categoryPickerOpen, setCategoryPickerOpen] = useState(false);
  const [reminderDaysOverride, setReminderDaysOverride] = useState<number | null>(null);
  const [reminderPickerOpen, setReminderPickerOpen] = useState(false);
  const [globalReminderDays, setGlobalReminderDays] = useState<number | null>(null);
  const [isShared, setIsShared] = useState(false);
  const [sharedWithName, setSharedWithName] = useState("");
  const [sharedSplitPercent, setSharedSplitPercent] = useState(50);
  const [saving, setSaving] = useState(false);

  // El formulario queda en blanco cada vez que se abre — es un sheet que
  // se mantiene siempre montado, así que sin este reset reaparecería con
  // los datos de la suscripción anterior. La moneda arranca en la
  // `mainCurrency` elegida en Ajustes — elegir un servicio ya NO la
  // sobrescribe con el `defaultCurrency` del catálogo (pedido explícito:
  // el usuario espera ver siempre SU moneda, no la que el catálogo asuma
  // para ese servicio).
  useEffect(() => {
    if (!visible) return;
    setServiceQuery("");
    setServiceKey(null);
    setName("");
    setAmount("");
    setCurrency(mainCurrency);
    setBillingCycle("monthly");
    setNextBillingDate(new Date());
    setShowDatePicker(false);
    setCategoryId(null);
    setCategoryPickerOpen(false);
    setReminderDaysOverride(null);
    setReminderPickerOpen(false);
    subscriptionRepository.getGlobalReminderDaysBefore().then(setGlobalReminderDays);
    setIsShared(false);
    setSharedWithName("");
    setSharedSplitPercent(50);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible]);

  const serviceMatches = useMemo(() => {
    const q = serviceQuery.trim().toLowerCase();
    const list = q ? SERVICES_CATALOG.filter((s) => s.name.toLowerCase().includes(q)) : SERVICES_CATALOG;
    return list.slice(0, 12);
  }, [serviceQuery]);

  const selectedCategoryId = categoryId ?? categories[0]?.id ?? null;
  const selectedCategory = categories.find((c) => c.id === selectedCategoryId);
  const canSave =
    name.trim().length > 0 &&
    Number(amount) > 0 &&
    !!selectedCategoryId &&
    (!isShared || sharedWithName.trim().length > 0);

  const division = useMemo(() => {
    const value = Number(amount);
    if (!isShared || !(value > 0)) return null;
    return calcularDivisionCosto(value, sharedSplitPercent);
  }, [isShared, amount, sharedSplitPercent]);

  function handleSelectService(key: string) {
    const service = SERVICES_CATALOG.find((s) => s.key === key);
    if (!service) return;
    setServiceKey(key);
    if (name.trim().length === 0) setName(service.name);
    const matchingCategory = categories.find((c) => c.name === service.categoryName);
    if (matchingCategory) setCategoryId(matchingCategory.id);
  }

  // Cuando el servicio buscado no existe en el catálogo, se permite seguir
  // de todas formas con una suscripción "local" — sin `serviceKey`, el
  // nombre tipeado queda tal cual y el logo cae a iniciales (ServiceBadge ya
  // soporta esto solo). Pedido explícito: evitar que el usuario se quede
  // trabado si busca algo que no está (ej. un gimnasio local, un servicio
  // regional).
  function handleUseLocalService() {
    const query = serviceQuery.trim();
    if (!query) return;
    setServiceKey(null);
    setName(query);
    setServiceQuery("");
  }

  function cycleCurrency() {
    const index = CURRENCIES.indexOf(currency);
    setCurrency(CURRENCIES[(index + 1) % CURRENCIES.length]);
  }

  async function handleSave() {
    if (!canSave || saving) return;
    if (!selectedCategoryId) return;
    setSaving(true);
    try {
      const id = await create({
        name: name.trim(),
        serviceKey,
        categoryId: selectedCategoryId,
        amount: Number(amount),
        currency,
        billingCycle,
        customCycleDays: null,
        nextBillingDate,
        isShared,
        sharedWithName: isShared ? sharedWithName.trim() : null,
        sharedSplitPercent: isShared ? sharedSplitPercent : null,
        lastUsedAt: null,
        notes: null,
      });
      if (reminderDaysOverride !== null) {
        await subscriptionRepository.setSubscriptionReminderDaysBefore(id, reminderDaysOverride);
        // `create()` ya reprogramó notificaciones, pero sin este recordatorio
        // propio (se guarda después, recién con el id ya creado) — se vuelve
        // a reprogramar para que quede reflejado de una.
        await useSubscriptions.getState().refresh();
      }
      close();
    } finally {
      setSaving(false);
    }
  }

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
            {
              maxHeight: "90%",
              borderTopLeftRadius: 32,
              borderTopRightRadius: 32,
              overflow: "hidden",
              backgroundColor: DASH.bg,
              paddingBottom: insets.bottom,
            },
            animatedStyle,
          ]}
        >
          <GestureDetector gesture={gesture}>
            <View className="items-center pt-3" hitSlop={{ top: 10, bottom: 10, left: 40, right: 40 }}>
              <View className="w-10 h-1.5 rounded-full" style={{ backgroundColor: DASH.dragHandle }} />
            </View>
          </GestureDetector>

          <View className="flex-row items-center justify-between px-5 pt-3">
            <Text className="text-lg" style={{ color: DASH.textPrimary, fontFamily: FONT.bold }}>
              Nueva suscripción
            </Text>
            <Pressable
              onPress={close}
              hitSlop={12}
              className="w-7 h-7 rounded-full items-center justify-center active:scale-95"
              style={{ backgroundColor: DASH.card, borderWidth: 1, borderColor: DASH.cardBorder }}
            >
              <Ionicons name="close" size={15} color={DASH.textPrimary} />
            </Pressable>
          </View>

          <ScrollView
            contentContainerStyle={{ padding: 20, paddingBottom: 40 }}
            keyboardShouldPersistTaps="handled"
          >
            <SectionLabel>Servicio (opcional)</SectionLabel>
            <View
              className="flex-row items-center rounded-xl px-3.5 mb-3"
              style={{ backgroundColor: DASH.card, borderWidth: 1, borderColor: DASH.cardBorder }}
            >
              <MaterialIcons name="search" size={18} color={DASH.textSecondary} />
              <TextInput
                value={serviceQuery}
                onChangeText={setServiceQuery}
                placeholder="Buscar Netflix, Spotify, iCloud..."
                placeholderTextColor={DASH.textSecondary}
                className="flex-1 py-2.5 pl-2.5 text-sm"
                style={{ color: DASH.textPrimary, fontFamily: FONT.medium }}
              />
            </View>

            {serviceQuery.trim().length > 0 && serviceMatches.length === 0 ? (
              <Pressable
                onPress={handleUseLocalService}
                className="flex-row items-center gap-3 rounded-2xl p-3.5 mb-5"
                style={{ backgroundColor: DASH.card, borderWidth: 1, borderColor: DASH.cardBorder }}
              >
                <ServiceBadge subscription={{ serviceKey: null, name: serviceQuery.trim() }} size={40} />
                <View className="flex-1">
                  <Text className="text-sm" style={{ color: DASH.textPrimary, fontFamily: FONT.semibold }}>
                    No está en el catálogo
                  </Text>
                  <Text className="text-xs mt-0.5" style={{ color: DASH.textSecondary, fontFamily: FONT.medium }}>
                    Agregar "{serviceQuery.trim()}" como servicio local
                  </Text>
                </View>
                <Ionicons name="add-circle" size={22} color={DASH.violet} />
              </Pressable>
            ) : (
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ gap: 12, paddingBottom: 4 }}
                className="mb-5"
              >
                {serviceMatches.map((service) => {
                  const selected = serviceKey === service.key;
                  return (
                    <Pressable
                      key={service.key}
                      onPress={() => handleSelectService(service.key)}
                      className="items-center"
                      style={{ width: 64 }}
                    >
                      <View
                        className="rounded-2xl p-0.5"
                        style={{ borderWidth: 2, borderColor: selected ? DASH.violet : "transparent" }}
                      >
                        <ServiceBadge subscription={{ serviceKey: service.key, name: service.name }} size={48} />
                      </View>
                      <Text
                        numberOfLines={1}
                        className="text-[10px] mt-1.5 text-center"
                        style={{ color: selected ? DASH.textPrimary : DASH.textSecondary, fontFamily: FONT.medium }}
                      >
                        {service.name}
                      </Text>
                    </Pressable>
                  );
                })}
              </ScrollView>
            )}

            {/* Hero: monto + frecuencia, el dato que más pesa en la decisión */}
            <View
              className="rounded-2xl p-5 items-center mb-4"
              style={{ backgroundColor: DASH.card, borderWidth: 1, borderColor: DASH.cardBorder }}
            >
              <Text
                className="text-[11px] uppercase tracking-wider mb-3"
                style={{ color: DASH.textSecondary, fontFamily: FONT.bold }}
              >
                Monto recurrente
              </Text>
              <View className="flex-row items-center gap-2 mb-4">
                <Pressable
                  onPress={cycleCurrency}
                  className="px-2.5 py-1.5 rounded-lg active:opacity-70"
                  style={{ backgroundColor: DASH.iconBg }}
                >
                  <Text className="text-sm" style={{ color: DASH.textSecondary, fontFamily: FONT.bold }}>
                    {currency}
                  </Text>
                </Pressable>
                <TextInput
                  value={formatMontoInput(amount, currency)}
                  onChangeText={(text) => setAmount(limpiarMontoInput(text, currency))}
                  placeholder="0"
                  keyboardType="decimal-pad"
                  placeholderTextColor={DASH.textSecondary}
                  className="text-center text-[34px] min-w-[120px]"
                  style={{ color: DASH.textPrimary, fontFamily: FONT.extrabold }}
                />
              </View>
              <View className="w-full flex-row p-1 rounded-full" style={{ backgroundColor: DASH.iconBg }}>
                {CYCLES.map((c) => {
                  const active = billingCycle === c.key;
                  return (
                    <Pressable
                      key={c.key}
                      onPress={() => setBillingCycle(c.key)}
                      className="flex-1 py-2 rounded-full items-center"
                      style={{ backgroundColor: active ? DASH.violet : "transparent" }}
                    >
                      <Text
                        className="text-xs"
                        style={{ color: active ? "#FFFFFF" : DASH.textSecondary, fontFamily: FONT.semibold }}
                      >
                        {c.label}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            </View>

            {/* Detalles agrupados, patrón de lista tipo ajustes */}
            <View
              className="rounded-2xl overflow-hidden mb-4"
              style={{ backgroundColor: DASH.card, borderWidth: 1, borderColor: DASH.cardBorder }}
            >
              <View className="p-3.5 flex-row items-center gap-3">
                <ServiceBadge subscription={{ serviceKey, name: name || "?" }} size={34} />
                <Text className="text-sm" style={{ color: DASH.textSecondary, fontFamily: FONT.medium }}>
                  Nombre
                </Text>
                <TextInput
                  value={name}
                  onChangeText={setName}
                  placeholder="Ej: Netflix"
                  placeholderTextColor={DASH.textSecondary}
                  className="flex-1 text-right text-[15px]"
                  style={{ color: DASH.textPrimary, fontFamily: FONT.semibold }}
                />
              </View>
              <View className="h-[1px]" style={{ backgroundColor: DASH.border, marginLeft: 62 }} />

              <Pressable
                onPress={() => setCategoryPickerOpen((v) => !v)}
                className="p-3.5 flex-row items-center justify-between"
              >
                <View className="flex-row items-center gap-3">
                  <View
                    className="w-[34px] h-[34px] rounded-lg items-center justify-center"
                    style={{ backgroundColor: DASH.iconBg }}
                  >
                    <Ionicons name="pricetag-outline" size={16} color={DASH.violet} />
                  </View>
                  <Text className="text-sm" style={{ color: DASH.textSecondary, fontFamily: FONT.medium }}>
                    Categoría
                  </Text>
                </View>
                <View className="flex-row items-center gap-1.5">
                  <View className="px-2.5 py-1 rounded-full" style={{ backgroundColor: DASH.iconBg }}>
                    <Text className="text-xs" style={{ color: DASH.textPrimary, fontFamily: FONT.semibold }}>
                      {selectedCategory?.name ?? "Sin categoría"}
                    </Text>
                  </View>
                  <Ionicons
                    name={categoryPickerOpen ? "chevron-up" : "chevron-down"}
                    size={16}
                    color={DASH.textSecondary}
                  />
                </View>
              </Pressable>

              {categoryPickerOpen && (
                <View
                  className="flex-row flex-wrap gap-2 px-3.5 pb-3.5 pt-1"
                  style={{ borderTopWidth: 1, borderColor: DASH.border }}
                >
                  {categories.map((category) => {
                    const active = category.id === selectedCategoryId;
                    return (
                      <Pressable
                        key={category.id}
                        onPress={() => {
                          setCategoryId(category.id);
                          setCategoryPickerOpen(false);
                        }}
                        className="px-3 py-1.5 rounded-full active:opacity-70"
                        style={{ backgroundColor: active ? DASH.violet : DASH.iconBg }}
                      >
                        <Text
                          className="text-xs"
                          style={{ color: active ? "#FFFFFF" : DASH.textPrimary, fontFamily: FONT.semibold }}
                        >
                          {category.name}
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>
              )}
              <View className="h-[1px]" style={{ backgroundColor: DASH.border, marginLeft: 62 }} />

              <Pressable
                onPress={() => setShowDatePicker(true)}
                className="p-3.5 flex-row items-center justify-between"
              >
                <View className="flex-row items-center gap-3">
                  <View
                    className="w-[34px] h-[34px] rounded-lg items-center justify-center"
                    style={{ backgroundColor: DASH.iconBg }}
                  >
                    <Ionicons name="calendar-outline" size={16} color={DASH.green} />
                  </View>
                  <Text className="text-sm" style={{ color: DASH.textSecondary, fontFamily: FONT.medium }}>
                    Fecha de cobro
                  </Text>
                </View>
                <View className="flex-row items-center gap-1.5">
                  <Text className="text-sm" style={{ color: DASH.textPrimary, fontFamily: FONT.semibold }}>
                    {format(nextBillingDate, "d 'de' MMM yyyy", { locale: es })}
                  </Text>
                  <Ionicons name="chevron-forward" size={16} color={DASH.textSecondary} />
                </View>
              </Pressable>
              <View className="h-[1px]" style={{ backgroundColor: DASH.border, marginLeft: 62 }} />

              <Pressable
                onPress={() => setReminderPickerOpen((v) => !v)}
                className="p-3.5 flex-row items-center justify-between"
              >
                <View className="flex-row items-center gap-3">
                  <View
                    className="w-[34px] h-[34px] rounded-lg items-center justify-center"
                    style={{ backgroundColor: DASH.iconBg }}
                  >
                    <Ionicons name="notifications-outline" size={16} color={DASH.amber} />
                  </View>
                  <Text className="text-sm" style={{ color: DASH.textSecondary, fontFamily: FONT.medium }}>
                    Recordatorio
                  </Text>
                </View>
                <View className="flex-row items-center gap-1.5">
                  <Text className="text-sm" style={{ color: DASH.textPrimary, fontFamily: FONT.semibold }}>
                    {reminderDaysOverride === null
                      ? `Predeterminado (${globalReminderFallbackLabel(globalReminderDays)})`
                      : OWN_REMINDER_OPTIONS.find((o) => o.days === reminderDaysOverride)?.label}
                  </Text>
                  <Ionicons
                    name={reminderPickerOpen ? "chevron-up" : "chevron-down"}
                    size={16}
                    color={DASH.textSecondary}
                  />
                </View>
              </Pressable>

              {reminderPickerOpen && (
                <View
                  className="flex-row flex-wrap gap-2 px-3.5 pb-3.5 pt-1"
                  style={{ borderTopWidth: 1, borderColor: DASH.border }}
                >
                  {OWN_REMINDER_OPTIONS.map((option) => {
                    const active = option.days === reminderDaysOverride;
                    return (
                      <Pressable
                        key={String(option.days)}
                        onPress={() => {
                          setReminderDaysOverride(option.days);
                          setReminderPickerOpen(false);
                        }}
                        className="px-3 py-1.5 rounded-full active:opacity-70"
                        style={{ backgroundColor: active ? DASH.violet : DASH.iconBg }}
                      >
                        <Text
                          className="text-xs"
                          style={{ color: active ? "#FFFFFF" : DASH.textPrimary, fontFamily: FONT.semibold }}
                        >
                          {option.label}
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>
              )}
            </View>
            <DatePickerSheet
              visible={showDatePicker}
              initialDate={nextBillingDate}
              onClose={() => setShowDatePicker(false)}
              onConfirm={(date) => {
                setNextBillingDate(date);
                setShowDatePicker(false);
              }}
            />

            {/* Gasto compartido, campos existentes en el modelo pero sin UI de creación hasta ahora */}
            <View
              className="rounded-2xl overflow-hidden mb-6"
              style={{ backgroundColor: DASH.card, borderWidth: 1, borderColor: DASH.cardBorder }}
            >
              <View className="p-3.5 flex-row items-center justify-between gap-3">
                <View className="flex-row items-center gap-3 flex-1">
                  <View
                    className="w-[34px] h-[34px] rounded-lg items-center justify-center"
                    style={{ backgroundColor: DASH.iconBg }}
                  >
                    <Ionicons name="people-outline" size={16} color={DASH.amber} />
                  </View>
                  <View className="flex-1">
                    <Text className="text-sm" style={{ color: DASH.textPrimary, fontFamily: FONT.semibold }}>
                      Gasto compartido
                    </Text>
                    <Text
                      className="text-[11px] mt-0.5"
                      style={{ color: DASH.textSecondary, fontFamily: FONT.medium }}
                    >
                      {isShared ? `Dividido al ${sharedSplitPercent}%` : "Divide el costo con alguien más"}
                    </Text>
                  </View>
                </View>
                <Toggle value={isShared} onToggle={() => setIsShared((v) => !v)} />
              </View>

              {isShared && (
                <View className="px-3.5 pb-3.5 pt-1 gap-3" style={{ borderTopWidth: 1, borderColor: DASH.border }}>
                  <TextInput
                    value={sharedWithName}
                    onChangeText={setSharedWithName}
                    placeholder="¿Con quién la compartes?"
                    placeholderTextColor={DASH.textSecondary}
                    className="rounded-xl px-3.5 py-2.5 text-sm"
                    style={{ backgroundColor: DASH.iconBg, color: DASH.textPrimary, fontFamily: FONT.medium }}
                  />

                  <View className="flex-row items-center justify-between">
                    <Text className="text-xs" style={{ color: DASH.textSecondary, fontFamily: FONT.medium }}>
                      Tu porción
                    </Text>
                    <View className="flex-row items-center gap-3">
                      <Pressable
                        onPress={() => setSharedSplitPercent((p) => Math.max(0, p - 10))}
                        className="w-7 h-7 rounded-full items-center justify-center"
                        style={{ backgroundColor: DASH.iconBg }}
                      >
                        <Ionicons name="remove" size={14} color={DASH.textPrimary} />
                      </Pressable>
                      <Text
                        className="text-sm w-10 text-center"
                        style={{ color: DASH.textPrimary, fontFamily: FONT.bold }}
                      >
                        {sharedSplitPercent}%
                      </Text>
                      <Pressable
                        onPress={() => setSharedSplitPercent((p) => Math.min(100, p + 10))}
                        className="w-7 h-7 rounded-full items-center justify-center"
                        style={{ backgroundColor: DASH.iconBg }}
                      >
                        <Ionicons name="add" size={14} color={DASH.textPrimary} />
                      </Pressable>
                    </View>
                  </View>

                  {division && (
                    <View
                      className="rounded-xl p-3 flex-row items-center justify-between"
                      style={{ backgroundColor: DASH.violetSoft }}
                    >
                      <Text className="text-xs" style={{ color: DASH.textSecondary, fontFamily: FONT.medium }}>
                        Tú pagas · {sharedWithName.trim() || "esa persona"} paga
                      </Text>
                      <Text className="text-sm" style={{ color: DASH.violet, fontFamily: FONT.bold }}>
                        {formatCurrency(division.montoUsuario, currency)} ·{" "}
                        {formatCurrency(division.montoCompartido, currency)}
                      </Text>
                    </View>
                  )}
                </View>
              )}
            </View>

            <Pressable
              onPress={handleSave}
              disabled={!canSave || saving}
              className="rounded-2xl py-3.5 flex-row items-center justify-center gap-2 active:opacity-80"
              style={{ backgroundColor: canSave ? DASH.violet : DASH.card }}
            >
              <Ionicons name="add-circle" size={18} color={canSave ? "#FFFFFF" : DASH.textSecondary} />
              <Text
                className="text-[15px]"
                style={{ color: canSave ? "#FFFFFF" : DASH.textSecondary, fontFamily: FONT.bold }}
              >
                {saving ? "Guardando..." : "Crear suscripción"}
              </Text>
            </Pressable>
          </ScrollView>
        </Animated.View>
      </View>
      </GestureHandlerRootView>
    </Modal>
  );
}
