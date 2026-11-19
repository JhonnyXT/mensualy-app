import { create } from "zustand";
import { File, Paths } from "expo-file-system";
import * as appSettingsRepository from "../repository/appSettingsRepository";

export const DEFAULT_USER_NAME = "Jonathan";

type MainCurrency = "COP" | "USD" | "EUR";
type ThemeMode = "dark" | "light";

type AppSettingsState = {
  onboardingCompleted: boolean | null; // null = todavía no se leyó de SQLite
  profilePhotoUri: string | null;
  userName: string;
  mainCurrency: MainCurrency;
  themeMode: ThemeMode;
  biometricLockEnabled: boolean;
  load: () => Promise<void>;
  completeOnboarding: () => Promise<void>;
  setProfilePhoto: (pickedUri: string) => Promise<void>;
  setUserName: (name: string) => Promise<void>;
  setMainCurrency: (currency: MainCurrency) => Promise<void>;
  setThemeMode: (mode: ThemeMode) => Promise<void>;
  setBiometricLockEnabled: (enabled: boolean) => Promise<void>;
};

export const useAppSettings = create<AppSettingsState>((set, get) => ({
  onboardingCompleted: null,
  profilePhotoUri: null,
  userName: DEFAULT_USER_NAME,
  mainCurrency: "COP",
  themeMode: "dark",
  biometricLockEnabled: false,

  load: async () => {
    const [onboardingCompleted, profilePhotoUri, userName, mainCurrency, themeMode, biometricLockEnabled] =
      await Promise.all([
        appSettingsRepository.getOnboardingCompleted(),
        appSettingsRepository.getProfilePhotoUri(),
        appSettingsRepository.getUserName(),
        appSettingsRepository.getMainCurrency(),
        appSettingsRepository.getThemeMode(),
        appSettingsRepository.getBiometricLockEnabled(),
      ]);
    set({
      onboardingCompleted,
      profilePhotoUri,
      userName: userName ?? DEFAULT_USER_NAME,
      mainCurrency,
      themeMode,
      biometricLockEnabled,
    });
  },

  setBiometricLockEnabled: async (enabled) => {
    await appSettingsRepository.setBiometricLockEnabled(enabled);
    set({ biometricLockEnabled: enabled });
  },

  setMainCurrency: async (currency) => {
    await appSettingsRepository.setMainCurrency(currency);
    set({ mainCurrency: currency });
  },

  setThemeMode: async (mode) => {
    await appSettingsRepository.setThemeMode(mode);
    set({ themeMode: mode });
  },

  completeOnboarding: async () => {
    await appSettingsRepository.setOnboardingCompleted(true);
    set({ onboardingCompleted: true });
  },

  setUserName: async (name: string) => {
    const trimmed = name.trim();
    if (!trimmed) return;
    await appSettingsRepository.setUserName(trimmed);
    set({ userName: trimmed });
  },

  /**
   * El picker de imágenes devuelve una URI en caché que el sistema puede
   * limpiar en cualquier momento — se copia a un archivo estable en
   * `Paths.document` antes de guardar la ruta en SQLite.
   *
   * El nombre incluye un timestamp (no un nombre fijo) porque `Image` de RN
   * cachea por URI: sobrescribir siempre el mismo archivo dejaba la app
   * mostrando la foto vieja aunque el contenido en disco ya fuera el nuevo.
   */
  setProfilePhoto: async (pickedUri: string) => {
    const anterior = get().profilePhotoUri;
    const dest = new File(Paths.document, `profile-photo-${Date.now()}.jpg`);
    await new File(pickedUri).copy(dest, { overwrite: true });
    await appSettingsRepository.setProfilePhotoUri(dest.uri);
    set({ profilePhotoUri: dest.uri });

    if (anterior) {
      try {
        new File(anterior).delete();
      } catch {
        // no crítico — a lo sumo queda un archivo huérfano
      }
    }
  },
}));
