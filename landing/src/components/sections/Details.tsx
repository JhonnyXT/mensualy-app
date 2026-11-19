import { Archive, CalendarSync, Coins, FileDown, Fingerprint, Repeat, SunMoon, UserX, WifiOff, type LucideIcon } from 'lucide-react';
import type { Dictionary } from '@/i18n/config';
import { Reveal } from '../Reveal';

type Key = keyof Dictionary['details']['items'];
const ICONS: Record<Key, LucideIcon> = {
  offline: WifiOff,
  currency: Coins,
  auto: CalendarSync,
  cycles: Repeat,
  biometric: Fingerprint,
  theme: SunMoon,
  export: FileDown,
  cancel: Archive,
  noAccount: UserX,
};

export function Details({ t }: { t: Dictionary['details'] }) {
  return (
    <section id="detalles" className="flex w-full max-w-[1000px] scroll-mt-16 flex-col gap-8 px-5 py-16 sm:gap-12 sm:py-28">
      <Reveal as="h2" className="text-[31px] font-extrabold tracking-[-0.03em] sm:text-[44px]">
        {t.title}
      </Reveal>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {(Object.keys(ICONS) as Key[]).map((key, i) => {
          const Icon = ICONS[key];
          const item = t.items[key];
          return (
            <Reveal
              key={key}
              delay={(i % 3) * 80}
              className="group flex items-start gap-3.5 rounded-[20px] border border-line bg-card p-5 transition-all duration-300 hover:-translate-y-1 hover:border-violet/40 hover:bg-surface"
            >
              <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-surface-2 text-dim transition-colors duration-300 group-hover:bg-violet/15 group-hover:text-accent">
                <Icon size={18} aria-hidden />
              </span>
              <span className="flex flex-col gap-1">
                <h3 className="text-[15px] font-bold">{item.t}</h3>
                <p className="text-sm leading-snug text-dim">{item.d}</p>
              </span>
            </Reveal>
          );
        })}
      </div>
    </section>
  );
}
