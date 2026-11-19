import { eq } from "drizzle-orm";
import { db } from "../../../core/database/client";
import { appSettings } from "../../../core/database/schema";

const SETTINGS_ID = "singleton";

export async function getOnboardingCompleted(): Promise<boolean> {
  const [row] = await db.select().from(appSettings).where(eq(appSettings.id, SETTINGS_ID));
  return row?.onboardingCompleted ?? false;
}

export async function setOnboardingCompleted(completed: boolean): Promise<void> {
  await db
    .insert(appSettings)
    .values({ id: SETTINGS_ID, onboardingCompleted: completed })
    .onConflictDoUpdate({ target: appSettings.id, set: { onboardingCompleted: completed } });
}

export async function getProfilePhotoUri(): Promise<string | null> {
  const [row] = await db.select().from(appSettings).where(eq(appSettings.id, SETTINGS_ID));
  return row?.profilePhotoUri ?? null;
}

export async function setProfilePhotoUri(uri: string | null): Promise<void> {
  await db
    .insert(appSettings)
    .values({ id: SETTINGS_ID, profilePhotoUri: uri })
    .onConflictDoUpdate({ target: appSettings.id, set: { profilePhotoUri: uri } });
}

export async function getUserName(): Promise<string | null> {
  const [row] = await db.select().from(appSettings).where(eq(appSettings.id, SETTINGS_ID));
  return row?.userName ?? null;
}

export async function setUserName(name: string): Promise<void> {
  await db
    .insert(appSettings)
    .values({ id: SETTINGS_ID, userName: name })
    .onConflictDoUpdate({ target: appSettings.id, set: { userName: name } });
}

export async function getMainCurrency(): Promise<"COP" | "USD" | "EUR"> {
  const [row] = await db.select().from(appSettings).where(eq(appSettings.id, SETTINGS_ID));
  return row?.mainCurrency ?? "COP";
}

export async function setMainCurrency(currency: "COP" | "USD" | "EUR"): Promise<void> {
  await db
    .insert(appSettings)
    .values({ id: SETTINGS_ID, mainCurrency: currency })
    .onConflictDoUpdate({ target: appSettings.id, set: { mainCurrency: currency } });
}

export async function getBiometricLockEnabled(): Promise<boolean> {
  const [row] = await db.select().from(appSettings).where(eq(appSettings.id, SETTINGS_ID));
  return row?.biometricLockEnabled ?? false;
}

export async function setBiometricLockEnabled(enabled: boolean): Promise<void> {
  await db
    .insert(appSettings)
    .values({ id: SETTINGS_ID, biometricLockEnabled: enabled })
    .onConflictDoUpdate({ target: appSettings.id, set: { biometricLockEnabled: enabled } });
}

export async function getThemeMode(): Promise<"dark" | "light"> {
  const [row] = await db.select().from(appSettings).where(eq(appSettings.id, SETTINGS_ID));
  return row?.themeMode ?? "dark";
}

export async function setThemeMode(mode: "dark" | "light"): Promise<void> {
  await db
    .insert(appSettings)
    .values({ id: SETTINGS_ID, themeMode: mode })
    .onConflictDoUpdate({ target: appSettings.id, set: { themeMode: mode } });
}
