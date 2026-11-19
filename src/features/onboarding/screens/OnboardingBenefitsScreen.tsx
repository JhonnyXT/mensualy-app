import { Pressable, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { MaterialIcons } from "@expo/vector-icons";
import { BrandMark } from "../../../core/design-system/components/BrandMark";
import { ONB } from "../onboardingTheme";

const BENEFITS = [
  {
    icon: "favorite" as const,
    color: ONB.accent,
    softBg: ONB.accentSoft,
    softBorder: ONB.accentSoftBorder,
    title: "Modo pareja",
    body: "Divide automáticamente el costo de las suscripciones compartidas con tu pareja.",
  },
  {
    icon: "bedtime" as const,
    color: ONB.success,
    softBg: ONB.successSoft,
    softBorder: ONB.successSoftBorder,
    title: "Detecta suscripciones zombie",
    body: "Te avisa si llevas meses sin usar algo que sigues pagando.",
  },
  {
    icon: "trending-up" as const,
    color: ONB.accent,
    softBg: ONB.accentSoft,
    softBorder: ONB.accentSoftBorder,
    title: "Alertas de aumento de precio",
    body: "Guarda el historial y te avisa cuánto subió cada suscripción.",
  },
  {
    icon: "calendar-month" as const,
    color: ONB.success,
    softBg: ONB.successSoft,
    softBorder: ONB.successSoftBorder,
    title: "Calendario anual",
    body: "Visualiza qué meses tendrás más carga de pagos en todo el año.",
  },
];

const LEGAL_ITEMS = ["Términos y condiciones", "Política de privacidad"];

export function OnboardingBenefitsScreen({
  onFinish,
  onBack,
}: {
  onFinish: () => void;
  onBack: () => void;
}) {
  const insets = useSafeAreaInsets();

  return (
    <View
      className="flex-1 px-5"
      style={{ backgroundColor: ONB.bg, paddingTop: insets.top + 8, paddingBottom: insets.bottom + 12 }}
    >
      <Pressable
        onPress={onBack}
        hitSlop={12}
        style={{ width: 32, height: 32, alignItems: "center", justifyContent: "center" }}
      >
        <MaterialIcons name="chevron-left" size={24} color={ONB.textPrimary} />
      </Pressable>

      <View className="flex-1 justify-between">
      <View className="items-center">
        <View className="mb-4 items-center justify-center">
          <BrandMark size={64} />
        </View>

        <Text className="font-extrabold text-[27px] leading-tight text-center px-1" style={{ color: ONB.textPrimary }}>
          Hecho para tu vida real
        </Text>
        <Text className="text-sm leading-snug text-center mt-2 max-w-[290px]" style={{ color: ONB.textSecondary }}>
          Todo esto, sin conectar tu banco ni tu tarjeta de crédito.
        </Text>
      </View>

      <View
        className="rounded-[28px] p-4 gap-2.5"
        style={{ backgroundColor: ONB.surface, borderWidth: 1, borderColor: ONB.border }}
      >
        {BENEFITS.map((benefit, index) => (
          <View key={benefit.title}>
            {index > 0 && <View className="h-[1px] w-full mb-2.5" style={{ backgroundColor: ONB.border }} />}
            <View className="flex-row items-center gap-3.5 p-2">
              <View
                className="w-11 h-11 rounded-2xl items-center justify-center shrink-0"
                style={{ backgroundColor: benefit.softBg, borderWidth: 1, borderColor: benefit.softBorder }}
              >
                <MaterialIcons name={benefit.icon} size={20} color={benefit.color} />
              </View>
              <View className="flex-1">
                <Text className="font-bold text-[14.5px] leading-snug" style={{ color: ONB.textPrimary }}>
                  {benefit.title}
                </Text>
                <Text className="text-[12px] leading-relaxed mt-0.5" style={{ color: ONB.textSecondary }}>
                  {benefit.body}
                </Text>
              </View>
            </View>
          </View>
        ))}
      </View>

      <View className="items-center gap-3">
        <Pressable onPress={onFinish} className="w-full active:opacity-90">
          <LinearGradient
            colors={[ONB.accent, "#6352E8"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={{
              height: 56,
              borderRadius: 999,
              width: "100%",
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
            }}
          >
            <Text className="text-white font-bold text-base">Empezar ahora</Text>
            <MaterialIcons name="arrow-forward" size={18} color="#FFFFFF" />
          </LinearGradient>
        </Pressable>

        <Text className="text-[11px] font-medium text-center" style={{ color: ONB.textSecondary }}>
          100% privado · Tus datos nunca salen de tu teléfono
        </Text>

        <View className="flex-row items-center justify-center flex-wrap gap-x-1.5 gap-y-1">
          {LEGAL_ITEMS.map((item, index) => (
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
    </View>
  );
}
