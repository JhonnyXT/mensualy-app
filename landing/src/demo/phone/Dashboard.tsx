// Réplica del dashboard de la app (`src/app/(tabs)/dashboard.tsx` +
// `FloatingDock.tsx`) en tema oscuro, con sus medidas, colores y textos. Si
// cambia el diseño en la app, actualizar esto.

import type { ReactNode } from 'react';
import { Battery, Calendar, CreditCard, Hourglass, Layers, LayoutGrid, Moon, PiggyBank, Plus, Signal, TrendingUp, TriangleAlert, Users, Wifi, X, type LucideIcon } from 'lucide-react';
import { ServiceBadge } from '@/components/ServiceBadge';
import { cop, CYCLE_SUFFIX, monthlyOf, monthlyTotal, sharedSavings, type DemoSub } from '@/content/app';
import type { Suggestion, SuggestionKind } from '../suggestions';

export const D = {
  bg: '#0D0D12',
  card: '#1B1B22',
  cardBorder: '#2A2A35',
  iconBg: '#252530',
  dockBg: '#181820',
  dockBorder: '#2E2E3C',
  dockActiveBg: '#252532',
  text: '#F5F5F7',
  text2: '#9A9AA2',
  violet: '#7C6BFF',
  violetSoft: 'rgba(124,107,255,0.15)',
  violetSoftBorder: 'rgba(124,107,255,0.3)',
  green: '#34C77A',
  red: '#FF6259',
  amber: '#F59E0B',
};

const MAX_BADGES = 3;
const MAX_PROXIMAS = 4;

function MiniBadges({ subs }: { subs: DemoSub[] }) {
  const visibles = subs.slice(0, MAX_BADGES);
  const rest = subs.length - visibles.length;
  return (
    <span className="inline-flex items-center gap-1">
      {visibles.map((s) => (
        <span key={s.id} className="overflow-hidden rounded-full">
          <ServiceBadge service={s.service} name={s.name} size={18} />
        </span>
      ))}
      {rest > 0 && (
        <span className="flex h-4 items-center rounded-full px-1.5 text-[9px] font-bold" style={{ background: D.cardBorder }}>
          +{rest}
        </span>
      )}
    </span>
  );
}

function MetricCard({ icon, iconColor, label, title, amount, suffix, subtitle }: { icon: ReactNode; iconColor: string; label: string; title: string; amount: string; suffix?: string; subtitle?: string }) {
  return (
    <span className="flex w-full items-center justify-between rounded-2xl p-3.5" style={{ background: D.card, border: `1px solid ${D.cardBorder}` }}>
      <span className="flex min-w-0 flex-1 items-center gap-3">
        <span className="flex size-11 shrink-0 items-center justify-center rounded-xl" style={{ background: D.iconBg, border: '1px solid rgba(255,255,255,0.05)', color: iconColor }}>
          {icon}
        </span>
        <span className="flex min-w-0 flex-col">
          <span className="text-[12px] leading-tight font-medium" style={{ color: D.text2 }}>
            {label}
          </span>
          <span className="truncate text-[15px] leading-snug font-bold">{title}</span>
        </span>
      </span>
      <span className="flex flex-col items-end">
        <span className="text-[15px] font-bold">
          {amount}
          {suffix && <span className="text-[12px] font-normal" style={{ color: D.text2 }}> {suffix}</span>}
        </span>
        {subtitle && (
          <span className="mt-0.5 text-[12px] font-medium" style={{ color: D.text2 }}>
            {subtitle}
          </span>
        )}
      </span>
    </span>
  );
}

export function StatusBar() {
  return (
    <div aria-hidden className="absolute inset-x-0 top-0 z-40 flex h-11 items-start justify-between px-7 pt-2.5 text-[13px] font-semibold" style={{ background: `linear-gradient(to bottom, ${D.bg} 55%, transparent)` }}>
      <span>9:41</span>
      <span className="flex items-center gap-1.5">
        <Signal size={14} strokeWidth={2.4} />
        <Wifi size={14} strokeWidth={2.4} />
        <Battery size={17} strokeWidth={2} />
      </span>
    </div>
  );
}

export function FloatingDock({ onAdd }: { onAdd?: () => void }) {
  return (
    <div className="pointer-events-none absolute inset-x-0 bottom-0 z-30 flex justify-center pb-7">
      <div className="pointer-events-auto flex items-center gap-2 rounded-full px-2 py-1.5" style={{ background: D.dockBg, border: `1px solid ${D.dockBorder}`, boxShadow: '0 12px 36px rgba(0,0,0,0.55)' }}>
        <span className="flex h-11 items-center rounded-full px-4" style={{ background: D.dockActiveBg, border: `1px solid ${D.dockBorder}` }}>
          <LayoutGrid size={16} />
        </span>
        <button
          type="button"
          onClick={onAdd}
          aria-label="Agregar suscripción"
          className="flex size-11 cursor-pointer items-center justify-center rounded-full text-white transition-transform active:scale-90"
          style={{ background: D.violet, boxShadow: '0 0 18px rgba(124,107,255,0.4)' }}
        >
          <Plus size={20} strokeWidth={2.6} />
        </button>
        <span className="flex h-11 items-center rounded-full px-4" style={{ color: D.text2 }}>
          <CreditCard size={16} />
        </span>
      </div>
    </div>
  );
}

