import { useState } from "react";
import { Pressable, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { MaterialIcons } from "@expo/vector-icons";
import * as Notifications from "expo-notifications";
import { OnboardingHeader } from "../components/OnboardingHeader";
import { ONB } from "../onboardingTheme";

// Import estático — el proyecto solo corre en un dev build/build de
// producción propio (no en Expo Go, que quitó soporte de expo-notifications
// en Android desde el SDK 53). Antes se usaba un `import()` dinámico acá para
// evitar ese problema de Expo Go, pero combinado con varios reloads
// incrementales de Metro en este sandbox el import dinámico terminaba
// tirando "Requiring unknown module" — con import estático no depende de la
// resolución de módulos async de Metro en runtime.

const WAVE_BARS_LEFT = [12, 24, 36];
const WAVE_BARS_RIGHT = [36, 24, 12];

export function OnboardingNotificationsScreen({
  onFinish,
  onSkip,
  onBack,
}: {
  onFinish: () => void;
  onSkip: () => void;
  onBack: () => void;
}) {
  const [requesting, setRequesting] = useState(false);
  const insets = useSafeAreaInsets();

  const handleActivate = async () => {
    setRequesting(true);
    try {
      await Notifications.requestPermissionsAsync();
    } catch {
      // Si el usuario niega el permiso o el SO lo bloquea, igual seguimos —
      // Mensualy funciona sin notificaciones, solo se pierde el recordatorio.
    } finally {
      setRequesting(false);
      onFinish();
    }
  };

  return (
    <View
      className="flex-1 px-6"
      style={{ backgroundColor: ONB.bg, paddingTop: insets.top + 8, paddingBottom: insets.bottom + 8 }}
    >
      <OnboardingHeader step={3} total={5} onBack={onBack} />

      <View className="flex-1 items-center justify-center py-4">
        <View
          className="relative w-[210px] h-[210px] rounded-[36px] items-center justify-center mb-6"
          style={{ backgroundColor: ONB.surface, borderWidth: 1, borderColor: ONB.border }}
        >
          <View
            className="absolute w-28 h-28 rounded-full"
            style={{ backgroundColor: "rgba(79,70,229,0.15)" }}
          />
          <View
            className="absolute w-44 h-44 rounded-full"
            style={{ borderWidth: 1, borderColor: "rgba(79,70,229,0.2)" }}
          />
          <View
            className="absolute w-36 h-36 rounded-full"
            style={{ borderWidth: 1, borderColor: "rgba(31,164,99,0.25)" }}
          />

          <View className="absolute left-5 flex-row items-end gap-1">
            {WAVE_BARS_LEFT.map((height, index) => (
              <View
                key={index}
                className="w-1 rounded-full"
                style={{ height, backgroundColor: ONB.accent, opacity: 0.35 + index * 0.325 }}
              />
            ))}
          </View>
          <View className="absolute right-5 flex-row items-end gap-1">
            {WAVE_BARS_RIGHT.map((height, index) => (
              <View
                key={index}
                className="w-1 rounded-full"
                style={{ height, backgroundColor: ONB.success, opacity: 1 - index * 0.325 }}
              />
            ))}
          </View>

          <View className="relative items-center justify-center">
            <LinearGradient
              colors={[ONB.accent, ONB.accentDark]}
              start={{ x: 0, y: 0 }}
              end={{ x: 0, y: 1 }}
              style={{
                width: 96,
                height: 96,
                borderRadius: 26,
                alignItems: "center",
                justifyContent: "center",
                borderWidth: 1,
                borderColor: "rgba(255,255,255,0.2)",
              }}
            >
              <MaterialIcons name="notifications" size={48} color="#FFFFFF" />
            </LinearGradient>
            <View
              className="absolute -top-2.5 -right-2.5 w-8 h-8 rounded-full items-center justify-center"
              style={{ backgroundColor: ONB.success, borderWidth: 2, borderColor: ONB.surface }}
            >
              <MaterialIcons name="check" size={16} color={ONB.bg} />
            </View>
          </View>
        </View>

        <Text className="text-[26px] font-extrabold text-center leading-[31px] tracking-tight mb-2.5" style={{ color: ONB.textPrimary }}>
          No te pierdas ningún cobro
        </Text>
        <Text className="text-sm text-center leading-[20px] px-2 mb-6" style={{ color: ONB.textSecondary }}>
          Te avisamos unos días antes de cada renovación, directamente en tu teléfono. Sin conexión permanente, sin
          sorpresas.
        </Text>

        <View
          className="w-full flex-row items-center gap-3.5 rounded-2xl p-3.5"
          style={{ backgroundColor: ONB.surface, borderWidth: 1, borderColor: ONB.border }}
        >
          <View className="relative w-11 h-11 rounded-xl items-center justify-center overflow-visible">
            <LinearGradient
              colors={[ONB.accentDark, ONB.accent]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={{ width: 44, height: 44, borderRadius: 12, alignItems: "center", justifyContent: "center" }}
            >
              <Text className="font-black text-base text-white">M</Text>
            </LinearGradient>
            <View
              className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full"
              style={{ backgroundColor: ONB.success, borderWidth: 1, borderColor: ONB.surface }}
            />
          </View>
          <View className="flex-1">
            <View className="flex-row items-center justify-between gap-1 mb-0.5">
              <Text className="text-xs font-bold flex-shrink" style={{ color: ONB.textPrimary }} numberOfLines={1}>
                Netflix se renueva en 3 días
              </Text>
              <Text className="text-[10px] font-medium" style={{ color: ONB.textSecondary }}>
                ahora
              </Text>
            </View>
            <Text className="text-[11px]" style={{ color: ONB.textSecondary }} numberOfLines={1}>
              Recordatorio inteligente · Revisa tu presupuesto
            </Text>
          </View>
        </View>

        <View className="flex-row items-center justify-center gap-1.5 mt-4">
          <MaterialIcons name="verified-user" size={16} color={ONB.success} />
          <Text className="text-xs text-center" style={{ color: ONB.textSecondary }}>
            Notificaciones locales programadas en tu dispositivo
          </Text>
        </View>
      </View>

      <View className="w-full items-center gap-3 pt-2">
        <Pressable onPress={handleActivate} disabled={requesting} className="w-full active:opacity-90">
          <LinearGradient
            colors={[ONB.accent, ONB.accentDark]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={{
              height: 56,
              borderRadius: 16,
              width: "100%",
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "center",
              gap: 10,
            }}
          >
            <MaterialIcons name="notifications" size={20} color="#FFFFFF" />
            <Text className="font-bold text-base tracking-tight text-white">Activar notificaciones</Text>
          </LinearGradient>
        </Pressable>

        <Pressable onPress={onFinish} hitSlop={8} className="py-1">
          <Text className="text-xs font-medium" style={{ color: ONB.textSecondary }}>
            Ahora no, decidir después
          </Text>
        </Pressable>

        <Text className="text-[11px] text-center" style={{ color: ONB.textSecondary }}>
          Puedes cambiar esto cuando quieras desde Ajustes.
        </Text>
      </View>
    </View>
  );
}
