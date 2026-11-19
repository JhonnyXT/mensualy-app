/**
 * Paleta FIJA del onboarding — fondo oscuro propio, mismo criterio que
 * `AnimatedSplash`. Alineada a los tokens `DASH` del dashboard (violeta
 * #7C6BFF + verde #34C77A) para que el onboarding se vea consistente con el
 * resto de la app — antes usaba el índigo de `theme.ts`, que quedó como el
 * único remanente de la paleta vieja tras el rediseño oscuro del dashboard.
 */
import { DASH } from "../dashboard/dashboardTheme";

export const ONB = {
  bg: DASH.bg,
  surface: DASH.card,
  border: DASH.cardBorder,
  accent: DASH.violet,
  accentDark: "#6352E8",
  accentSoft: DASH.violetSoft,
  accentSoftBorder: DASH.violetSoftBorder,
  success: DASH.green,
  successSoft: DASH.greenSoft,
  successSoftBorder: "rgba(52,199,122,0.3)",
  textPrimary: DASH.textPrimary,
  textSecondary: DASH.textSecondary,
} as const;
