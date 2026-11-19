import { create } from "zustand";

/**
 * Selección de servicios hecha en el paso 2 del onboarding. Vive solo en
 * memoria (no se persiste) — cuando el paso 3 quede listo, se usa para
 * precrear las suscripciones en SQLite; si el usuario cierra la app antes de
 * terminar el onboarding, no queda nada guardado a medias.
 */
type OnboardingSelectionState = {
  selectedServiceKeys: string[];
  toggle: (serviceKey: string) => void;
};

export const useOnboardingSelection = create<OnboardingSelectionState>((set, get) => ({
  selectedServiceKeys: [],
  toggle: (serviceKey) => {
    const current = get().selectedServiceKeys;
    set({
      selectedServiceKeys: current.includes(serviceKey)
        ? current.filter((key) => key !== serviceKey)
        : [...current, serviceKey],
    });
  },
}));
