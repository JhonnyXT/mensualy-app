export type CatalogService = {
  key: string;
  name: string;
  categoryName: string;
  color: string;
  /** Iniciales o glifo simple a mostrar mientras no haya logos reales. */
  monogram: string;
  defaultCurrency: "USD" | "COP" | "EUR";
};

/**
 * Catálogo de servicios populares para autocompletar el formulario de
 * "agregar suscripción". `color`/`monogram` alimentan el badge del logo
 * hasta que se incorporen assets de marca reales en /assets/logos.
 */
export const SERVICES_CATALOG: CatalogService[] = [
  { key: "netflix", name: "Netflix", categoryName: "Streaming", color: "#E50914", monogram: "N", defaultCurrency: "USD" },
  { key: "spotify", name: "Spotify", categoryName: "Música", color: "#1DB954", monogram: "S", defaultCurrency: "USD" },
  { key: "disney_plus", name: "Disney+", categoryName: "Streaming", color: "#113CCF", monogram: "D+", defaultCurrency: "USD" },
  { key: "amazon_prime", name: "Amazon Prime", categoryName: "Streaming", color: "#00A8E1", monogram: "P", defaultCurrency: "USD" },
  { key: "youtube_premium", name: "YouTube Premium", categoryName: "Streaming", color: "#FF0000", monogram: "YT", defaultCurrency: "USD" },
  { key: "icloud", name: "iCloud+", categoryName: "Almacenamiento en la nube", color: "#3693F3", monogram: "iC", defaultCurrency: "USD" },
  { key: "claude", name: "Claude", categoryName: "Trabajo / IA", color: "#D97757", monogram: "C", defaultCurrency: "USD" },
  { key: "chatgpt", name: "ChatGPT Plus", categoryName: "Trabajo / IA", color: "#10A37F", monogram: "GPT", defaultCurrency: "USD" },
  { key: "hbo_max", name: "HBO Max", categoryName: "Streaming", color: "#8A2BE2", monogram: "H", defaultCurrency: "USD" },
  { key: "gym", name: "Gimnasio", categoryName: "Gimnasio / Salud", color: "#B7791F", monogram: "GY", defaultCurrency: "COP" },
  { key: "gamepass", name: "PlayStation Plus / Game Pass", categoryName: "Gaming", color: "#0070D1", monogram: "PS", defaultCurrency: "USD" },
  { key: "paramount_plus", name: "Paramount+", categoryName: "Streaming", color: "#0064FF", monogram: "P+", defaultCurrency: "USD" },
  { key: "apple_tv", name: "Apple TV+", categoryName: "Streaming", color: "#000000", monogram: "TV", defaultCurrency: "USD" },
  { key: "crunchyroll", name: "Crunchyroll", categoryName: "Streaming", color: "#F47521", monogram: "CR", defaultCurrency: "USD" },
  { key: "vix", name: "ViX", categoryName: "Streaming", color: "#00A0DC", monogram: "V", defaultCurrency: "COP" },
  { key: "apple_music", name: "Apple Music", categoryName: "Música", color: "#FA243C", monogram: "AM", defaultCurrency: "USD" },
  { key: "youtube_music", name: "YouTube Music", categoryName: "Música", color: "#FF0000", monogram: "YM", defaultCurrency: "USD" },
  { key: "tidal", name: "Tidal", categoryName: "Música", color: "#000000", monogram: "T", defaultCurrency: "USD" },
  { key: "deezer", name: "Deezer", categoryName: "Música", color: "#A238FF", monogram: "DZ", defaultCurrency: "USD" },
  { key: "google_one", name: "Google One", categoryName: "Almacenamiento en la nube", color: "#4285F4", monogram: "G1", defaultCurrency: "USD" },
  { key: "dropbox", name: "Dropbox", categoryName: "Almacenamiento en la nube", color: "#0061FF", monogram: "DB", defaultCurrency: "USD" },
  { key: "microsoft_365", name: "Microsoft 365", categoryName: "Trabajo / IA", color: "#E8480B", monogram: "M365", defaultCurrency: "USD" },
  { key: "adobe_cc", name: "Adobe Creative Cloud", categoryName: "Trabajo / IA", color: "#FA0F00", monogram: "Ae", defaultCurrency: "USD" },
  { key: "canva", name: "Canva Pro", categoryName: "Trabajo / IA", color: "#00C4CC", monogram: "Cv", defaultCurrency: "USD" },
  { key: "notion", name: "Notion", categoryName: "Trabajo / IA", color: "#000000", monogram: "N", defaultCurrency: "USD" },
  { key: "gemini", name: "Gemini Advanced", categoryName: "Trabajo / IA", color: "#4285F4", monogram: "Ge", defaultCurrency: "USD" },
  { key: "xbox_game_pass", name: "Xbox Game Pass", categoryName: "Gaming", color: "#107C10", monogram: "XB", defaultCurrency: "USD" },
  { key: "nintendo_online", name: "Nintendo Switch Online", categoryName: "Gaming", color: "#E60012", monogram: "NS", defaultCurrency: "USD" },
  { key: "duolingo_plus", name: "Duolingo Plus", categoryName: "Otros", color: "#58CC02", monogram: "DL", defaultCurrency: "USD" },
  { key: "audible", name: "Audible", categoryName: "Otros", color: "#F8991C", monogram: "Au", defaultCurrency: "USD" },
  { key: "linkedin_premium", name: "LinkedIn Premium", categoryName: "Otros", color: "#0A66C2", monogram: "in", defaultCurrency: "USD" },
  { key: "nordvpn", name: "NordVPN", categoryName: "Otros", color: "#4687FF", monogram: "VPN", defaultCurrency: "USD" },
  { key: "figma", name: "Figma", categoryName: "Trabajo / IA", color: "#F24E1E", monogram: "Fi", defaultCurrency: "USD" },
  { key: "slack", name: "Slack", categoryName: "Trabajo / IA", color: "#4A154B", monogram: "Sl", defaultCurrency: "USD" },
  { key: "vercel", name: "Vercel", categoryName: "Trabajo / IA", color: "#000000", monogram: "Vc", defaultCurrency: "USD" },
  { key: "supabase", name: "Supabase", categoryName: "Trabajo / IA", color: "#3ECF8E", monogram: "Sb", defaultCurrency: "USD" },
  { key: "firebase", name: "Firebase", categoryName: "Trabajo / IA", color: "#FFCA28", monogram: "Fb", defaultCurrency: "USD" },
  { key: "cloudflare", name: "Cloudflare", categoryName: "Trabajo / IA", color: "#F38020", monogram: "CF", defaultCurrency: "USD" },
  { key: "cursor", name: "Cursor", categoryName: "Trabajo / IA", color: "#000000", monogram: "Cu", defaultCurrency: "USD" },
  { key: "github_copilot", name: "GitHub Copilot", categoryName: "Trabajo / IA", color: "#000000", monogram: "GC", defaultCurrency: "USD" },
  { key: "perplexity", name: "Perplexity Pro", categoryName: "Trabajo / IA", color: "#1FB8CD", monogram: "Px", defaultCurrency: "USD" },
  { key: "grok", name: "Grok", categoryName: "Trabajo / IA", color: "#000000", monogram: "Gr", defaultCurrency: "USD" },
  { key: "deepseek", name: "DeepSeek", categoryName: "Trabajo / IA", color: "#4D6BFE", monogram: "DS", defaultCurrency: "USD" },
  { key: "meta_ai", name: "Meta AI", categoryName: "Trabajo / IA", color: "#0064E0", monogram: "MA", defaultCurrency: "USD" },
  { key: "microsoft_365_copilot", name: "Microsoft 365 Copilot", categoryName: "Trabajo / IA", color: "#E8480B", monogram: "Co", defaultCurrency: "USD" },
  { key: "photoshop", name: "Adobe Photoshop", categoryName: "Trabajo / IA", color: "#31A8FF", monogram: "Ps", defaultCurrency: "USD" },
  { key: "after_effects", name: "Adobe After Effects", categoryName: "Trabajo / IA", color: "#9999FF", monogram: "Ae", defaultCurrency: "USD" },
  { key: "discord_nitro", name: "Discord Nitro", categoryName: "Gaming", color: "#5865F2", monogram: "Di", defaultCurrency: "USD" },
  { key: "x_premium", name: "X Premium", categoryName: "Otros", color: "#000000", monogram: "X", defaultCurrency: "USD" },
  { key: "instagram", name: "Instagram Subscription", categoryName: "Otros", color: "#E1306C", monogram: "Ig", defaultCurrency: "USD" },
  { key: "meta_verified", name: "Meta Verified", categoryName: "Otros", color: "#0064E0", monogram: "Mv", defaultCurrency: "USD" },
  { key: "tiktok", name: "TikTok", categoryName: "Otros", color: "#000000", monogram: "Tk", defaultCurrency: "USD" },
  { key: "nordpass", name: "NordPass", categoryName: "Otros", color: "#1B2437", monogram: "Np", defaultCurrency: "USD" },
];
