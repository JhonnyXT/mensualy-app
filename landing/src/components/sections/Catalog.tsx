import { Check, Plus, Search } from 'lucide-react';
import type { Dictionary } from '@/i18n/config';
import { CATALOG_ROWS, cop, SERVICES } from '@/content/app';
import { Reveal } from '../Reveal';
import { ServiceBadge } from '../ServiceBadge';
import { InlineChip, SectionHead } from './shared';

function LogoRow({ keys, reverse = false }: { keys: string[]; reverse?: boolean }) {
  // La fila va duplicada para que el loop de `marquee` (-50%) no tenga corte.
  const items = [...keys, ...keys];
  return (
    <div className="flex overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_12%,black_88%,transparent)]">
      <ul className={`flex shrink-0 gap-3 pr-3 sm:gap-4 sm:pr-4 ${reverse ? 'marquee-reverse' : 'marquee'}`}>
        {items.map((key, i) => (
          <li key={`${key}-${i}`} aria-hidden={i >= keys.length} className="flex items-center gap-2.5 rounded-2xl border border-line bg-card py-2 pr-4 pl-2">
            <ServiceBadge service={key} size={36} />
            <span className="text-sm font-semibold whitespace-nowrap">{SERVICES[key].name}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function Catalog({ t }: { t: Dictionary['catalog'] }) {
  return (
    <section id="funciones" className="flex w-full scroll-mt-16 flex-col items-center gap-10 py-16 sm:gap-14 sm:py-28">
      <div className="px-5">
        <SectionHead
          eyebrow={t.eyebrow}
          title={
            <>
              {t.titleA}
              <InlineChip>
                <span className="text-[26px] font-extrabold text-accent sm:text-[40px]">{t.chip}</span>
              </InlineChip>
              {t.titleB}
            </>
          }
          subtitle={t.subtitle}
        />
      </div>

      <Reveal className="marquee-pause flex w-full flex-col gap-3 sm:gap-4">
        <LogoRow keys={CATALOG_ROWS[0]} />
        <LogoRow keys={CATALOG_ROWS[1]} reverse />
      </Reveal>

      <div className="grid w-full max-w-[1000px] grid-cols-1 gap-4 px-5 md:grid-cols-[1.1fr_1fr] md:gap-5">
        {/* Buscador sin resultados → servicio local, como en NewSubscriptionSheet. */}
        <Reveal className="flex flex-col justify-center gap-3 rounded-[22px] border border-line bg-card p-5 sm:p-7">
          <span className="flex items-center gap-2.5 rounded-xl border border-line bg-surface px-3.5 py-2.5 text-sm">
            <Search size={17} className="text-dim" aria-hidden />
            <span className="font-medium">{t.localExample}</span>
            <span className="h-4 w-px animate-pulse bg-accent" aria-hidden />
          </span>
          <span className="flex items-center gap-3 rounded-2xl border border-line bg-surface p-3.5">
            <ServiceBadge service="gym" size={40} />
            <span className="flex flex-1 flex-col">
              <span className="text-sm font-semibold">{t.localTitle}</span>
              <span className="text-xs text-dim">{t.localBody}</span>
            </span>
            <Plus size={22} className="rounded-full bg-violet p-1 text-white" aria-hidden />
          </span>
          <span className="flex items-center gap-3 rounded-2xl border border-ok/30 bg-ok/8 p-3.5">
            <ServiceBadge service="gym" size={40} />
            <span className="flex flex-1 flex-col">
              <span className="text-sm font-semibold">{t.localExample}</span>
              <span className="text-xs text-dim">{cop(45000)}/mes</span>
            </span>
            <span className="flex items-center gap-1 text-xs font-bold text-ok">
              <Check size={14} strokeWidth={3} aria-hidden />
              {t.localAdded}
            </span>
          </span>
        </Reveal>

        <Reveal delay={120} as="ol" className="flex flex-col justify-center gap-5 rounded-[22px] border border-line bg-card p-5 sm:p-7">
          {t.steps.map((step, i) => (
            <li key={step.t} className="flex items-start gap-3.5">
              <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-violet/15 font-mono text-xs font-bold text-accent">{i + 1}</span>
              <span className="flex flex-col gap-0.5">
                <span className="flex items-center gap-1.5 text-[15px] font-bold">
                  {step.t}
                  <Check size={14} className="text-ok" aria-hidden />
                </span>
                <span className="text-sm leading-snug text-dim">{step.d}</span>
              </span>
            </li>
          ))}
        </Reveal>
      </div>
    </section>
  );
}
