export type DefaultCategory = {
  name: string;
  icon: string;
  color: string;
};

/**
 * Categorías iniciales de Mensualy. `icon` es un nombre de Ionicons
 * (o el set que use src/core/design-system) para no acoplar el dominio
 * a una librería de íconos concreta en el tipo.
 */
export const DEFAULT_CATEGORIES: DefaultCategory[] = [
  { name: "Streaming", icon: "play-circle", color: "#E0453C" },
  { name: "Música", icon: "musical-notes", color: "#1FA463" },
  { name: "Trabajo / IA", icon: "sparkles", color: "#4F46E5" },
  { name: "Gimnasio / Salud", icon: "barbell", color: "#B7791F" },
  { name: "Almacenamiento en la nube", icon: "cloud", color: "#2E6BE6" },
  { name: "Gaming", icon: "game-controller", color: "#6B6B70" },
  { name: "Otros", icon: "ellipsis-horizontal-circle", color: "#9A9AA0" },
];
