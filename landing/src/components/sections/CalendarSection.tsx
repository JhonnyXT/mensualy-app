'use client';

import { useState } from 'react';
import type { Dictionary } from '@/i18n/config';
import { cop, DEMO_SUBS, monthlyTotal, SERVICES, TODAY } from '@/content/app';
import { Reveal } from '../Reveal';
import { ServiceBadge } from '../ServiceBadge';
import { SectionHead } from './shared';

// Noviembre 2026 empieza en domingo: con la semana de lunes a domingo quedan 6 huecos.
const OFFSET = 6;
const DAYS = 30;

// Todas las de la demo son mensuales: cada una cobra en noviembre el mismo día del mes.
const byDay = new Map<number, typeof DEMO_SUBS>();
for (const s of DEMO_SUBS) byDay.set(s.billing.day, [...(byDay.get(s.billing.day) ?? []), s]);

export function CalendarSection({ t }: { t: Dictionary['calendar'] }) {
  const [selected, setSelected] = useState(20);
  const list = byDay.get(selected) ?? [];

  return (
    <section id="calendario" className="flex w-full max-w-[1000px] scroll-mt-16 flex-col items-center gap-10 px-5 py-16 sm:gap-14 sm:py-28">
      <SectionHead eyebrow={t.eyebrow} title={t.title} subtitle={t.subtitle} />

      <Reveal className="grid w-full max-w-[860px] grid-cols-1 gap-4 md:grid-cols-[1.25fr_1fr] md:gap-5">
        <div className="rounded-[24px] border border-line bg-card p-4 sm:p-6">
          <div className="mb-4 flex items-center justify-between px-1">
            <span className="text-[17px] font-extrabold">{t.month}</span>
            <span className="font-mono text-[11px] text-faint uppercase">{t.hint}</span>
          </div>
          <div className="grid grid-cols-7 gap-1 text-center">
            {t.weekdays.map((w, i) => (
              <span key={i} className="pb-2 font-mono text-[11px] font-bold text-faint">
                {w}
              </span>
            ))}
            {Array.from({ length: OFFSET }, (_, i) => (
              <span key={`e${i}`} />
            ))}
            {Array.from({ length: DAYS }, (_, i) => {
              const day = i + 1;
              const subs = byDay.get(day) ?? [];
              const isSelected = day === selected;
              const isToday = day === TODAY.day;
              return (
                <button
                  key={day}
                  type="button"
                  onClick={() => setSelected(day)}
                  aria-pressed={isSelected}
                  className={`relative flex aspect-square cursor-pointer flex-col items-center justify-center rounded-xl text-sm font-semibold transition-all duration-200 ${
                    isSelected ? 'scale-105 bg-violet text-white shadow-[0_8px_24px_-8px_rgba(124,107,255,0.9)]' : isToday ? 'bg-surface-2 text-ink ring-1 ring-accent/60' : 'text-dim hover:bg-surface-2 hover:text-ink'
                  }`}
                >
                  {day}
                  {subs.length > 0 && (
                    <span className="absolute bottom-1.5 flex gap-0.5">
                      {subs.map((s) => (
                        <span key={s.id} className="size-1.5 rounded-full" style={{ background: isSelected ? '#fff' : SERVICES[s.service].color }} />
                      ))}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        <div className="flex flex-col gap-3 rounded-[24px] border border-line bg-card p-5 sm:p-6">
          <span className="flex flex-col">
            <span className="text-sm text-dim">{t.selectedLabel}</span>
            <span className="text-2xl font-extrabold tracking-[-0.02em]">
              {selected} {t.monthShort}
            </span>
          </span>
          {list.length === 0 ? (
            <p className="flex flex-1 items-center justify-center py-8 text-sm text-faint">{t.empty}</p>
          ) : (
            <ul key={selected} className="flex flex-col gap-3">
              {list.map((s) => (
                <li key={s.id} className="animate-[fade-up_0.35s_ease-out] flex items-center gap-3 rounded-2xl bg-surface p-3">
                  <ServiceBadge service={s.service} name={s.name} size={42} />
                  <span className="flex flex-1 flex-col">
                    <span className="text-[15px] font-bold">{s.name}</span>
                    <span className="text-xs text-dim">{s.category}</span>
                  </span>
                  <span className="text-[15px] font-bold tabular-nums">{cop(s.amount)}</span>
                </li>
              ))}
            </ul>
          )}
          <div className="mt-auto flex items-center justify-between border-t border-line pt-4 text-sm">
            <span className="text-dim">
              {t.monthTotal} · {DEMO_SUBS.length} {t.charges}
            </span>
            <b className="tabular-nums">{cop(monthlyTotal(DEMO_SUBS))}</b>
          </div>
        </div>
      </Reveal>
    </section>
  );
}
