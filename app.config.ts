import type { ExpoConfig } from "expo/config";

// ─── Build variants ─────────────────────────────────────────────────────────
// Patrón portado de anchor-app/Meld (ver su CLAUDE.md → "Build variants").
// Cada variant tiene su propio applicationId — se instalan una al lado de la
// otra en el mismo dispositivo, cada una con su propia base de datos SQLite.
type Variant = "dev" | "test" | "prod";

const variants = {
  dev: {
    name: "Mensualy (Dev)",
    package: "com.mensualy.app.dev",
    scheme: "mensualy-dev",
    iconBackground: "#4F46E5",
  },
  test: {
    name: "Mensualy (Test)",
    package: "com.mensualy.app.test",
    scheme: "mensualy-test",
    iconBackground: "#F59E0B",
  },
  prod: {
    name: "Mensualy",
    package: "com.mensualy.app",
    scheme: "mensualy",
    iconBackground: "#E6F4FE",
  },
} as const satisfies Record<Variant, unknown>;

function resolveVariant(): Variant {
  const value = process.env.APP_VARIANT ?? "dev";
  if (value in variants) return value as Variant;
  throw new Error(`Unknown APP_VARIANT "${value}". Expected one of: ${Object.keys(variants).join(", ")}`);
}

const variant = resolveVariant();
const current = variants[variant];

const config: ExpoConfig = {
  name: current.name,
  slug: "mensualy-app",
  scheme: current.scheme,
  version: "1.0.0",
  orientation: "portrait",
  icon: "./assets/icon.png",
  userInterfaceStyle: "light",
  ios: {
    supportsTablet: true,
    bundleIdentifier: current.package,
  },
  android: {
    package: current.package,
    adaptiveIcon: {
      // Sin `backgroundImage`: el color sólido por variant (índigo/ámbar/
      // celeste) es lo que distingue dev/test/prod en el launcher — una
      // imagen de fondo fija taparía esa diferencia.
      backgroundColor: current.iconBackground,
      foregroundImage: "./assets/android-icon-foreground.png",
      monochromeImage: "./assets/android-icon-monochrome.png",
    },
    predictiveBackGestureEnabled: false,
  },
  web: {
    favicon: "./assets/favicon.png",
  },
  plugins: [
    ["expo-router", { root: "./src/app" }],
    "expo-sqlite",
    "expo-sharing",
    [
      "expo-local-authentication",
      {
        faceIDPermission: "Mensualy usa Face ID para desbloquear la app.",
      },
    ],
    [
      "expo-notifications",
      {
        color: "#4F46E5",
      },
    ],
    [
      "expo-image-picker",
      {
        photosPermission: "Mensualy necesita acceso a tus fotos para que elijas tu foto de perfil.",
      },
    ],
    [
      "expo-splash-screen",
      {
        // El tema nativo de Android (API de splash de Android 12+) referencia
        // @drawable/splashscreen_logo SIEMPRE, así el plugin no reciba
        // `image` — sin esta imagen el build de Android falla al linkear
        // recursos. Solo se ve una fracción de segundo antes de que
        // `AnimatedSplash` (JS) tome el control — `imageWidth` debe coincidir
        // con `ICON_SIZE` de `AnimatedSplash.tsx` para que el logo no "salte"
        // de tamaño en el hand-off nativo → JS.
        image: "./assets/splash-icon.png",
        imageWidth: 100,
        backgroundColor: "#121212",
      },
    ],
  ],
  extra: {
    appVariant: variant,
  },
};

export default config;
