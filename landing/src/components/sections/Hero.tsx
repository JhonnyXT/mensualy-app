import Image from 'next/image';
import type { Dictionary, Locale } from '@/i18n/config';
import { Reveal } from '../Reveal';
import { WaitlistCta } from '../WaitlistCta';
import { Eyebrow } from './shared';

export function Hero({ t, locale }: { t: Dictionary; locale: Locale }) {
  return (
    <section id="top" className="relative flex w-full scroll-mt-20 flex-col items-center px-5 pt-12 text-center sm:pt-20">
      {/* Brillo violeta de la app (mismo glow del dashboard), respirando muy lento. */}
      <div
        aria-hidden
        className="glow-breathe pointer-events-none absolute top-0 left-1/2 -z-10 -translate-x-1/2 h-[420px] w-[760px] max-w-[140vw] rounded-full bg-[radial-gradient(ellipse_at_center,rgba(124,107,255,0.30)_0%,rgba(124,107,255,0.10)_42%,rgba(124,107,255,0)_70%)] sm:h-[560px] sm:w-[1000px]"
      />
      <Reveal className="relative mb-6 sm:mb-8">
        <div aria-hidden className="absolute -inset-8 rounded-full bg-[radial-gradient(circle,rgba(124,107,255,0.45)_0%,rgba(124,107,255,0)_65%)]" />
        <Image src="/img/mensualy-mark.png" alt={t.hero.iconAlt} width={112} height={112} priority className="relative size-[84px] sm:size-28" />
      </Reveal>
      <Reveal delay={80}>
        <Eyebrow>{t.hero.eyebrow}</Eyebrow>
      </Reveal>
      <Reveal delay={140} as="h1" className="mt-4 text-[50px] leading-[1.04] font-extrabold tracking-[-0.035em] sm:text-[92px] sm:leading-[1.02]">
        {t.hero.title1}
        <br />
        <span className="bg-gradient-to-b from-[#8f8f9a] to-[#56565f] bg-clip-text text-transparent">{t.hero.title2}</span>
      </Reveal>
      <Reveal delay={220} as="p" className="mt-5 max-w-[600px] text-[17px] leading-relaxed text-pretty text-dim sm:mt-7 sm:text-xl">
        {t.hero.subtitle}
      </Reveal>
      <Reveal delay={300} className="mt-7 flex w-full justify-center sm:mt-9">
        <div id="avisame" className="flex w-full scroll-mt-28 justify-center">
          <WaitlistCta t={t.waitlist} locale={locale} />
        </div>
      </Reveal>
      <Reveal delay={360} as="p" className="mt-3 text-[13px] leading-normal text-faint sm:text-sm">
        {t.hero.finePrint}
        {' · '}
        <a href="#privacidad" className="text-dim underline decoration-line underline-offset-4 transition-colors hover:text-ink">
          {t.hero.privacyLink}
        </a>
      </Reveal>
    </section>
  );
}
