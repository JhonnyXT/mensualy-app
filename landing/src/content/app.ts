// Contenido "de la app" (teléfono, notificaciones, catálogo). No se traduce:
// la app hoy existe en español y muestra montos en COP; la versión en inglés
// lo aclara. Nombres, colores y monogramas salen de
// `src/core/constants/services.catalog.ts` de la app, y los logos de
// `assets/logos/` (copiados a `public/img/logos/`).

export type Service = { key: string; name: string; color: string; monogram: string; logo?: string };

const logo = (key: string) => `/img/logos/${key}.png`;

export const SERVICES: Record<string, Service> = {
  netflix: { key: 'netflix', name: 'Netflix', color: '#E50914', monogram: 'N', logo: logo('netflix') },
  spotify: { key: 'spotify', name: 'Spotify', color: '#1DB954', monogram: 'S', logo: logo('spotify') },
  disney_plus: { key: 'disney_plus', name: 'Disney+', color: '#113CCF', monogram: 'D+', logo: logo('disney_plus') },
  amazon_prime: { key: 'amazon_prime', name: 'Amazon Prime', color: '#00A8E1', monogram: 'P', logo: logo('amazon_prime') },
  youtube_premium: { key: 'youtube_premium', name: 'YouTube Premium', color: '#FF0000', monogram: 'YT', logo: logo('youtube_premium') },
  icloud: { key: 'icloud', name: 'iCloud+', color: '#3693F3', monogram: 'iC', logo: logo('icloud') },
  claude: { key: 'claude', name: 'Claude', color: '#D97757', monogram: 'C', logo: logo('claude') },
  chatgpt: { key: 'chatgpt', name: 'ChatGPT Plus', color: '#10A37F', monogram: 'GPT', logo: logo('chatgpt') },
  hbo_max: { key: 'hbo_max', name: 'HBO Max', color: '#8A2BE2', monogram: 'H', logo: logo('hbo_max') },
  apple_music: { key: 'apple_music', name: 'Apple Music', color: '#FA243C', monogram: 'AM', logo: logo('apple_music') },
  apple_tv: { key: 'apple_tv', name: 'Apple TV+', color: '#000000', monogram: 'TV', logo: logo('apple_tv') },
  crunchyroll: { key: 'crunchyroll', name: 'Crunchyroll', color: '#F47521', monogram: 'CR', logo: logo('crunchyroll') },
  paramount_plus: { key: 'paramount_plus', name: 'Paramount+', color: '#0064FF', monogram: 'P+', logo: logo('paramount_plus') },
  google_one: { key: 'google_one', name: 'Google One', color: '#4285F4', monogram: 'G1', logo: logo('google_one') },
  dropbox: { key: 'dropbox', name: 'Dropbox', color: '#0061FF', monogram: 'DB', logo: logo('dropbox') },
  microsoft_365: { key: 'microsoft_365', name: 'Microsoft 365', color: '#E8480B', monogram: 'M365', logo: logo('microsoft_365') },
  adobe_cc: { key: 'adobe_cc', name: 'Adobe CC', color: '#FA0F00', monogram: 'Ae', logo: logo('adobe_cc') },
  canva: { key: 'canva', name: 'Canva Pro', color: '#00C4CC', monogram: 'Cv', logo: logo('canva') },
  notion: { key: 'notion', name: 'Notion', color: '#000000', monogram: 'N', logo: logo('notion') },
  figma: { key: 'figma', name: 'Figma', color: '#F24E1E', monogram: 'Fi', logo: logo('figma') },
  gemini: { key: 'gemini', name: 'Gemini', color: '#4285F4', monogram: 'Ge', logo: logo('gemini') },
  perplexity: { key: 'perplexity', name: 'Perplexity', color: '#1FB8CD', monogram: 'Px', logo: logo('perplexity') },
  cursor: { key: 'cursor', name: 'Cursor', color: '#000000', monogram: 'Cu', logo: logo('cursor') },
  github_copilot: { key: 'github_copilot', name: 'Copilot', color: '#000000', monogram: 'GC', logo: logo('github_copilot') },
  xbox_game_pass: { key: 'xbox_game_pass', name: 'Game Pass', color: '#107C10', monogram: 'XB', logo: logo('xbox_game_pass') },
  nintendo_online: { key: 'nintendo_online', name: 'Nintendo Online', color: '#E60012', monogram: 'NS', logo: logo('nintendo_online') },
  discord_nitro: { key: 'discord_nitro', name: 'Discord Nitro', color: '#5865F2', monogram: 'Di', logo: logo('discord_nitro') },
  duolingo_plus: { key: 'duolingo_plus', name: 'Duolingo', color: '#58CC02', monogram: 'DL', logo: logo('duolingo_plus') },
  linkedin_premium: { key: 'linkedin_premium', name: 'LinkedIn', color: '#0A66C2', monogram: 'in', logo: logo('linkedin_premium') },
  tidal: { key: 'tidal', name: 'Tidal', color: '#000000', monogram: 'T', logo: logo('tidal') },
  deezer: { key: 'deezer', name: 'Deezer', color: '#A238FF', monogram: 'DZ', logo: logo('deezer') },
  nordvpn: { key: 'nordvpn', name: 'NordVPN', color: '#4687FF', monogram: 'VPN', logo: logo('nordvpn') },
  /** Servicio "local" (sin logo en el catálogo): cae a iniciales, igual que en la app. */
  gym: { key: 'gym', name: 'Gimnasio', color: '#B7791F', monogram: 'GY' },
};