const SUGGESTION_STYLE: Record<SuggestionKind, { icon: LucideIcon; color: string; bg: string; border: string }> = {
  zombie: { icon: Moon, color: D.violet, bg: D.violetSoft, border: D.violetSoftBorder },
  early: { icon: Hourglass, color: D.amber, bg: 'rgba(245,158,11,0.15)', border: 'rgba(245,158,11,0.3)' },
  duplicate: { icon: Layers, color: D.violet, bg: D.violetSoft, border: D.violetSoftBorder },
  outsized: { icon: TriangleAlert, color: D.red, bg: 'rgba(255,98,89,0.12)', border: 'rgba(255,98,89,0.25)' },
  share: { icon: PiggyBank, color: D.amber, bg: 'rgba(245,158,11,0.15)', border: 'rgba(245,158,11,0.3)' },
};

const tap = 'cursor-pointer text-left transition-transform duration-150 active:scale-[0.98]';

export function Dashboard({
  subs,
  suggestions = [],
  userName = 'Ana',
  onOpen,
  onAdd,
  onDismiss,
}: {
  subs: DemoSub[];
  suggestions?: Suggestion[];
  userName?: string;
  onOpen?: (id: string) => void;
  onAdd?: () => void;
  onDismiss?: (id: string) => void;
}) {
  const mensual = monthlyTotal(subs);
  const compartidas = subs.filter((s) => s.shared);
  const ahorro = sharedSavings(subs);
  const mayor = subs.reduce<DemoSub | null>((max, s) => (!max || monthlyOf(s) > monthlyOf(max) ? s : max), null);
  const porCategoria = new Map<string, { total: number; count: number }>();
  for (const s of subs) {
    const c = porCategoria.get(s.category) ?? { total: 0, count: 0 };
    porCategoria.set(s.category, { total: c.total + monthlyOf(s), count: c.count + 1 });
  }
  const [catTop, catData] = [...porCategoria.entries()].sort((a, b) => b[1].total - a[1].total)[0] ?? [];
  const proximas = [...subs].sort((a, b) => a.inDays - b.inDays).slice(0, MAX_PROXIMAS);

  return (
    <div className="relative h-full w-full overflow-hidden text-[#F5F5F7]" style={{ background: D.bg }}>
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'radial-gradient(48% 40% at 8% -6%, rgba(124,107,255,0.32) 0%, rgba(124,107,255,0.13) 45%, rgba(124,107,255,0) 100%), radial-gradient(40% 30% at 96% 8%, rgba(124,107,255,0.2) 0%, rgba(124,107,255,0) 70%)',
        }}
      />
      <StatusBar />
      <div className="relative h-full overflow-y-auto overscroll-contain px-6 pt-12 pb-32 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <div className="mb-5 flex items-center justify-between">
          <span className="text-[20px] font-extrabold tracking-tight">Hola, {userName}.</span>
          <span className="flex size-12 items-center justify-center rounded-full text-sm font-extrabold" style={{ background: 'rgba(254,205,211,0.15)', border: '2px solid rgba(255,255,255,0.1)' }}>
            {userName.slice(0, 2).toUpperCase()}
          </span>
        </div>

        {subs.length === 0 ? (
          <div className="flex flex-col items-center gap-3 pt-24 text-center">
            <span className="flex size-16 items-center justify-center rounded-full" style={{ background: D.violetSoft, color: D.violet }}>
              <CreditCard size={28} />
            </span>
            <span className="text-[17px] font-bold">Aún no tienes suscripciones</span>
            <span className="max-w-[260px] text-[13px]" style={{ color: D.text2 }}>
              Agrega la primera con el botón de abajo para empezar a ver tu resumen.
            </span>
          </div>
        ) : (
          <>
            <div className="mb-6 flex flex-col gap-4">
              <div>
                <span className="text-[13px] font-medium tracking-tight" style={{ color: D.text2 }}>
                  Al mes gastas
                </span>
                <div key={mensual} className="mt-0.5 animate-[fade-up_0.4s_ease-out] text-[34px] leading-none font-extrabold tracking-tight tabular-nums">
                  {cop(mensual)}
                </div>
              </div>
              <div>
                <span className="text-[13px] font-medium tracking-tight" style={{ color: D.text2 }}>
                  Eso al año es
                </span>
                <div key={mensual} className="mt-0.5 animate-[fade-up_0.4s_ease-out] text-[34px] leading-none font-extrabold tracking-tight tabular-nums">
                  {cop(mensual * 12)}
                </div>
              </div>
            </div>

            <div className="mb-6 flex flex-col gap-[9px] text-[14px] font-semibold">
              <span className="flex flex-wrap items-center gap-1.5">
                Tienes {subs.length} <MiniBadges subs={subs} /> suscripciones.
              </span>
              {compartidas.length > 0 && (
                <span className="flex flex-wrap items-center gap-1.5">
                  Compartes {compartidas.length} <MiniBadges subs={compartidas} /> suscripciones.
                </span>
              )}
              {ahorro > 0 && <span className="pt-0.5 font-bold">Reduces {cop(ahorro)} tu gasto al mes.</span>}
            </div>

            <div className="mb-7 flex flex-col gap-2.5">
              {mayor && (
                <button type="button" onClick={() => onOpen?.(mayor.id)} className={tap}>
                  <MetricCard icon={<TrendingUp size={22} />} iconColor={D.text} label="Mayor gasto" title={mayor.name} amount={cop(monthlyOf(mayor))} suffix="/mes" subtitle={mayor.category.toLowerCase()} />
                </button>
              )}
              {catTop && catData && <MetricCard icon={<LayoutGrid size={22} />} iconColor={D.violet} label="Categoría principal" title={catTop} amount={cop(catData.total)} suffix="/mes" subtitle={`${catData.count} suscr.`} />}
              {compartidas.length > 0 && <MetricCard icon={<Users size={22} />} iconColor={D.text} label="Planes compartidos" title={`${compartidas.length} ${compartidas.length === 1 ? 'plan' : 'planes'}`} amount={`${cop(ahorro)}/mes`} />}
            </div>

            <div className="mb-7">
              <div className="mb-3 flex items-center justify-between">
                <span className="text-[15px] font-extrabold tracking-tight">Próxima renovación</span>
                <Calendar size={17} color={D.text2} />
              </div>
              <div className="flex flex-col gap-3.5">
                {proximas.map((s) => (
                  <button key={s.id} type="button" onClick={() => onOpen?.(s.id)} className={`flex animate-[fade-up_0.35s_ease-out] items-center justify-between py-1 ${tap}`}>
                    <span className="flex items-center gap-3.5">
                      <ServiceBadge service={s.service} name={s.name} size={44} />
                      <span className="flex flex-col">
                        <span className="text-[15px] leading-snug font-bold">{s.name}</span>
                        <span className="text-[13px] font-medium" style={{ color: D.text2 }}>
                          {cop(s.amount)}
                          {CYCLE_SUFFIX[s.cycle]}
                        </span>
                      </span>
                    </span>
                    <span className="text-[13px] font-medium" style={{ color: D.text2 }}>
                      {s.inDays === 0 ? 'Hoy' : `En ${s.inDays} días`}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {suggestions.length > 0 && (
              <div className="flex flex-col gap-2.5">
                <div className="mb-1 flex items-center justify-between">
                  <span className="text-[15px] font-extrabold tracking-tight">Sugerencias de ahorro</span>
                  <span className="text-[12px] font-semibold" style={{ color: D.green }}>
                    {suggestions.length} {suggestions.length === 1 ? 'activa' : 'activas'}
                  </span>
                </div>
                {suggestions.map((sg) => {
                  const st = SUGGESTION_STYLE[sg.kind];
                  const Icon = st.icon;
                  return (
                    <div key={sg.sub.id} className="flex animate-[fade-up_0.35s_ease-out] items-center justify-between gap-3 rounded-2xl p-3.5" style={{ background: D.card, border: `1px solid ${D.cardBorder}` }}>
                      <button type="button" onClick={() => onOpen?.(sg.sub.id)} className={`flex min-w-0 flex-1 items-center gap-3 ${tap}`}>
                        <span className="flex size-10 shrink-0 items-center justify-center rounded-xl" style={{ background: st.bg, border: `1px solid ${st.border}`, color: st.color }}>
                          <Icon size={19} />
                        </span>
                        <span className="flex min-w-0 flex-col">
                          <span className="truncate text-[14px] leading-snug font-semibold">{sg.title}</span>
                          <span className="mt-0.5 truncate text-[13px] font-medium" style={{ color: sg.kind === 'share' ? D.green : D.text2 }}>
                            {sg.message}
                          </span>
                        </span>
                      </button>
                      <button type="button" aria-label="Descartar" onClick={() => onDismiss?.(sg.sub.id)} className="flex size-6 shrink-0 cursor-pointer items-center justify-center rounded-full hover:bg-white/5">
                        <X size={16} color={D.text2} />
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}
      </div>
      <div aria-hidden className="pointer-events-none absolute inset-x-0 bottom-0 z-20 h-36" style={{ background: `linear-gradient(to top, ${D.bg} 35%, transparent)` }} />
      <FloatingDock onAdd={onAdd} />
    </div>
  );
}
