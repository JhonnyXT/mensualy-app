import Image from 'next/image';
import type { Dictionary, Locale } from '@/i18n/config';
import { LangToggle } from './LangToggle';

/** Barra superior fija: logo, accesos a secciones, idioma y "Avísame". */
export function Header({ t, locale }: { t: Dictionary['nav']; locale: Locale }) {
  const link = 'hidden text-sm font-semibold text-dim transition-colors hover:text-ink md:inline';
  return (
    <header className="sticky top-0 z-50 w-full border-b border-line/60 bg-bg/75 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-[1200px] items-center justify-between gap-4 px-5">
        <a href="#top" className="flex items-center gap-2.5 text-[17px] font-extrabold tracking-[-0.02em]">
          <Image src="/img/mensualy-mark.png" alt="" width={30} height={30} className="size-[30px]" priority />
          Mensualy
        </a>
        <nav aria-label={t.label} className="flex items-center gap-5 sm:gap-7">
          <a href="#demo" className={link}>
            {t.demo}
          </a>
          <a href="#funciones" className={link}>
            {t.features}
          </a>
          <a href="#privacidad" className={link}>
            {t.privacy}
          </a>
          <LangToggle current={locale} label={t.language} />
          <a href="#avisame" className="flex h-10 items-center rounded-full bg-btn px-4 text-sm font-bold whitespace-nowrap text-white transition-colors hover:bg-btn-hover">
            {t.notify}
          </a>
        </nav>
      </div>
    </header>
  );
}
