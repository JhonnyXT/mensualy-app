/**
 * Tokens de diseño de Mensualy.
 *
 * Dirección visual: minimalista y clara (fondo blanco, tipografía negra,
 * tarjetas planas), inspirada en apps nativas de iOS — no en un estilo
 * "generado por IA" con gradientes/glows. El color casi no se usa salvo
 * para estados (positivo/negativo) y los logos de cada servicio.
 *
 * Estos valores están espejados en tailwind.config.js para que
 * NativeWind y el código que use el theme directamente (gráficos,
 * iconos) queden sincronizados.
 */
export const colors = {
  background: "#FFFFFF",
  surface: "#F7F7F8",
  surfaceSecondary: "#F0F0F3",
  border: "#E5E5EA",
  text: {
    primary: "#0B0B0F",
    secondary: "#6B6B70",
    tertiary: "#9A9AA0",
  },
  accent: {
    default: "#4F46E5",
    soft: "#EEF0FD",
  },
  success: {
    default: "#1FA463",
    soft: "#E3F6EC",
  },
  danger: {
    default: "#E0453C",
    soft: "#FDEAE9",
  },
  warning: {
    default: "#B7791F",
    soft: "#FBF0DD",
  },
} as const;

export const radius = {
  card: 16,
  pill: 999,
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
} as const;

/** Paleta para gráficos (donut de categorías, barras anuales), en el mismo tono sobrio. */
export const chartPalette = [
  colors.accent.default,
  colors.success.default,
  "#2E6BE6",
  colors.warning.default,
  colors.text.tertiary,
];
