import { router } from "expo-router";
import { OnboardingServicesScreen } from "../../features/onboarding/screens/OnboardingServicesScreen";

export default function OnboardingStep2() {
  return (
    <OnboardingServicesScreen
      onContinue={() => router.push("/onboarding/step-3")}
      onBack={() => (router.canGoBack() ? router.back() : router.replace("/onboarding"))}
      onSkip={() => router.replace("/onboarding/step-5")}
    />
  );
}
