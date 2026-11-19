import { Pressable, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { MaterialIcons } from "@expo/vector-icons";
import { ServiceBadge } from "../../../core/design-system/components/ServiceBadge";
import { OnboardingHeader } from "../components/OnboardingHeader";
import { ONB } from "../onboardingTheme";

const BENEFITS = [
  {
    icon: "notifications-active" as const,
    color: ONB.accent,
    softBg: ONB.accentSoft,
    title: "Recordatorios a tiempo",
    body: "Te avisamos antes de la fecha que tú registraste, sin acceder a tu banco.",
  },
  {
    icon: "price-change" as const,
    color: ONB.success,
    softBg: ONB.successSoft,
    title: "Alertas de aumento de precio",
    body: "Te avisamos si Netflix, Spotify o iCloud suben de tarifa.",
  },
  {
    icon: "verified-user" as const,
    color: ONB.accent,
    softBg: ONB.accentSoft,
    title: "100% privado",
    body: "Tus datos se guardan solo en tu teléfono, nunca en la nube.",
  },
];

const LEGAL_ITEMS = ["Términos y condiciones", "Política de privacidad"];

export function OnboardingWelcomeScreen({
  onContinue,
  onSkip,
}: {
  onContinue: () => void;
  onSkip: () => void;
}) {
  const insets = useSafeAreaInsets();

  return (
    <View
      className="flex-1 px-5"
      style={{ backgroundColor: ONB.bg, paddingTop: insets.top + 8, paddingBottom: insets.bottom + 8 }}
    >
      <OnboardingHeader step={1} total={5} />

      <View className="flex-1 items-center justify-center py-4">
        <View className="w-full py-2 mb-6">
          <View className="w-full items-center justify-center" style={{ height: 165 }}>
            {/* Tarjeta izquierda, inclinada — mismas proporciones que el
                mockup de Stitch (w-160, -left-2, top-8, -rotate-6). Lo que
                faltaba para que se lea como un stack de fotos y no como algo
                roto era la SOMBRA (shadow-sm/shadow-lg del mockup) — sin
                elevación las tarjetas se confundían entre sí al superponerse. */}
            <View
              className="rounded-2xl p-2.5"
              style={{
                position: "absolute",
                top: 32,
                left: -8,
                width: 160,
                backgroundColor: ONB.surface,
                borderWidth: 1,
                borderColor: ONB.border,
                transform: [{ rotate: "-6deg" }],
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.35,
                shadowRadius: 8,
                elevation: 6,
              }}
            >
              <View className="flex-row items-center justify-between mb-1.5">
                <View className="flex-row items-center gap-2">
                  <ServiceBadge subscription={{ serviceKey: "disney_plus", name: "Disney+" }} size={24} />
                  <View>
                    <Text className="text-[11px] font-bold leading-tight" style={{ color: ONB.textPrimary }}>
                      Disney+
                    </Text>
                    <Text className="text-[9px]" style={{ color: ONB.textSecondary }}>
                      Anual
                    </Text>
                  </View>
                </View>
                <Text className="text-[11px] font-extrabold" style={{ color: ONB.textPrimary }}>
                  $9<Text className="text-[9px] font-normal" style={{ color: ONB.textSecondary }}>/m</Text>
                </Text>
              </View>
              <View
                className="flex-row items-center justify-between pt-1 text-[9px]"
                style={{ borderTopWidth: 1, borderTopColor: ONB.border }}
              >
                <Text className="text-[9px]" style={{ color: ONB.textSecondary }}>
                  Cuenta familiar
                </Text>
                <Text className="text-[9px] font-medium" style={{ color: ONB.accent }}>
                  15 Jul
                </Text>
              </View>
            </View>

            {/* Tarjeta derecha, inclinada — mismo criterio que la izquierda. */}
            <View
              className="rounded-2xl p-2.5"
              style={{
                position: "absolute",
                top: 28,
                right: -8,
                width: 165,
                backgroundColor: ONB.surface,
                borderWidth: 1,
                borderColor: ONB.border,
                transform: [{ rotate: "6deg" }],
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.35,
                shadowRadius: 8,
                elevation: 6,
              }}
            >
              <View className="flex-row items-center justify-between mb-1.5">
                <View className="flex-row items-center gap-2">
                  <ServiceBadge subscription={{ serviceKey: "spotify", name: "Spotify" }} size={24} />
                  <View>
                    <Text className="text-[11px] font-bold leading-tight" style={{ color: ONB.textPrimary }}>
                      Spotify Dúo
                    </Text>
                    <Text className="text-[9px]" style={{ color: ONB.textSecondary }}>
                      Mensual
                    </Text>
                  </View>
                </View>
                <Text className="text-[11px] font-extrabold" style={{ color: ONB.textPrimary }}>
                  $14.99
                </Text>
              </View>
              <View
                className="flex-row items-center justify-between pt-1"
                style={{ borderTopWidth: 1, borderTopColor: ONB.border }}
              >
                <Text className="text-[9px]" style={{ color: ONB.textSecondary }}>
                  Renovación
                </Text>
                <Text
                  className="text-[9px] font-semibold px-1.5 py-0.5 rounded-full"
                  style={{ color: ONB.success, backgroundColor: ONB.successSoft }}
                >
                  en 5 días
                </Text>
              </View>
            </View>

            {/* Tarjeta central, elevada — la de más al frente, con sombra
                marcada (shadow-lg del mockup) para que se lea claramente
                por encima de las otras dos. */}
            <View
              className="rounded-2xl p-3"
              style={{
                width: 240,
                transform: [{ translateY: -4 }],
                backgroundColor: ONB.surface,
                borderWidth: 1,
                borderColor: ONB.border,
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 10 },
                shadowOpacity: 0.5,
                shadowRadius: 20,
                elevation: 14,
              }}
            >
              <View className="flex-row items-center justify-between">
                <View className="flex-row items-center gap-2.5">
                  <ServiceBadge subscription={{ serviceKey: "netflix", name: "Netflix" }} size={32} />
                  <View>
                    <Text className="text-[13px] font-bold leading-snug" style={{ color: ONB.textPrimary }}>
                      Netflix 4K HDR
                    </Text>
                    <Text className="text-[10px]" style={{ color: ONB.textSecondary }}>
                      Plan Familiar · Mensual
                    </Text>
                  </View>
                </View>
                <View className="items-end">
                  <Text className="text-[14px] font-black" style={{ color: ONB.textPrimary }}>
                    $17,99
                  </Text>
                  <Text className="text-[9px]" style={{ color: ONB.textSecondary }}>
                    /mes
                  </Text>
                </View>
              </View>
              <View
                className="mt-2.5 pt-2 flex-row items-center justify-between"
                style={{ borderTopWidth: 1, borderTopColor: ONB.border }}
              >
                <Text className="text-[10px] font-medium" style={{ color: ONB.textSecondary }}>
                  Próximo cobro
                </Text>
                <View
                  className="flex-row items-center gap-1 px-2 py-0.5 rounded-full"
                  style={{ backgroundColor: ONB.successSoft, borderWidth: 1, borderColor: ONB.successSoftBorder }}
                >
                  <View className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: ONB.success }} />
                  <Text className="text-[10px] font-bold" style={{ color: ONB.success }}>
                    Renovación en 3 días
                  </Text>
                </View>
              </View>
            </View>
          </View>

          <View className="items-center -mt-1">
            <View
              className="flex-row items-center gap-1.5 px-3 py-1 rounded-full"
              style={{ backgroundColor: ONB.successSoft, borderWidth: 1, borderColor: ONB.successSoftBorder }}
            >
              <MaterialIcons name="trending-down" size={14} color={ONB.success} />
              <Text className="text-[11px] font-bold" style={{ color: ONB.success }}>
                Ahorro detectado +42.000 COP/mes
              </Text>
            </View>
          </View>
        </View>

        <View className="items-center px-2 mb-5">
          <Text
            className="text-[24px] font-extrabold text-center leading-[30px] tracking-tight mb-2"
            style={{ color: ONB.textPrimary }}
          >
            Toma el control de tus gastos recurrentes
          </Text>
          <Text className="text-[13px] text-center leading-[19px]" style={{ color: ONB.textSecondary }}>
            Detecta suscripciones que ya no usas, anticipa cada renovación y ahorra sin esfuerzo, todo desde tu
            teléfono.
          </Text>
        </View>

        <View
          className="w-full rounded-2xl p-3 gap-2"
          style={{ backgroundColor: ONB.surface, borderWidth: 1, borderColor: ONB.border }}
        >
          {BENEFITS.map((benefit, index) => (
            <View key={benefit.title}>
              {index > 0 && <View className="h-[1px] w-full mb-2" style={{ backgroundColor: ONB.border }} />}
              <View className="w-full flex-row items-start gap-3 p-1">
                <View
                  className="w-8 h-8 rounded-lg items-center justify-center mt-0.5"
                  style={{ backgroundColor: benefit.softBg }}
                >
                  <MaterialIcons name={benefit.icon} size={18} color={benefit.color} />
                </View>
                <View className="flex-1">
                  <Text className="text-[12px] font-bold leading-snug" style={{ color: ONB.textPrimary }}>
                    {benefit.title}
                  </Text>
                  <Text className="text-[11px] leading-tight mt-0.5" style={{ color: ONB.textSecondary }}>
                    {benefit.body}
                  </Text>
                </View>
              </View>
            </View>
          ))}
        </View>
      </View>

      <View className="w-full pt-2 pb-1 gap-3">
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
            <Text className="text-white font-bold text-[15px]">Comenzar ahora</Text>
            <MaterialIcons name="arrow-forward" size={18} color="#FFFFFF" />
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
  );
}
