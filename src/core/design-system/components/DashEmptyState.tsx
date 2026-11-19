import { View, Text } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Animated, { FadeIn, ZoomIn } from "react-native-reanimated";
import { useTheme } from "../hooks/useTheme";
import { FONT } from "../../../features/dashboard/dashboardTheme";

/**
 * Empty state con la estética DASH — ícono en círculo violeta suave con
 * entrada animada (zoom + fade), en vez del cuadrado gris plano estático
 * que había antes. Mismo patrón visual que el resto de confirmaciones
 * animadas de la app (CancelConfirmSheet, "Usada hoy").
 */
export function DashEmptyState({
  icon,
  title,
  description,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  description: string;
}) {
  const DASH = useTheme();

  return (
    <View className="items-center justify-center py-16 px-8">
      <Animated.View
        entering={ZoomIn.duration(360)}
        className="w-16 h-16 rounded-full items-center justify-center mb-4"
        style={{ backgroundColor: DASH.violetSoft, borderWidth: 1, borderColor: DASH.violetSoftBorder }}
      >
        <Ionicons name={icon} size={28} color={DASH.violet} />
      </Animated.View>
      <Animated.View entering={FadeIn.delay(120).duration(320)} style={{ alignItems: "center" }}>
        <Text className="text-base text-center" style={{ color: DASH.textPrimary, fontFamily: FONT.semibold }}>
          {title}
        </Text>
        <Text
          className="text-sm text-center mt-1.5"
          style={{ color: DASH.textSecondary, fontFamily: FONT.medium }}
        >
          {description}
        </Text>
      </Animated.View>
    </View>
  );
}
