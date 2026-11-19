import { useAppSettings } from "../../../features/settings/hooks/useAppSettings";
import { DASH, LIGHT_THEME, type Theme } from "../../../features/dashboard/dashboardTheme";

/** Paleta activa según Ajustes → Apariencia. Usar en vez de importar `DASH` directo. */
export function useTheme(): Theme {
  const mode = useAppSettings((s) => s.themeMode);
  return mode === "light" ? LIGHT_THEME : DASH;
}
