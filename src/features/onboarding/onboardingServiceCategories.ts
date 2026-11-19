/**
 * Agrupación de categorías para el paso 2 del onboarding (filtros tipo
 * "Streaming & Cine", "Música & Audio"...). Es propia de esta pantalla, no
 * el `categoryName` de `SERVICES_CATALOG` (ese es más granular y se usa para
 * otros fines, ej. "Almacenamiento en la nube" para iCloud).
 */
export type OnboardingServiceCategory =
  | "all"
  | "streaming"
  | "musica"
  | "productividad"
  | "fitness"
  | "gaming";

export const ONBOARDING_CATEGORIES: { id: OnboardingServiceCategory; label: string }[] = [
  { id: "all", label: "Populares" },
  { id: "streaming", label: "Streaming & Cine" },
  { id: "musica", label: "Música & Audio" },
  { id: "productividad", label: "Productividad & IA" },
  { id: "fitness", label: "Fitness" },
  { id: "gaming", label: "Gaming" },
];

export const ONBOARDING_CATEGORY_BY_SERVICE_KEY: Record<string, OnboardingServiceCategory> = {
  netflix: "streaming",
  disney_plus: "streaming",
  amazon_prime: "streaming",
  youtube_premium: "streaming",
  hbo_max: "streaming",
  paramount_plus: "streaming",
  apple_tv: "streaming",
  crunchyroll: "streaming",
  vix: "streaming",
  spotify: "musica",
  apple_music: "musica",
  youtube_music: "musica",
  tidal: "musica",
  deezer: "musica",
  claude: "productividad",
  chatgpt: "productividad",
  gemini: "productividad",
  icloud: "productividad",
  google_one: "productividad",
  dropbox: "productividad",
  microsoft_365: "productividad",
  adobe_cc: "productividad",
  canva: "productividad",
  notion: "productividad",
  gym: "fitness",
  gamepass: "gaming",
  xbox_game_pass: "gaming",
  nintendo_online: "gaming",
  discord_nitro: "gaming",
  figma: "productividad",
  slack: "productividad",
  vercel: "productividad",
  supabase: "productividad",
  firebase: "productividad",
  cloudflare: "productividad",
  cursor: "productividad",
  github_copilot: "productividad",
  perplexity: "productividad",
  grok: "productividad",
  deepseek: "productividad",
  meta_ai: "productividad",
  microsoft_365_copilot: "productividad",
  photoshop: "productividad",
  after_effects: "productividad",
};
