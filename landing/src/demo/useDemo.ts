'use client';

import { useReducer } from 'react';
import { DEMO_SUBS, type DemoSub } from '@/content/app';

// Estado único de la demo de la portada: el teléfono, el narrador y los datos
// en vivo leen de acá. Solo en memoria: al recargar vuelve a `DEMO_SUBS`.

export type Sheet = { kind: 'new' } | { kind: 'detail'; id: string } | { kind: 'cancel'; id: string; done: boolean } | null;

/** Lo que acaba de pasar: el narrador lo cuenta. */
export type DemoEvent =
  | { kind: 'intro' }
  | { kind: 'addOpen' }
  | { kind: 'added'; id: string; local: boolean }
  | { kind: 'detail'; id: string }
  | { kind: 'used'; id: string }
  | { kind: 'cancelAsk'; id: string }
  | { kind: 'cancelled'; id: string }
  | { kind: 'banner'; id: string }
  | { kind: 'bannerTap'; id: string }
  | { kind: 'dismissed'; id: string };

export type State = {
  subs: DemoSub[];
  sheet: Sheet;
  /** Aviso de cobro que se ve encima de la pantalla (n remonta la animación). */
  banner: { id: string; n: number } | null;
  dismissed: string[];
  usedToday: string[];
  event: DemoEvent;
  nextId: number;
};

export type NewSubInput = Pick<DemoSub, 'service' | 'name' | 'amount' | 'cycle' | 'category' | 'inDays' | 'reminder'>;

type Action =
  | { type: 'openNew' }
  | { type: 'add'; input: NewSubInput }
  | { type: 'openDetail'; id: string }
  | { type: 'close' }
  | { type: 'markUsed'; id: string }
  | { type: 'askCancel'; id: string }
  | { type: 'confirmCancel' }
  | { type: 'finishCancel' }
  | { type: 'simulateBanner' }
  | { type: 'tapBanner' }
  | { type: 'hideBanner' }
  | { type: 'dismiss'; id: string }
  | { type: 'reset' };

const initial: State = { subs: DEMO_SUBS, sheet: null, banner: null, dismissed: [], usedToday: [], event: { kind: 'intro' }, nextId: 1 };

export const activeSubs = (s: State) => s.subs.filter((x) => x.status === 'active');

/** Mismo umbral que `esSuscripcionZombie` (90 días sin marcarla como usada). */
export const isZombie = (sub: DemoSub, s: State) => sub.unusedDays >= 90 && !s.usedToday.includes(sub.id);

/** Próximo cobro con aviso: el más cercano entre las activas. */
const nextCharge = (s: State) => [...activeSubs(s)].sort((a, b) => a.inDays - b.inDays)[0];

function reducer(s: State, a: Action): State {
  switch (a.type) {
    case 'openNew':
      return { ...s, sheet: { kind: 'new' }, banner: null, event: { kind: 'addOpen' } };
    case 'add': {
      const id = `new-${s.nextId}`;
      const sub: DemoSub = {
        ...a.input,
        id,
        billing: { day: 0, month: 'nov' },
        unusedDays: 0,
        status: 'active',
      };
      return { ...s, subs: [...s.subs, sub], sheet: null, nextId: s.nextId + 1, event: { kind: 'added', id, local: a.input.service === 'local' } };
    }
    case 'openDetail':
      return { ...s, sheet: { kind: 'detail', id: a.id }, event: { kind: 'detail', id: a.id } };
    case 'close':
      return { ...s, sheet: null };
    case 'markUsed':
      return {
        ...s,
        usedToday: [...s.usedToday, a.id],
        subs: s.subs.map((x) => (x.id === a.id ? { ...x, unusedDays: 0 } : x)),
        event: { kind: 'used', id: a.id },
      };
    case 'askCancel':
      return { ...s, sheet: { kind: 'cancel', id: a.id, done: false }, event: { kind: 'cancelAsk', id: a.id } };
    case 'confirmCancel':
      if (s.sheet?.kind !== 'cancel') return s;
      return {
        ...s,
        sheet: { ...s.sheet, done: true },
        subs: s.subs.map((x) => (x.id === (s.sheet as { id: string }).id ? { ...x, status: 'cancelled' } : x)),
        event: { kind: 'cancelled', id: s.sheet.id },
      };
    case 'finishCancel':
      return { ...s, sheet: null };
    case 'simulateBanner': {
      const sub = nextCharge(s);
      if (!sub) return s;
      return { ...s, sheet: null, banner: { id: sub.id, n: (s.banner?.n ?? 0) + 1 }, event: { kind: 'banner', id: sub.id } };
    }
    case 'tapBanner':
      if (!s.banner) return s;
      return { ...s, banner: null, sheet: { kind: 'detail', id: s.banner.id }, event: { kind: 'bannerTap', id: s.banner.id } };
    case 'hideBanner':
      return { ...s, banner: null };
    case 'dismiss':
      return { ...s, dismissed: [...s.dismissed, a.id], event: { kind: 'dismissed', id: a.id } };
    case 'reset':
      return initial;
  }
}

export function useDemo() {
  const [state, dispatch] = useReducer(reducer, initial);
  return { state, dispatch };
}

export type DemoApi = ReturnType<typeof useDemo>;
