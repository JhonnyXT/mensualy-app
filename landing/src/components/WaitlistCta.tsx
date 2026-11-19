import { ArrowUpRight } from 'lucide-react';
import type { Dictionary, Locale } from '@/i18n/config';

// La lista de espera vive en joblan (joblanstudio.com), el estudio donde están
// todas las apps: llega con `?app=mensualy` y guarda en el topic de Mensualy.
const JOBLAN_URL = process.env.NEXT_PUBLIC_JOBLAN_URL || 'https://joblanstudio.com';

export function waitlistHref(locale: Locale) {
  return `${JOBLAN_URL}/${locale}?app=mensualy#avisame`;
}

export function WaitlistCta({ t, locale, note, className = '' }: { t: Dictionary['waitlist']; locale: Locale; note?: string; className?: string }) {
  return (
    <div className={`flex w-full max-w-[480px] flex-col items-center gap-4 ${className}`}>
      <p className="text-[13px] font-semibold text-dim">{t.label}</p>
      <a
        href={waitlistHref(locale)}
        className="group flex min-h-[52px] w-full items-center justify-center gap-2 rounded-[14px] bg-btn px-6 text-[15px] font-bold whitespace-nowrap text-white shadow-[0_10px_30px_-8px_rgba(124,107,255,0.65)] transition-all duration-300 hover:-translate-y-0.5 hover:bg-btn-hover hover:shadow-[0_16px_40px_-8px_rgba(124,107,255,0.8)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent sm:w-auto sm:rounded-full"
      >
        {t.submit}
        <ArrowUpRight size={17} strokeWidth={2.5} className="transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" aria-hidden />
      </a>
      {note && <p className="text-center text-xs text-faint sm:text-[13px]">{note}</p>}
    </div>
  );
}
