import { router } from "expo-router";
import { OnboardingProfileScreen } from "../../features/onboarding/screens/OnboardingProfileScreen";

export default function OnboardingStep4() {
  return (
    <OnboardingProfileScreen
      onContinue={() => router.push("/onboarding/step-5")}
      onBack={() => (router.canGoBack() ? router.back() : router.replace("/onboarding/step-3"))}
    />
  );
}
