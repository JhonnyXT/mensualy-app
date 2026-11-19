import { View, type ViewProps } from "react-native";

/**
 * Contenedor base de "tarjeta": fondo blanco/gris muy claro, borde fino y
 * esquinas redondeadas — sin sombras fuertes ni gradientes, a propósito,
 * para mantener la estética plana y nativa del resto de la app.
 */
export function Card({ className, ...props }: ViewProps & { className?: string }) {
  return (
    <View
      className={`bg-surface rounded-card border border-border p-4 ${className ?? ""}`}
      {...props}
    />
  );
}
