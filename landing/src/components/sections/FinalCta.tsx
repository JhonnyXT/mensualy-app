import Image from 'next/image';
import type { Dictionary, Locale } from '@/i18n/config';
import { Reveal } from '../Reveal';
import { WaitlistCta } from '../WaitlistCta';

export function FinalCta({ t, locale }: { t: Dictionary; locale: Locale }) {
  return (
    <section className="w-full max-w-[860px] px-5 pt-6 pb-14 sm:pt-10 sm:pb-24">
      <Reveal className="relative flex flex-col items-center gap-5 overflow-hidden rounded-[28px] border border-line bg-card px-5 py-10 text-center sm:gap-6 sm:px-10 sm:py-16">
        <div aria-hidden className="pointer-events-none absolute -top-40 left-1/2 h-80 w-[600px] -translate-x-1/2 rounded-full bg-[radial-gradient(ellipse_at_center,rgba(124,107,255,0.35)_0%,rgba(124,107,255,0)_70%)]" />
        <Image src="/img/mensualy-mark.png" alt="" width={64} height={64} className="relative size-14 sm:size-16" />
        <h2 className="relative text-[30px] leading-[1.15] font-extrabold tracking-[-0.03em] sm:text-[48px] sm:leading-[1.1]">
          {t.cta.titleA}
          <br />
          <span className="text-mute">{t.cta.titleB}</span>
        </h2>
        <WaitlistCta t={t.waitlist} locale={locale} note={t.cta.note} className="relative" />
      </Reveal>
    </section>
  );
}
