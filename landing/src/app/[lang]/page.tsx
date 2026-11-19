import { notFound } from 'next/navigation';
import { Header } from '@/components/Header';
import { CalendarSection } from '@/components/sections/CalendarSection';
import { Catalog } from '@/components/sections/Catalog';
import { Details } from '@/components/sections/Details';
import { FinalCta } from '@/components/sections/FinalCta';
import { Footer } from '@/components/sections/Footer';
import { Hero } from '@/components/sections/Hero';
import { Privacy } from '@/components/sections/Privacy';
import { Reminders } from '@/components/sections/Reminders';
import { Savings } from '@/components/sections/Savings';
import { Sharing } from '@/components/sections/Sharing';
import { DemoSection } from '@/demo/DemoSection';
import { Divider } from '@/components/sections/shared';
import { getDictionary, hasLocale } from '@/i18n/config';

export default async function Home({ params }: PageProps<'/[lang]'>) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  const t = getDictionary(lang);

  return (
    <>
      <Header t={t.nav} locale={lang} />
      <main className="flex flex-col items-center overflow-x-clip pb-8">
        <Hero t={t} locale={lang} />
        <DemoSection t={t.demo} />
        <Divider />
        <Catalog t={t.catalog} />
        <Divider />
        <Reminders t={t.reminders} />
        <Divider />
        <CalendarSection t={t.calendar} />
        <Divider />
        <Savings t={t.savings} />
        <Divider />
        <Sharing t={t.sharing} />
        <Divider />
        <Details t={t.details} />
        <Privacy t={t.privacy} policyLabel={t.footer.privacy} locale={lang} />
        <FinalCta t={t} locale={lang} />
        <Footer t={t.footer} locale={lang} />
      </main>
    </>
  );
}
