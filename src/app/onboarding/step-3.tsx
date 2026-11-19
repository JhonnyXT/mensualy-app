import { router } from "expo-router";
import { OnboardingNotificationsScreen } from "../../features/onboarding/screens/OnboardingNotificationsScreen";

export default function OnboardingStep3() {
  return (
    <OnboardingNotificationsScreen
      onFinish={() => router.push("/onboarding/step-4")}
      onBack={() => (router.canGoBack() ? router.back() : router.replace("/onboarding/step-2"))}
      onSkip={() => router.replace("/onboarding/step-5")}
    />
  );
}
