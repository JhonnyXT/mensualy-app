import { Pressable, View } from "react-native";
import { useRouter, usePathname } from "expo-router";
import { MaterialIcons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTheme } from "../hooks/useTheme";
import { useSubscriptionSheets } from "../../../features/subscriptions/hooks/useSubscriptionSheets";

/**
 * Dock flotante de navegación (reemplaza la tab bar del sistema) — pedido
 * exacto del usuario a partir de un mockup HTML. Solo 3 acciones visibles
 * (Inicio / Agregar / Suscripciones); Calendario se alcanza desde el ícono
 * en "Próxima renovación" del dashboard, y Ajustes desde el avatar del
 * header — no perdemos esas rutas, solo no están en el dock.
 */
export function FloatingDock() {
  const DASH = useTheme();
  const router = useRouter();
  const openNewSheet = useSubscriptionSheets((s) => s.openNewSheet);
  const pathname = usePathname();
  const insets = useSafeAreaInsets();

  const enInicio = pathname.startsWith("/dashboard");
  const enSuscripciones = pathname.startsWith("/subscriptions");

  return (
    <View
      pointerEvents="box-none"
      style={{
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 0,
        alignItems: "center",
        paddingBottom: Math.max(insets.bottom, 12) + 12,
      }}
    >
      <View
        className="flex-row items-center gap-2 rounded-full px-2 py-1.5"
        style={{
          backgroundColor: DASH.dockBg,
          borderWidth: 1,
          borderColor: DASH.dockBorder,
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 12 },
          shadowOpacity: 0.55,
          shadowRadius: 36,
          elevation: 12,
        }}
      >
        <Pressable
          onPress={() => router.push("/(tabs)/dashboard")}
          className="h-11 px-4 rounded-full items-center justify-center active:scale-95"
          style={{
            backgroundColor: enInicio ? DASH.dockActiveBg : "transparent",
            borderWidth: 1,
            borderColor: enInicio ? DASH.dockBorder : "transparent",
          }}
        >
          <MaterialIcons
            name="grid-view"
            size={16}
            color={enInicio ? DASH.textPrimary : DASH.textSecondary}
          />
        </Pressable>

        <Pressable
          onPress={openNewSheet}
          className="w-11 h-11 rounded-full items-center justify-center active:scale-90"
          style={{
            backgroundColor: DASH.violet,
            shadowColor: DASH.violet,
            shadowOffset: { width: 0, height: 0 },
            shadowOpacity: 0.4,
            shadowRadius: 18,
            elevation: 8,
          }}
        >
          <MaterialIcons name="add" size={20} color="#FFFFFF" />
        </Pressable>

        <Pressable
          onPress={() => router.push("/(tabs)/subscriptions")}
          className="h-11 px-4 rounded-full items-center justify-center active:scale-95"
          style={{
            backgroundColor: enSuscripciones ? DASH.dockActiveBg : "transparent",
            borderWidth: 1,
            borderColor: enSuscripciones ? DASH.dockBorder : "transparent",
          }}
        >
          <MaterialIcons
            name="credit-card"
            size={16}
            color={enSuscripciones ? DASH.textPrimary : DASH.textSecondary}
          />
        </Pressable>
      </View>
    </View>
  );
}
