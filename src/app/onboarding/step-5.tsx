import { router } from "expo-router";
import { OnboardingBenefitsScreen } from "../../features/onboarding/screens/OnboardingBenefitsScreen";
import { useAppSettings } from "../../features/settings/hooks/useAppSettings";

export default function OnboardingStep5() {
  return (
    <OnboardingBenefitsScreen
      onFinish={async () => {
        await useAppSettings.getState().completeOnboarding();
        router.replace("/(tabs)/dashboard");
      }}
      onBack={() => (router.canGoBack() ? router.back() : router.replace("/onboarding/step-4"))}
    />
  );
}
