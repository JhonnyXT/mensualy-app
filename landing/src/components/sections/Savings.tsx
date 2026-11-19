import { Hourglass, Layers, Moon, TrendingUp, TriangleAlert, type LucideIcon } from 'lucide-react';
import type { Dictionary } from '@/i18n/config';
import { StackedCards } from '../StackedCards';
import { ServiceBadge } from '../ServiceBadge';
import { SectionHead } from './shared';

// Mismo ícono y color que cada señal en el dashboard de la app.
const SIGNALS: { icon: LucideIcon; color: string; service: string }[] = [
  { icon: Moon, color: '#7C6BFF', service: 'disney_plus' },
  { icon: TrendingUp, color: '#FF6259', service: 'spotify' },
  { icon: Hourglass, color: '#F59E0B', service: 'hbo_max' },
  { icon: Layers, color: '#7C6BFF', service: 'netflix' },
  { icon: TriangleAlert, color: '#FF6259', service: 'chatgpt' },
];

export function Savings({ t }: { t: Dictionary['savings'] }) {
  return (
    <section id="ahorro" className="flex w-full max-w-[760px] scroll-mt-16 flex-col items-center gap-10 px-5 py-16 sm:gap-14 sm:py-28">
      <SectionHead eyebrow={t.eyebrow} title={t.title} subtitle={t.subtitle} />
      <StackedCards top={96}>
        {t.cards.map((card, i) => {
          const { icon: Icon, color, service } = SIGNALS[i];
          return (
            <article key={card.t} className="flex w-full max-w-[640px] flex-col gap-5 rounded-[26px] border border-line bg-card p-6 shadow-[0_-10px_40px_rgba(0,0,0,0.45)] sm:flex-row sm:items-center sm:gap-6 sm:p-8">
              <span className="flex size-14 shrink-0 items-center justify-center rounded-2xl" style={{ background: `${color}1f`, border: `1px solid ${color}4d`, color }}>
                <Icon size={26} aria-hidden />
              </span>
              <span className="flex flex-1 flex-col gap-1.5">
                <span className="font-mono text-[11px] font-bold tracking-[0.12em] text-faint uppercase">0{i + 1}</span>
                <h3 className="text-xl font-extrabold tracking-[-0.02em] sm:text-2xl">{card.t}</h3>
                <p className="text-[15px] leading-relaxed text-dim">{card.d}</p>
              </span>
              <span className="flex items-center gap-2.5 self-start rounded-full border border-line bg-surface py-1.5 pr-3.5 pl-1.5 sm:self-center">
                <ServiceBadge service={service} size={26} />
                <span className="text-xs font-semibold whitespace-nowrap">{card.example}</span>
              </span>
            </article>
          );
        })}
      </StackedCards>
    </section>
  );
}
