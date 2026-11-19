import type { Subscription } from "../../../core/database/schema";
import { SERVICES_CATALOG } from "../../../core/constants/services.catalog";

export type GrupoCategoriaDuplicada = {
  categoryName: string;
  subscriptions: Subscription[];
};

/**
 * Agrupa suscripciones activas por categoría del catálogo (Streaming,
 * Música, etc.) y devuelve solo los grupos con 2+ servicios — candidatos a
 * consolidar. Suscripciones sin `serviceKey` en el catálogo (agregadas a
 * mano) quedan afuera: no hay categoría con la que agruparlas.
 */
export function detectarCategoriasDuplicadas(subscriptions: Subscription[]): GrupoCategoriaDuplicada[] {
  const porCategoria = new Map<string, Subscription[]>();
  for (const s of subscriptions) {
    const categoryName = SERVICES_CATALOG.find((c) => c.key === s.serviceKey)?.categoryName;
    if (!categoryName) continue;
    const lista = porCategoria.get(categoryName) ?? [];
    lista.push(s);
    porCategoria.set(categoryName, lista);
  }
  return [...porCategoria.entries()]
    .filter(([, subs]) => subs.length >= 2)
    .map(([categoryName, subs]) => ({ categoryName, subscriptions: subs }));
}
