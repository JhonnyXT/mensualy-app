import { Image } from "react-native";

/**
 * Logo de marca — se repite en `AnimatedSplash` y en el onboarding.
 * Centralizado acá para que, si el logo cambia, se reemplace en un solo
 * lugar (`assets/brand-mark.png`).
 */
export function BrandMark({ size = 72 }: { size?: number }) {
  return (
    <Image
      source={require("../../../../assets/brand-mark.png")}
      style={{ width: size, height: size }}
      resizeMode="contain"
    />
  );
}