/** Dos filas del carrusel de logos del catálogo. */
export const CATALOG_ROWS: string[][] = [
  ['netflix', 'spotify', 'disney_plus', 'chatgpt', 'icloud', 'hbo_max', 'amazon_prime', 'youtube_premium', 'claude', 'apple_music', 'crunchyroll', 'paramount_plus', 'apple_tv', 'tidal', 'deezer', 'discord_nitro'],
  ['google_one', 'notion', 'figma', 'canva', 'microsoft_365', 'adobe_cc', 'gemini', 'perplexity', 'cursor', 'github_copilot', 'dropbox', 'xbox_game_pass', 'nintendo_online', 'duolingo_plus', 'linkedin_premium', 'nordvpn'],
];

export type Cycle = 'weekly' | 'monthly' | 'yearly';

export type DemoSub = {
  id: string;
  service: string;
  name: string;
  amount: number;
  cycle: Cycle;
  category: string;
  /** Día del mes del cobro (todas las del seed son mensuales: el calendario las pinta en noviembre). */
  billing: { day: number; month: 'nov' | 'dic' };
  /** Días desde "hoy" (TODAY) hasta el próximo cobro. */
  inDays: number;
  shared?: { with: string; percent: number };
  /** Días sin marcarse como usada. */
  unusedDays: number;
  /** Recordatorio propio en días antes; null = el predeterminado (el mismo día). */
  reminder: number | null;
  status: 'active' | 'cancelled';
};

/** "Hoy" fijo de la demo: 18 de noviembre de 2026. Montos en COP (la app convierte USD/EUR con sus tasas). */
export const TODAY = { day: 18, month: 'nov' as const };
const TODAY_DATE = new Date(2026, 10, 18);

const MONTHS = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sept', 'oct', 'nov', 'dic'];

/** Fecha a `inDays` de hoy, como la muestra la app (`toLocaleDateString('es-CO')`): "20 nov 2026". A mano para no depender del ICU del servidor (hidratación). */
export function dateLabel(inDays: number, withYear = true) {
  const d = new Date(TODAY_DATE);
  d.setDate(d.getDate() + inDays);
  const day = String(d.getDate()).padStart(2, '0');
  return withYear ? `${day} ${MONTHS[d.getMonth()]} ${d.getFullYear()}` : `${d.getDate()} ${MONTHS[d.getMonth()]}`;
}

