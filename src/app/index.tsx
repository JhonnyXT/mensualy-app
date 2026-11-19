import { Redirect } from "expo-router";
import { useAppSettings } from "../features/settings/hooks/useAppSettings";

// `_layout.tsx` no deja pintar esta pantalla hasta que `onboardingCompleted`
// ya se leyó de SQLite (ver `ready` ahí), así que acá siempre es un boolean
// real, no el `null` inicial.
export default function Index() {
  const onboardingCompleted = useAppSettings((s) => s.onboardingCompleted);
  return <Redirect href={onboardingCompleted ? "/(tabs)/dashboard" : "/onboarding"} />;
}
