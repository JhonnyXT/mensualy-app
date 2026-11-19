import { Ban, BellRing, Check, Database, KeyRound, UserX, type LucideIcon } from 'lucide-react';
import Link from 'next/link';
import type { Dictionary, Locale } from '@/i18n/config';
import { Reveal } from '../Reveal';
import { SectionHead } from './shared';

type DataKey = keyof Dictionary['privacy']['data']['items'];
const DATA_ICONS: Record<DataKey, LucideIcon> = {
  local: Database,
  noAccount: UserX,
  noPayments: Ban,
  notifications: BellRing,
  export: KeyRound,
};

export function Privacy({ t, policyLabel, locale }: { t: Dictionary['privacy']; policyLabel: string; locale: Locale }) {
  return (
    <section id="privacidad" className="flex w-full max-w-[860px] scroll-mt-16 flex-col items-center gap-10 px-5 py-16 sm:gap-14 sm:py-28">
      <SectionHead
        title={
          <>
            {t.title}
            <br />
            <span className="text-mute">{t.titleB}</span>
          </>
        }
        subtitle={t.subtitle}
      />
      <div className="grid w-full grid-cols-1 gap-4 md:grid-cols-2 md:gap-5">
        <Reveal className="flex flex-col gap-3 rounded-[22px] border border-line bg-card p-6 sm:gap-4 sm:p-8">
          <span className="text-[17px] font-bold">{t.free.name}</span>
          <span className="text-[46px] leading-none font-extrabold tracking-[-0.03em]">{t.free.price}</span>
          <span className="text-sm text-faint">{t.free.per}</span>
          <ul className="mt-2 flex flex-col gap-3">
            {t.free.items.map((item) => (
              <li key={item} className="flex items-center gap-2.5 text-[15px]">
                <Check size={16} className="shrink-0 text-ok" aria-hidden />
                {item}
              </li>
            ))}
          </ul>
        </Reveal>
        <Reveal delay={120} className="relative flex flex-col gap-3 overflow-hidden rounded-[22px] border border-violet/50 bg-card p-6 sm:gap-4 sm:p-8">
          <div aria-hidden className="pointer-events-none absolute -top-24 -right-20 size-56 rounded-full bg-violet/20 blur-3xl" />
          <span className="relative flex items-center justify-between">
            <span className="text-[17px] font-bold text-accent">{t.data.name}</span>
            <span className="rounded-full bg-violet/15 px-2.5 py-1 font-mono text-[11px] font-bold text-accent uppercase">{t.data.tag}</span>
          </span>
          <ul className="relative mt-1 flex flex-col gap-3.5">
            {(Object.keys(DATA_ICONS) as DataKey[]).map((key) => {
              const Icon = DATA_ICONS[key];
              const item = t.data.items[key];
              return (
                <li key={key} className="flex items-start gap-2.5 text-[15px] leading-[1.45]">
                  <Icon size={16} className="mt-0.5 shrink-0 text-accent" aria-hidden />
                  <span>
                    <b className="font-bold">{item.t}.</b> <span className="text-dim">{item.d}</span>
                  </span>
                </li>
              );
            })}
          </ul>
          <Link href={`/${locale}/privacy`} className="relative mt-1 text-sm text-dim underline decoration-line underline-offset-4 hover:text-ink">
            {policyLabel}
          </Link>
        </Reveal>
      </div>
    </section>
  );
}
