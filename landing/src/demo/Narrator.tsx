'use client';

import { Bell, Moon, Plus, RotateCcw } from 'lucide-react';
import type { Dictionary } from '@/i18n/config';
import { ServiceBadge } from '@/components/ServiceBadge';
import { activeSubs, type DemoApi, type DemoEvent } from './useDemo';

type T = Dictionary['demo'];

const fill = (text: string, name = '') => text.replace('{name}', name);

/** En pantallas chicas el narrador queda debajo del teléfono: tras una acción
 * se sube la vista al teléfono para que se vea lo que pasó. */
function showPhone() {
  if (window.matchMedia('(min-width: 1024px)').matches) return;
  document.getElementById('demo-phone')?.scrollIntoView({ block: 'center' });
}

function copyFor(ev: DemoEvent, t: T, nameOf: (id: string) => string) {
  switch (ev.kind) {
    case 'intro':
      return t.ev.intro;
    case 'addOpen':
      return t.ev.addOpen;
    case 'added': {
      const c = ev.local ? t.ev.addedLocal : t.ev.added;
      return { ...c, title: fill(c.title, nameOf(ev.id)) };
    }
    case 'banner':
      return { ...t.ev.banner, body: fill(t.ev.banner.body, nameOf(ev.id)) };
    case 'detail':
      return { ...t.ev.detail, title: fill(t.ev.detail.title, nameOf(ev.id)) };
    case 'cancelled':
      return { ...t.ev.cancelled, title: fill(t.ev.cancelled.title, nameOf(ev.id)) };
    case 'used':
    case 'cancelAsk':
    case 'bannerTap':
    case 'dismissed':
      return t.ev[ev.kind];
  }
}

/** Panel izquierdo: cuenta lo que acaba de pasar en el teléfono y ofrece qué probar. */
export function Narrator({ api, t }: { api: DemoApi; t: T }) {
  const { state, dispatch } = api;
  const nameOf = (id: string) => state.subs.find((s) => s.id === id)?.name ?? '';
  const ev = state.event;
  const copy = copyFor(ev, t, nameOf);
  const evSub = 'id' in ev ? state.subs.find((s) => s.id === ev.id) : undefined;
  const zombie = activeSubs(state).find((s) => s.unusedDays >= 90);

  const action = 'flex min-h-12 w-full cursor-pointer items-center gap-3 rounded-2xl border border-line bg-card px-4 text-left text-sm font-semibold transition-all duration-200 hover:-translate-y-0.5 hover:border-violet/50 hover:bg-surface';

  return (
    <div className="flex w-full flex-col gap-4">
      <div key={`${ev.kind}-${'id' in ev ? ev.id : ''}`} aria-live="polite" className="flex animate-[fade-up_0.4s_ease-out] flex-col gap-2.5 rounded-3xl border border-line bg-card p-[22px]">
        <span className="flex items-center gap-2">
          {evSub && <ServiceBadge service={evSub.service} name={evSub.name} size={22} />}
          <span className="font-mono text-[11px] font-bold tracking-[0.12em] text-accent uppercase">{copy.eyebrow}</span>
        </span>
        <span className="text-[19px] leading-snug font-extrabold tracking-[-0.01em]">{copy.title}</span>
        <p className="text-sm leading-relaxed text-dim">{copy.body}</p>
      </div>

      <div className="flex flex-col gap-2">
        <span className="pl-1 font-mono text-[11px] font-bold tracking-[0.12em] text-faint uppercase">{t.tryTitle}</span>
        <button type="button" onClick={() => {
            dispatch({ type: 'openNew' });
            showPhone();
          }}
          className={action}>
          <span className="flex size-8 items-center justify-center rounded-full bg-violet text-white">
            <Plus size={16} strokeWidth={2.6} aria-hidden />
          </span>
          {t.actions.add}
        </button>
        <button type="button" onClick={() => {
            dispatch({ type: 'simulateBanner' });
            showPhone();
          }}
          disabled={activeSubs(state).length === 0} className={`${action} disabled:opacity-40`}>
          <span className="flex size-8 items-center justify-center rounded-full bg-warn/15 text-warn">
            <Bell size={15} aria-hidden />
          </span>
          {t.actions.banner}
        </button>
        {zombie && (
          <button type="button" onClick={() => {
              dispatch({ type: 'openDetail', id: zombie.id });
              showPhone();
            }}
            className={action}>
            <span className="flex size-8 items-center justify-center rounded-full bg-violet/15 text-violet">
              <Moon size={15} aria-hidden />
            </span>
            {t.actions.zombie}
          </button>
        )}
      </div>
      <button type="button" onClick={() => dispatch({ type: 'reset' })} className="flex h-10 cursor-pointer items-center gap-1.5 self-start pl-1 text-[13px] text-faint underline-offset-4 hover:text-dim hover:underline">
        <RotateCcw size={13} aria-hidden />
        {t.actions.reset}
      </button>
    </div>
  );
}
