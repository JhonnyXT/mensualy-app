import { Pressable, View } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { ONB } from "../onboardingTheme";

/**
 * Chrome superior del onboarding: flecha atrás + barra de progreso
 * segmentada. Copiado tal cual del diseño de anchor-app/Meld — ahí no hay
 * texto "N de 3" ni "Saltar" en esta fila; el link de saltar vive abajo,
 * junto al botón principal (ver cada `Onboarding*Screen`).
 */
export function OnboardingHeader({
  step,
  total,
  onBack,
}: {
  step: number;
  total: number;
  /** Si no se pasa (paso 1), se deja un espacio vacío del mismo tamaño para
   * que la barra de progreso no se corra de posición. */
  onBack?: () => void;
}) {
  return (
    <View style={{ flexDirection: "row", alignItems: "center", minHeight: 32, paddingBottom: 8 }}>
      {onBack ? (
        <Pressable
          onPress={onBack}
          hitSlop={12}
          style={{ width: 32, height: 32, alignItems: "center", justifyContent: "center", marginRight: 8 }}
        >
          <MaterialIcons name="chevron-left" size={24} color={ONB.textPrimary} />
        </Pressable>
      ) : (
        <View style={{ width: 32, height: 32, marginRight: 8 }} />
      )}

      <View style={{ flex: 1, flexDirection: "row", alignItems: "center", gap: 6 }}>
        {Array.from({ length: total }).map((_, index) => (
          <View
            key={index}
            style={{
              flex: 1,
              height: 4,
              borderRadius: 2,
              backgroundColor: index < step ? ONB.accent : ONB.border,
            }}
          />
        ))}
      </View>
    </View>
  );
}
