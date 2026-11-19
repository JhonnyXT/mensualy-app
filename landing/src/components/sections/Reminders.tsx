import { BellRing, MousePointerClick, Smartphone } from 'lucide-react';
import type { Dictionary } from '@/i18n/config';
import { Reveal } from '../Reveal';
import { SectionHead } from './shared';
import { ReminderNotification } from '../ReminderNotification';

// Textos reales de `rescheduleAllReminders` (la app está en español).
const NOTIFS = [
  { title: 'Netflix se cobra pronto', body: 'Se renueva en 2 días por $ 26.900.', time: 'ahora', delay: '0s' },
  { title: 'Spotify se cobra hoy', body: 'Hoy se renueva por $ 18.500.', time: '9:00', delay: '-1.5s' },
  { title: 'ChatGPT Plus se cobra pronto', body: 'Se renueva en 1 día por $ 80.000.', time: 'ayer', delay: '-3s' },
];

export function Reminders({ t }: { t: Dictionary['reminders'] }) {
  return (
    <section id="recordatorios" className="flex w-full max-w-[1000px] scroll-mt-16 flex-col items-center gap-10 px-5 py-16 sm:gap-14 sm:py-28">
      <SectionHead eyebrow={t.eyebrow} title={t.title} subtitle={t.subtitle} />

      <div className="grid w-full grid-cols-1 items-center gap-6 md:grid-cols-2 md:gap-10">
        <Reveal className="flex flex-col gap-3.5">
          {NOTIFS.map((n, i) => (
            <div key={n.title} className="notif-hop" style={{ animationDelay: n.delay, opacity: 1 - i * 0.22 }}>
              <ReminderNotification title={n.title} body={n.body} time={n.time} />
            </div>
          ))}
        </Reveal>

        <Reveal delay={120} className="flex flex-col gap-4">
          <div className="rounded-[22px] border border-line bg-card p-5 sm:p-6">
            <span className="flex items-center gap-2 text-[15px] font-bold">
              <BellRing size={17} className="text-warn" aria-hidden />
              {t.optionsTitle}
            </span>
            <ul className="mt-4 grid grid-cols-2 gap-2">
              {t.options.map((o, i) => (
                <li
                  key={o}
                  className={`rounded-full px-3.5 py-2 text-center text-[13px] font-semibold transition-colors ${i === 2 ? 'bg-violet text-white shadow-[0_6px_20px_-6px_rgba(124,107,255,0.8)]' : 'bg-surface-2 text-ink'}`}
                >
                  {o}
                </li>
              ))}
            </ul>
          </div>
          <div className="flex items-start gap-3.5 rounded-[22px] border border-line bg-card p-5 sm:p-6">
            <span className="relative flex size-10 shrink-0 items-center justify-center rounded-xl bg-surface-2">
              <span aria-hidden className="ping-soft absolute inset-0 rounded-xl bg-violet/40" />
              <MousePointerClick size={18} className="relative text-accent" aria-hidden />
            </span>
            <span className="flex flex-col gap-1">
              <span className="text-[15px] font-bold">{t.tapTitle}</span>
              <span className="text-sm leading-snug text-dim">{t.tapBody}</span>
            </span>
          </div>
          <p className="flex items-center gap-2 pl-1 text-[13px] text-faint">
            <Smartphone size={15} aria-hidden />
            {t.localNote}
          </p>
        </Reveal>
      </div>
    </section>
  );
}
