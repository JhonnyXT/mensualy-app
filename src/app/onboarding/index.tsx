import { router } from "expo-router";
import { OnboardingWelcomeScreen } from "../../features/onboarding/screens/OnboardingWelcomeScreen";

export default function OnboardingIndex() {
  return (
    <OnboardingWelcomeScreen
      onContinue={() => router.push("/onboarding/step-2")}
      onSkip={() => router.replace("/onboarding/step-5")}
    />
  );
}
