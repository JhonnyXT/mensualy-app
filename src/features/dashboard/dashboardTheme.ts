/**
 * Paleta del dashboard y del resto de pantallas migradas a este sistema
 * (suscripciones, calendario, ajustes, detalle) — originalmente fija en
 * oscuro, ahora con una variante clara paralela (`LIGHT_THEME`) para el
 * toggle real de "Apariencia" en Ajustes. Usar siempre a través de
 * `useTheme()` (ver `core/design-system/hooks/useTheme.ts`), nunca este
 * export directo, para que el toggle se refleje en pantalla.
 */
export const DASH = {
  bg: "#0D0D12",
  card: "#1B1B22",
  cardBorder: "#2A2A35",
  iconBg: "#252530",
  dockBg: "#181820",
  dockBorder: "#2E2E3C",
  dockActiveBg: "#252532",
  border: "rgba(255,255,255,0.08)",
  textPrimary: "#F5F5F7",
  textSecondary: "#9A9AA2",
  violet: "#7C6BFF",
  violetSoft: "rgba(124,107,255,0.15)",
  violetSoftBorder: "rgba(124,107,255,0.3)",
  green: "#34C77A",
  greenSoft: "rgba(52,199,122,0.1)",
  red: "#FF6259",
  amber: "#F59E0B",
  amberSoft: "rgba(245,158,11,0.15)",
  amberSoftBorder: "rgba(245,158,11,0.3)",
  /** Barra de "arrastrar para cerrar" en los sheets — necesita su propio
   * token porque un blanco translúcido fijo se vuelve invisible sobre una
   * tarjeta clara. */
  dragHandle: "rgba(255,255,255,0.35)",
} as const;

export type Theme = { [K in keyof typeof DASH]: string };

/** Misma forma que `DASH`, tokens ajustados para contraste sobre fondo claro. */
export const LIGHT_THEME: Theme = {
  bg: "#F7F7FA",
  card: "#FFFFFF",
  cardBorder: "#E5E5EC",
  iconBg: "#F0F0F5",
  dockBg: "#FFFFFF",
  dockBorder: "#E5E5EC",
  dockActiveBg: "#EDEBFF",
  border: "rgba(20,20,26,0.08)",
  textPrimary: "#14141A",
  textSecondary: "#6B6B76",
  violet: "#6C5CE7",
  violetSoft: "rgba(108,92,231,0.1)",
  violetSoftBorder: "rgba(108,92,231,0.3)",
  green: "#1E9E5A",
  greenSoft: "rgba(30,158,90,0.1)",
  red: "#E0453C",
  amber: "#B7791F",
  amberSoft: "rgba(183,121,31,0.12)",
  amberSoftBorder: "rgba(183,121,31,0.3)",
  dragHandle: "rgba(20,20,26,0.2)",
};

/**
 * El mockup del dashboard pide "Plus Jakarta Sans" explícito (no el
 * "System" que usa el resto de la app) — letras más altas/geométricas que
 * a igual tamaño en px se leen más grandes que Roboto/SF. Cargada en
 * `src/app/_layout.tsx` vía @expo-google-fonts/plus-jakarta-sans.
 */
export const FONT = {
  regular: "PlusJakartaSans_400Regular",
  medium: "PlusJakartaSans_500Medium",
  semibold: "PlusJakartaSans_600SemiBold",
  bold: "PlusJakartaSans_700Bold",
  extrabold: "PlusJakartaSans_800ExtraBold",
} as const;
