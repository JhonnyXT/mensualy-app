import Constants from "expo-constants";

// Ver "Build variants" en el README/skill del proyecto. Leer el variant desde
// acá, nunca de `process.env` directo — `process.env.APP_VARIANT` solo existe
// en el proceso de build (Node, al resolver app.config.ts), no en runtime.
export type AppVariant = "dev" | "test" | "prod";

export const appVariant = (Constants.expoConfig?.extra?.appVariant ?? "dev") as AppVariant;

export const isDev = appVariant === "dev";
export const isTest = appVariant === "test";
export const isProd = appVariant === "prod";
