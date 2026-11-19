import "../../global.css";
import { useEffect, useState } from "react";
import { View, Text } from "react-native";
import { Stack } from "expo-router";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { useMigrations } from "drizzle-orm/expo-sqlite/migrator";
import * as SplashScreen from "expo-splash-screen";
import * as Notifications from "expo-notifications";
import { useFonts, Inter_500Medium, Inter_700Bold } from "@expo-google-fonts/inter";
import {
  PlusJakartaSans_400Regular,
  PlusJakartaSans_500Medium,
  PlusJakartaSans_600SemiBold,
  PlusJakartaSans_700Bold,
  PlusJakartaSans_800ExtraBold,
} from "@expo-google-fonts/plus-jakarta-sans";
import { db } from "../core/database/client";
import migrations from "../core/database/migrations/migrations";
import { seedDefaultCategories } from "../core/database/seed";
import { colors } from "../core/design-system/theme";
import { AnimatedSplash } from "../core/design-system/components/AnimatedSplash";
import { BiometricLockGate } from "../core/design-system/components/BiometricLockGate";
import { useAppSettings } from "../features/settings/hooks/useAppSettings";
import { NewSubscriptionSheet } from "../features/subscriptions/components/NewSubscriptionSheet";
import { SubscriptionDetailSheet } from "../features/subscriptions/components/SubscriptionDetailSheet";
import { EditSubscriptionSheet } from "../features/subscriptions/components/EditSubscriptionSheet";
import { SavingsSuggestionSheet } from "../features/subscriptions/components/SavingsSuggestionSheet";
import { useSubscriptionSheets } from "../features/subscriptions/hooks/useSubscriptionSheets";
import { getSubscriptionIdFromNotificationResponse } from "../features/reminders/notifications";

SplashScreen.preventAutoHideAsync().catch(() => {});

function AppStack() {
  // Tocar la notificación de "se cobra hoy/pronto" debe abrir la app
  // directo en el detalle de ESA suscripción, no solo abrir la app a secas.
  // Dos casos: la app ya está corriendo (el listener la recibe), o la app
  // estaba cerrada y la notificación fue lo que la abrió (cold start —
  // `getLastNotificationResponseAsync`, que solo existe acá porque AppStack
  // recién se monta una vez pasado el splash/onboarding).
  useEffect(() => {
    function openFromResponse(response: Notifications.NotificationResponse | null) {
      const subscriptionId = getSubscriptionIdFromNotificationResponse(response);
      if (subscriptionId) useSubscriptionSheets.getState().openDetail(subscriptionId);
    }

    const subscription = Notifications.addNotificationResponseReceivedListener(openFromResponse);
    Notifications.getLastNotificationResponseAsync().then(openFromResponse);

    return () => subscription.remove();
  }, []);

  return (
    <>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" />
      </Stack>
      {/* Todos los modales de suscripción se montan siempre como overlays
          globales (patrón de anchor-app) en vez de rutas `transparentModal`
          o `modal` de expo-router — ver NewSubscriptionSheet.tsx para el
          porqué (evita el rectángulo residual de la doble animación de
          salida al cerrar). */}
      <NewSubscriptionSheet />
      <SubscriptionDetailSheet />
      <EditSubscriptionSheet />
      <SavingsSuggestionSheet />
    </>
  );
}

export default function RootLayout() {
  const { success: migrationsReady, error: migrationsError } = useMigrations(db, migrations);
  const [seeded, setSeeded] = useState(false);
  const [seedError, setSeedError] = useState<Error | null>(null);
  const [introDone, setIntroDone] = useState(false);
  const [fontsLoaded] = useFonts({
    Inter_500Medium,
    Inter_700Bold,
    // Tipografía del dashboard (mockup pide "Plus Jakarta Sans" explícito,
    // distinto del "System" que usa el resto de la app) — ver dashboardTheme.ts.
    PlusJakartaSans_400Regular,
    PlusJakartaSans_500Medium,
    PlusJakartaSans_600SemiBold,
    PlusJakartaSans_700Bold,
    PlusJakartaSans_800ExtraBold,
  });
  const onboardingCompleted = useAppSettings((s) => s.onboardingCompleted);
  const loadAppSettings = useAppSettings((s) => s.load);

  useEffect(() => {
    if (!migrationsReady) return;
    // Si esto falla y queda sin manejar, `seeded` nunca pasa a `true` y el
    // splash nativo queda pegado para siempre (nada lo destraba) — por eso
    // el .catch acá, igual que el manejo explícito de `migrationsError`.
    Promise.all([seedDefaultCategories(), loadAppSettings()])
      .then(() => setSeeded(true))
      .catch((error: Error) => setSeedError(error));
  }, [migrationsReady, loadAppSettings]);

  const ready =
    (migrationsReady || !!migrationsError) &&
    (seeded || !!seedError) &&
    fontsLoaded &&
    (onboardingCompleted !== null || !!seedError);

  // El splash nativo estático (mismo ícono/fondo, ver app.json →
  // expo-splash-screen) se oculta apenas React puede pintar el primer frame
  // de `AnimatedSplash` — sin esperar un `onLayout`, para que no haya un
  // frame en blanco entre los dos. Mismo patrón que anchor-app.
  useEffect(() => {
    if (ready) SplashScreen.hideAsync().catch(() => {});
  }, [ready]);

  if (migrationsError) {
    return (
      <View className="flex-1 items-center justify-center bg-background px-8">
        <Text className="text-text-primary text-base font-semibold text-center">
          No pudimos preparar la base de datos local.
        </Text>
        <Text className="text-text-secondary text-sm text-center mt-2">
          {migrationsError.message}
        </Text>
      </View>
    );
  }

  if (!ready) {
    return <View style={{ flex: 1, backgroundColor: colors.background }} />;
  }

  // Un solo árbol de CONTENIDO a la vez (splash O app, nunca los dos
  // superpuestos), pero `GestureHandlerRootView`/`SafeAreaProvider` se
  // montan SIEMPRE, una sola vez, envolviendo a ambos — mismo patrón que
  // anchor-app. `AnimatedSplash` usa `react-native-svg` (el glow) y ese
  // árbol necesita el mounting manager de Fabric ya inicializado por esos
  // providers para poder pintar; sin ellos el SVG queda mudo (bug real ya
  // visto en anchor-app: el splash "terminaba" a tiempo pero nunca se veían
  // ni el glow ni el texto).
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        {!introDone ? (
          <AnimatedSplash onFinish={() => setIntroDone(true)} />
        ) : (
          <BiometricLockGate>
            <AppStack />
          </BiometricLockGate>
        )}
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
