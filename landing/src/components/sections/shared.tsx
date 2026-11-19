import type { ReactNode } from 'react';
import { Reveal } from '../Reveal';

/** Ícono o texto encajado dentro de un título ("Más de [50] servicios"). */
export function InlineChip({ children }: { children: ReactNode }) {
  return (
    <span className="mx-1 inline-flex h-[38px] items-center rounded-[10px] border border-line bg-surface-2 px-2.5 align-middle sm:mx-1.5 sm:h-14 sm:rounded-[14px] sm:px-3.5">
      {children}
    </span>
  );
}

export function Eyebrow({ children }: { children: ReactNode }) {
  return <span className="font-mono text-[12px] font-bold tracking-[0.14em] text-accent uppercase sm:text-[13px]">{children}</span>;
}

export function SectionHead({ eyebrow, title, subtitle }: { eyebrow?: string; title: ReactNode; subtitle: string }) {
  return (
    <Reveal className="flex flex-col items-center gap-3 text-center sm:gap-4">
      {eyebrow && <Eyebrow>{eyebrow}</Eyebrow>}
      <h2 className="text-[31px] leading-[1.2] font-extrabold tracking-[-0.03em] text-balance sm:text-[48px] sm:leading-[1.12]">{title}</h2>
      <p className="max-w-[560px] text-base leading-relaxed text-pretty text-dim sm:text-lg">{subtitle}</p>
    </Reveal>
  );
}

export function Divider() {
  return <div className="h-px w-[calc(100%-40px)] max-w-[760px] bg-gradient-to-r from-transparent via-line to-transparent" />;
}

/** Nota "escrita a mano" con flecha curva, como las de Meld y MyWallet. `flip` voltea la flecha. */
export function HandNote({ children, className = '', flip = false }: { children: ReactNode; className?: string; flip?: boolean }) {
  return (
    <span className={`flex flex-col gap-1 ${className}`}>
      <span className="-rotate-3 font-hand text-[23px] leading-[1.15] text-dim">{children}</span>
      <svg width="70" height="36" viewBox="0 0 70 36" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" className={`text-faint ${flip ? 'self-end -scale-x-100' : ''}`} aria-hidden>
        <path d="M64 4 C 50 26, 30 30, 6 28" />
        <polyline points="14 22 6 28 14 33" />
      </svg>
    </span>
  );
}

/** Tarjeta base del sitio. */
export function Card({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <div className={`rounded-[22px] border border-line bg-card ${className}`}>{children}</div>;
}
