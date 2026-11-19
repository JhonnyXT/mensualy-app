'use client';

import { Minus, Plus, Users } from 'lucide-react';
import { useState } from 'react';
import type { Dictionary } from '@/i18n/config';
import { cop } from '@/content/app';
import { Reveal } from '../Reveal';
import { ServiceBadge } from '../ServiceBadge';
import { SectionHead } from './shared';

const TOTAL = 18500;

/** Mismo reparto que `calcularDivisionCosto` de la app: tu parte se redondea y
 * la otra persona paga el resto, así la suma siempre da el total exacto. */
function split(total: number, percent: number) {
  const mine = Math.round((total * percent) / 100);
  return { mine, theirs: total - mine };
}

export function Sharing({ t }: { t: Dictionary['sharing'] }) {
  const [percent, setPercent] = useState(50);
  const { mine, theirs } = split(TOTAL, percent);

  return (
    <section id="compartir" className="flex w-full max-w-[1000px] scroll-mt-16 flex-col items-center gap-10 px-5 py-16 sm:gap-14 sm:py-28">
      <SectionHead eyebrow={t.eyebrow} title={t.title} subtitle={t.subtitle} />

      <Reveal className="w-full max-w-[560px] rounded-[26px] border border-line bg-card p-5 sm:p-8">
        <div className="flex items-center gap-3.5">
          <ServiceBadge service="spotify" size={48} />
          <span className="flex flex-1 flex-col">
            <span className="text-[17px] font-bold">Spotify Duo</span>
            <span className="text-sm text-dim">{cop(TOTAL)}/mes</span>
          </span>
          <span className="flex items-center gap-1.5 rounded-full bg-warn/15 px-3 py-1.5 text-xs font-bold text-warn">
            <Users size={14} aria-hidden />
            Laura
          </span>
        </div>

        <div className="mt-7 flex h-3 overflow-hidden rounded-full bg-surface-2" aria-hidden>
          <span className="h-full rounded-full bg-violet transition-[width] duration-500 ease-out" style={{ width: `${percent}%` }} />
        </div>

        <div className="mt-5 grid grid-cols-2 gap-3">
          <div className="rounded-2xl bg-surface p-4">
            <span className="text-xs text-dim">{t.you}</span>
            <div className="mt-1 text-2xl font-extrabold tabular-nums">{cop(mine)}</div>
          </div>
          <div className="rounded-2xl bg-surface p-4">
            <span className="text-xs text-dim">{t.them}</span>
            <div className="mt-1 text-2xl font-extrabold text-dim tabular-nums">{cop(theirs)}</div>
          </div>
        </div>

        <div className="mt-5 flex items-center justify-between">
          <span className="text-sm text-dim">{t.portion}</span>
          <span className="flex items-center gap-3">
            <button type="button" aria-label="-10%" onClick={() => setPercent((p) => Math.max(0, p - 10))} className="flex size-9 cursor-pointer items-center justify-center rounded-full bg-surface-2 transition-colors hover:bg-line active:scale-95">
              <Minus size={15} aria-hidden />
            </button>
            <span className="w-12 text-center font-mono text-base font-bold tabular-nums">{percent}%</span>
            <button type="button" aria-label="+10%" onClick={() => setPercent((p) => Math.min(100, p + 10))} className="flex size-9 cursor-pointer items-center justify-center rounded-full bg-surface-2 transition-colors hover:bg-line active:scale-95">
              <Plus size={15} aria-hidden />
            </button>
          </span>
        </div>

        <div className="mt-5 flex items-center justify-between rounded-2xl bg-violet/12 px-4 py-3.5">
          <span className="text-sm text-dim">{t.saved}</span>
          <span className="text-base font-bold text-accent tabular-nums">
            {cop(theirs)}
            {t.perMonth}
          </span>
        </div>
      </Reveal>
    </section>
  );
}
