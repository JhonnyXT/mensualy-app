import { useEffect, useRef, useState } from "react";
import { View, Text, Pressable, AppState, type AppStateStatus } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as LocalAuthentication from "expo-local-authentication";
import { useTheme } from "../hooks/useTheme";
import { useAppSettings } from "../../../features/settings/hooks/useAppSettings";
import { FONT } from "../../../features/dashboard/dashboardTheme";
import { BrandMark } from "./BrandMark";

/**
 * Gate montado una sola vez en `_layout.tsx`, envolviendo `AppStack`. Si
 * "Bloqueo biométrico" está activado en Ajustes, no renderiza los hijos
 * hasta que `authenticateAsync` resuelva OK — y vuelve a bloquear cada vez
 * que la app pasa a background y regresa (mismo comportamiento que una app
 * bancaria: no alcanza con desbloquear una sola vez al abrir el teléfono).
 */
export function BiometricLockGate({ children }: { children: React.ReactNode }) {
  const DASH = useTheme();
  const biometricLockEnabled = useAppSettings((s) => s.biometricLockEnabled);
  const [unlocked, setUnlocked] = useState(!biometricLockEnabled);
  const [authenticating, setAuthenticating] = useState(false);
  const appState = useRef(AppState.currentState);

  async function tryUnlock() {
    setAuthenticating(true);
    try {
      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: "Desbloquea Mensualy",
        cancelLabel: "Cancelar",
        disableDeviceFallback: false,
      });
      if (result.success) setUnlocked(true);
    } finally {
      setAuthenticating(false);
    }
  }

  useEffect(() => {
    if (biometricLockEnabled) {
      setUnlocked(false);
      tryUnlock();
    } else {
      setUnlocked(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [biometricLockEnabled]);

  useEffect(() => {
    const subscription = AppState.addEventListener("change", (next: AppStateStatus) => {
      const volviendoActiva = appState.current.match(/inactive|background/) && next === "active";
      if (volviendoActiva && biometricLockEnabled) setUnlocked(false);
      appState.current = next;
    });
    return () => subscription.remove();
  }, [biometricLockEnabled]);

  if (unlocked) return <>{children}</>;

  return (
    <View className="flex-1 items-center justify-center px-10" style={{ backgroundColor: DASH.bg }}>
      <BrandMark size={64} />
      <Text className="text-lg mt-5" style={{ color: DASH.textPrimary, fontFamily: FONT.bold }}>
        Mensualy está bloqueada
      </Text>
      <Text
        className="text-sm mt-1.5 text-center"
        style={{ color: DASH.textSecondary, fontFamily: FONT.regular }}
      >
        Usa tu huella o Face ID para continuar.
      </Text>
      <Pressable
        onPress={tryUnlock}
        disabled={authenticating}
        className="flex-row items-center rounded-full px-6 py-3.5 mt-7 active:opacity-80"
        style={{ backgroundColor: DASH.violet, opacity: authenticating ? 0.7 : 1 }}
      >
        <Ionicons name="finger-print" size={18} color="#FFFFFF" />
        <Text className="text-sm ml-2" style={{ color: "#FFFFFF", fontFamily: FONT.semibold }}>
          {authenticating ? "Verificando..." : "Desbloquear"}
        </Text>
      </Pressable>
    </View>
  );
}
