'use client';

import type { Dictionary } from '@/i18n/config';
import { cop, dateLabel, monthlyOf, monthlyTotal } from '@/content/app';
import { HandNote } from '@/components/sections/shared';
import { Reveal } from '@/components/Reveal';
import { ServiceBadge } from '@/components/ServiceBadge';
import { DemoPhone } from './DemoPhone';
import { Narrator } from './Narrator';
import { activeSubs, useDemo, type DemoApi } from './useDemo';

type T = Dictionary['demo'];

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-[13px] font-medium text-dim">{label}</span>
      <span key={value} className="animate-[fade-up_0.4s_ease-out] text-[28px] leading-none font-extrabold tracking-tight tabular-nums">
        {value}
      </span>
    </div>
  );
}

/** Panel derecho: el resumen del mes, leyendo el mismo estado que el teléfono. */
function LiveWidgets({ api, t }: { api: DemoApi; t: T }) {
  const active = activeSubs(api.state);
  const total = monthlyTotal(active);
  const next = [...active].sort((a, b) => a.inDays - b.inDays)[0];
  const lowUse = active.filter((s) => s.unusedDays >= 45);
  const possible = lowUse.reduce((sum, s) => sum + monthlyOf(s) * 12, 0);

  return (
    <div className="flex w-full flex-col gap-4">
      <div className="flex flex-col gap-5 rounded-3xl border border-line bg-card p-[22px]">
        <span className="flex items-center justify-between">
          <span className="text-[17px] font-extrabold">{t.live.title}</span>
          <span className="flex items-center gap-1.5 font-mono text-[11px] font-bold text-ok uppercase">
            <span className="relative flex size-2">
              <span className="ping-soft absolute inset-0 rounded-full bg-ok" />
              <span className="relative size-2 rounded-full bg-ok" />
            </span>
            live
          </span>
        </span>
        <Stat label={t.live.month} value={cop(total)} />
        <Stat label={t.live.year} value={cop(total * 12)} />
        <div className="flex items-center justify-between border-t border-line pt-4 text-sm">
          <span className="text-dim">{t.live.active}</span>
          <b key={active.length} className="animate-[fade-up_0.4s_ease-out] tabular-nums">
            {active.length}
          </b>
        </div>
      </div>

      <div className="flex flex-col gap-3 rounded-3xl border border-line bg-card p-[22px]">
        <span className="text-[13px] font-medium text-dim">{t.live.next}</span>
        {next ? (
          <span key={next.id} className="flex animate-[fade-up_0.4s_ease-out] items-center gap-3">
            <ServiceBadge service={next.service} name={next.name} size={40} />
            <span className="flex flex-1 flex-col">
              <span className="text-[15px] font-bold">{next.name}</span>
              <span className="text-xs text-dim">
                {dateLabel(next.inDays, false)} · {next.inDays === 0 ? t.live.nextToday : t.live.nextIn.replace('{days}', String(next.inDays))}
              </span>
            </span>
            <span className="text-sm font-bold tabular-nums">{cop(next.amount)}</span>
          </span>
        ) : (
          <span className="text-sm text-faint">{t.live.none}</span>
        )}
      </div>

      <div className="flex flex-col gap-1.5 rounded-3xl border border-ok/25 bg-ok/[0.06] p-[22px]">
        <span className="text-[13px] font-medium text-dim">{t.live.possible}</span>
        <span key={possible} className="animate-[fade-up_0.4s_ease-out] text-[26px] leading-none font-extrabold text-ok tabular-nums">
          {possible > 0 ? cop(possible) : '—'}
        </span>
        <span className="text-xs text-faint">{t.live.possibleNote}</span>
      </div>
    </div>
  );
}

/** Portada interactiva: el teléfono con Mensualy funcionando al centro, el
 * narrador a la izquierda y el resumen en vivo a la derecha, leyendo el mismo
 * estado. Solo en memoria: al recargar vuelve a los datos de ejemplo. */
export function DemoSection({ t }: { t: T }) {
  const api = useDemo();
  return (
    <section id="demo" className="w-full max-w-[1260px] scroll-mt-20 px-5 pt-14 pb-16 sm:pt-20 sm:pb-28">
      <div className="grid grid-cols-1 items-start justify-items-center gap-8 lg:grid-cols-[minmax(0,350px)_380px_minmax(0,320px)] lg:justify-between lg:gap-10">
        <Reveal delay={200} className="order-2 flex w-full max-w-[440px] flex-col gap-2 lg:order-1 lg:pt-6">
          <HandNote className="hidden self-end lg:flex" flip>
            {t.narratorNote}
          </HandNote>
          <Narrator api={api} t={t} />
        </Reveal>
        <Reveal className="order-1 lg:order-2">
          <div id="demo-phone" className="relative">
            <div aria-hidden className="absolute inset-x-6 top-16 bottom-10 -z-10 rounded-full bg-violet/25 blur-[80px]" />
            <DemoPhone api={api} />
          </div>
        </Reveal>
        <Reveal delay={320} className="order-3 hidden w-full flex-col gap-2 lg:flex lg:pt-6">
          <HandNote className="self-start">{t.liveNote}</HandNote>
          <LiveWidgets api={api} t={t} />
        </Reveal>
      </div>
    </section>
  );
}
