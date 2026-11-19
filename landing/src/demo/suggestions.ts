// Copia de la lógica de "Sugerencias de ahorro" de `src/app/(tabs)/dashboard.tsx`
// (y de `detectarZombie`, `detectarCategoriaDuplicada`,
// `detectarGastoDesproporcionado`), con la misma prioridad y los mismos textos.
// Queda fuera "subió de precio": necesita historial de precios. Si cambian las
// reglas en la app, actualizar esto.

import { monthlyOf, monthlyTotal, type DemoSub } from '@/content/app';

export type SuggestionKind = 'zombie' | 'early' | 'duplicate' | 'outsized' | 'share';

export type Suggestion = { kind: SuggestionKind; sub: DemoSub; title: string; message: string };

const ZOMBIE_DAYS = 90;
const EARLY_DAYS = 45;
const OUTSIZED_SHARE = 0.25;
const OUTSIZED_MIN_ACTIVE = 3;
const SHARE_MIN = 30000;

export function suggestionsFor(active: DemoSub[], dismissed: string[]): Suggestion[] {
  const used = new Set<string>();
  const open = (s: DemoSub) => !used.has(s.id) && !dismissed.includes(s.id);
  const out: Suggestion[] = [];

  for (const s of active.filter((x) => x.unusedDays >= ZOMBIE_DAYS && open(x))) {
    used.add(s.id);
    out.push({ kind: 'zombie', sub: s, title: 'Suscripción zombie detectada', message: `Sin uso registrado en ${s.name} hace ${s.unusedDays} días` });
  }

  for (const s of active.filter((x) => x.unusedDays >= EARLY_DAYS && x.unusedDays < ZOMBIE_DAYS && open(x))) {
    used.add(s.id);
    out.push({ kind: 'early', sub: s, title: `Poco uso de ${s.name}`, message: `Sin uso registrado hace ${s.unusedDays} días` });
  }

  const byCategory = new Map<string, DemoSub[]>();
  for (const s of active) if (s.service !== 'local') byCategory.set(s.category, [...(byCategory.get(s.category) ?? []), s]);
  for (const [category, group] of byCategory) {
    if (group.length < 2) continue;
    const candidate = [...group].sort((a, b) => b.unusedDays - a.unusedDays)[0];
    if (!open(candidate)) continue;
    used.add(candidate.id);
    out.push({ kind: 'duplicate', sub: candidate, title: `${category}: ${group.length} servicios`, message: `${group.map((g) => g.name).join(', ')} — ¿los necesitas todos?` });
  }

  const total = monthlyTotal(active);
  if (active.length >= OUTSIZED_MIN_ACTIVE && total > 0) {
    for (const s of active.filter((x) => monthlyOf(x) / total >= OUTSIZED_SHARE && open(x))) {
      used.add(s.id);
      out.push({ kind: 'outsized', sub: s, title: `${s.name} pesa mucho en tu presupuesto`, message: `Es el ${Math.round((monthlyOf(s) / total) * 100)}% de tu gasto mensual en suscripciones` });
    }
  }

  for (const s of active.filter((x) => !x.shared && monthlyOf(x) >= SHARE_MIN && open(x)).slice(0, 2)) {
    out.push({ kind: 'share', sub: s, title: `Comparte ${s.name} con tu pareja`, message: 'Ahorra dividiendo el costo automáticamente' });
  }

  return out;
}