/** Equivalente mensual según el ciclo (como `montoMensualYAnual` del detalle). */
export const monthlyOf = (s: Pick<DemoSub, 'amount' | 'cycle'>) =>
  s.cycle === 'yearly' ? Math.round(s.amount / 12) : s.cycle === 'weekly' ? Math.round((s.amount * 52) / 12) : s.amount;

export const CYCLE_LABEL: Record<Cycle, string> = { weekly: 'Semanal', monthly: 'Mensual', yearly: 'Anual' };
export const CYCLE_SUFFIX: Record<Cycle, string> = { weekly: '/sem', monthly: '/mes', yearly: '/año' };

/** Categoría que la app asigna al elegir el servicio del catálogo (`categoryName`). */
export const SERVICE_CATEGORY: Record<string, string> = {
  netflix: 'Streaming', disney_plus: 'Streaming', amazon_prime: 'Streaming', youtube_premium: 'Streaming', hbo_max: 'Streaming',
  apple_tv: 'Streaming', crunchyroll: 'Streaming', paramount_plus: 'Streaming',
  spotify: 'Música', apple_music: 'Música', tidal: 'Música', deezer: 'Música',
  icloud: 'Almacenamiento en la nube', google_one: 'Almacenamiento en la nube', dropbox: 'Almacenamiento en la nube',
  xbox_game_pass: 'Gaming', nintendo_online: 'Gaming', discord_nitro: 'Gaming',
  duolingo_plus: 'Otros', linkedin_premium: 'Otros', nordvpn: 'Otros',
};
export const categoryOf = (service: string | null) => (service ? (SERVICE_CATEGORY[service] ?? 'Trabajo / IA') : 'Otros');

const sub = (s: Omit<DemoSub, 'cycle' | 'reminder' | 'status'> & Partial<Pick<DemoSub, 'reminder'>>): DemoSub => ({ cycle: 'monthly', reminder: null, status: 'active', ...s });

export const DEMO_SUBS: DemoSub[] = [
  sub({ id: 'netflix', service: 'netflix', name: 'Netflix', amount: 26900, category: 'Streaming', billing: { day: 20, month: 'nov' }, inDays: 2, unusedDays: 3, reminder: 2 }),
  sub({ id: 'spotify', service: 'spotify', name: 'Spotify', amount: 18500, category: 'Música', billing: { day: 24, month: 'nov' }, inDays: 6, unusedDays: 0, shared: { with: 'Laura', percent: 50 } }),
  sub({ id: 'icloud', service: 'icloud', name: 'iCloud+', amount: 3900, category: 'Almacenamiento en la nube', billing: { day: 28, month: 'nov' }, inDays: 10, unusedDays: 1 }),
  sub({ id: 'chatgpt', service: 'chatgpt', name: 'ChatGPT Plus', amount: 80000, category: 'Trabajo / IA', billing: { day: 2, month: 'dic' }, inDays: 14, unusedDays: 0, reminder: 1 }),
  sub({ id: 'disney', service: 'disney_plus', name: 'Disney+', amount: 23900, category: 'Streaming', billing: { day: 5, month: 'dic' }, inDays: 17, unusedDays: 97 }),
  sub({ id: 'hbo', service: 'hbo_max', name: 'HBO Max', amount: 34900, category: 'Streaming', billing: { day: 12, month: 'dic' }, inDays: 24, unusedDays: 52 }),
  sub({ id: 'gym', service: 'gym', name: 'Gimnasio', amount: 45000, category: 'Gimnasio / Salud', billing: { day: 1, month: 'dic' }, inDays: 13, unusedDays: 2 }),
];

const COP = new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 });

/** Mismo formato que `formatCurrency(..., "COP")` de la app ("$ 26.900"). */
export const cop = (n: number) => COP.format(n);

export const monthlyTotal = (subs: DemoSub[]) => subs.reduce((sum, s) => sum + monthlyOf(s), 0);

/** Lo que te ahorras al mes por las compartidas (la parte que paga la otra persona). */
export const sharedSavings = (subs: DemoSub[]) =>
  subs.reduce((sum, s) => sum + (s.shared ? Math.round(s.amount * ((100 - s.shared.percent) / 100)) : 0), 0);
