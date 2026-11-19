import { useMemo, useState } from "react";
import { Pressable, ScrollView, Text, TextInput, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { MaterialIcons } from "@expo/vector-icons";
import { SERVICES_CATALOG } from "../../../core/constants/services.catalog";
import { ServiceBadge } from "../../../core/design-system/components/ServiceBadge";
import { OnboardingHeader } from "../components/OnboardingHeader";
import { ONB } from "../onboardingTheme";
import { useOnboardingSelection } from "../onboardingSelectionStore";
import {
  ONBOARDING_CATEGORIES,
  ONBOARDING_CATEGORY_BY_SERVICE_KEY,
  type OnboardingServiceCategory,
} from "../onboardingServiceCategories";

export function OnboardingServicesScreen({
  onContinue,
  onSkip,
  onBack,
}: {
  onContinue: () => void;
  onSkip: () => void;
  onBack: () => void;
}) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<OnboardingServiceCategory>("all");
  const selectedServiceKeys = useOnboardingSelection((s) => s.selectedServiceKeys);
  const toggle = useOnboardingSelection((s) => s.toggle);
  const insets = useSafeAreaInsets();

  const visibleServices = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return SERVICES_CATALOG.filter((service) => {
      const matchesCategory =
        category === "all" || ONBOARDING_CATEGORY_BY_SERVICE_KEY[service.key] === category;
      const matchesQuery = normalizedQuery === "" || service.name.toLowerCase().includes(normalizedQuery);
      return matchesCategory && matchesQuery;
    });
  }, [query, category]);

  return (
    <View
      className="flex-1 px-6"
      style={{ backgroundColor: ONB.bg, paddingTop: insets.top + 4, paddingBottom: insets.bottom + 8 }}
    >
      <OnboardingHeader step={2} total={5} onBack={onBack} />

      <View className="mt-3 mb-4">
        <Text className="text-[26px] font-bold leading-[31px] tracking-tight" style={{ color: ONB.textPrimary }}>
          ¿Cuáles tienes contratadas?
        </Text>
        <Text className="text-sm leading-[20px] mt-1.5" style={{ color: ONB.textSecondary }}>
          Selecciona tus servicios habituales para anticipar cobros y optimizar tus finanzas.
        </Text>
      </View>

      <View
        className="flex-row items-center rounded-xl px-3.5 mb-3.5"
        style={{ backgroundColor: ONB.surface, borderWidth: 1, borderColor: ONB.border }}
      >
        <MaterialIcons name="search" size={18} color={ONB.textSecondary} />
        <TextInput
          value={query}
          onChangeText={setQuery}
          placeholder="Buscar Netflix, gym, iCloud..."
          placeholderTextColor={ONB.textSecondary}
          className="flex-1 py-2.5 pl-2.5 text-sm font-medium"
          style={{ color: ONB.textPrimary }}
        />
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        className="-mx-6"
        style={{ flexGrow: 0, marginBottom: 8 }}
        contentContainerStyle={{ gap: 6, paddingHorizontal: 24, alignItems: "center" }}
      >
        {ONBOARDING_CATEGORIES.map((item) => {
          const active = item.id === category;
          return (
            <Pressable
              key={item.id}
              onPress={() => setCategory(item.id)}
              className="px-3 py-1.5 rounded-full"
              style={{
                backgroundColor: active ? ONB.accent : ONB.surface,
                borderWidth: active ? 0 : 1,
                borderColor: ONB.border,
              }}
            >
              <Text
                className="text-xs font-semibold"
                style={{ color: active ? "#FFFFFF" : ONB.textSecondary }}
              >
                {item.label}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>

      <ScrollView className="flex-1" contentContainerStyle={{ gap: 8, paddingVertical: 8 }}>
        {visibleServices.map((service) => {
          const selected = selectedServiceKeys.includes(service.key);
          return (
            <Pressable
              key={service.key}
              onPress={() => toggle(service.key)}
              className="flex-row items-center justify-between p-3 rounded-2xl"
              style={{
                backgroundColor: selected ? ONB.accentSoft : ONB.surface,
                borderWidth: 1,
                borderColor: selected ? ONB.accent : ONB.border,
              }}
            >
              <View className="flex-row items-center gap-3">
                <ServiceBadge subscription={{ serviceKey: service.key, name: service.name }} size={44} />
                <View>
                  <Text className="text-sm font-semibold leading-tight" style={{ color: ONB.textPrimary }}>
                    {service.name}
                  </Text>
                  <Text className="text-xs mt-0.5" style={{ color: ONB.textSecondary }}>
                    {service.categoryName}
                  </Text>
                </View>
              </View>
              <View
                className="w-6 h-6 rounded-full items-center justify-center"
                style={{
                  backgroundColor: selected ? ONB.success : ONB.bg,
                  borderWidth: 2,
                  borderColor: selected ? ONB.success : ONB.border,
                }}
              >
                {selected && <MaterialIcons name="check" size={14} color="#FFFFFF" />}
              </View>
            </Pressable>
          );
        })}

        <View className="py-2.5 items-center">
          <View className="flex-row items-center gap-1.5">
            <MaterialIcons name="info-outline" size={14} color={ONB.accent} />
            <Text className="text-xs font-medium text-center" style={{ color: ONB.textSecondary }}>
              ¿No encuentras la tuya? Podrás añadir suscripciones manuales luego.
            </Text>
          </View>
        </View>
      </ScrollView>

      <View className="pt-4 pb-1">
        <Pressable onPress={onContinue} className="active:opacity-90">
          <LinearGradient
            colors={[ONB.accent, ONB.accentDark]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={{
              height: 52,
              borderRadius: 16,
              width: "100%",
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
            }}
          >
            <Text className="text-white font-semibold text-[15px]">
              {selectedServiceKeys.length > 0 ? `Continuar (${selectedServiceKeys.length})` : "Continuar"}
            </Text>
            <MaterialIcons name="arrow-forward" size={16} color="#FFFFFF" />
          </LinearGradient>
        </Pressable>

        <Pressable
          onPress={onSkip}
          hitSlop={10}
          style={{ height: 40, alignItems: "center", justifyContent: "center" }}
        >
          <Text className="text-[15px] font-semibold" style={{ color: ONB.textSecondary }}>
            Saltar
          </Text>
        </Pressable>

        <View className="flex-row items-center justify-center flex-wrap gap-x-1.5 gap-y-1 mt-1">
          {["Términos y condiciones", "Política de privacidad"].map((item, index) => (
            <View key={item} className="flex-row items-center gap-1.5">
              {index > 0 && (
                <Text className="text-[11px]" style={{ color: ONB.textSecondary }}>
                  ·
                </Text>
              )}
              <Text
                className="text-[11px] font-medium"
                style={{ color: ONB.textSecondary, textDecorationLine: "underline" }}
              >
                {item}
              </Text>
            </View>
          ))}
        </View>
      </View>
    </View>
  );
}
