'use client';

// Réplica de `SubscriptionDetailSheet.tsx` y su `CancelConfirmSheet`. "Editar
// suscripción" se muestra pero no responde en la demo.

import { Bell, Calendar, Check, CircleCheck, CreditCard, Repeat, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { ServiceBadge } from '@/components/ServiceBadge';
import { cop, CYCLE_LABEL, dateLabel, monthlyOf, type DemoSub } from '@/content/app';
import { D } from './Dashboard';
import { CloseButton, scrollArea, Sheet } from './Sheet';

const CYCLE_DAYS = { weekly: 7, monthly: 30, yearly: 365 } as const;

/** Con el fallback actual de la app: sin recordatorio propio avisa el mismo día. */
const reminderLabel = (days: number | null) => (days === null ? 'El mismo día' : days === 0 ? 'El mismo día' : `${days} día${days === 1 ? '' : 's'} antes`);

export function DetailSheet({ sub, zombie, onClose, onMarkUsed, onCancel }: { sub: DemoSub; zombie: boolean; onClose: () => void; onMarkUsed: () => void; onCancel: () => void }) {
  // "idle" → "confirmed" (pill verde ~1.4 s) → "hidden": la tarjeta se va
  // después de mostrar la confirmación, como `markState` en la app.
  const [mark, setMark] = useState<'idle' | 'confirmed' | 'hidden'>('idle');
  useEffect(() => {
    if (mark !== 'confirmed') return;
    const id = setTimeout(() => setMark('hidden'), 1400);
    return () => clearTimeout(id);
  }, [mark]);

  const monthly = monthlyOf(sub);
  const progress = Math.min(1, Math.max(0, 1 - sub.inDays / CYCLE_DAYS[sub.cycle]));
  const rows = [
    { icon: Calendar, label: 'Siguiente cobro', value: dateLabel(sub.inDays) },
    { icon: CreditCard, label: 'Importe del cobro', value: cop(sub.amount) },
    { icon: Repeat, label: 'Frecuencia de cobro', value: CYCLE_LABEL[sub.cycle], bold: true },
  ];
  const mine = sub.shared ? Math.round((sub.amount * sub.shared.percent) / 100) : 0;

  return (
    <Sheet onClose={onClose} maxHeight="92%">
      <div className={`${scrollArea} px-5 pt-3 pb-10`}>
        <div className="flex justify-end">
          <CloseButton onClick={onClose} />
        </div>
        <div className="mt-3 flex flex-col items-center">
          <ServiceBadge service={sub.service} name={sub.name} size={64} />
          <span className="mt-3 text-xl font-bold">{sub.name}</span>
          <span className="mt-2 flex items-center rounded-full px-3 py-1" style={{ background: 'rgba(52,199,122,0.1)', border: '1px solid rgba(52,199,122,0.2)' }}>
            <span className="mr-1.5 size-1.5 rounded-full" style={{ background: D.green }} />
            <span className="text-xs font-semibold" style={{ color: D.green }}>
              Activa
            </span>
          </span>
        </div>

        <div className="mt-7 flex py-2" style={{ borderBottom: `1px solid ${D.cardBorder}` }}>
          <div className="flex-1 pl-0.5">
            <div className="text-[20px] leading-none font-bold tabular-nums">{cop(monthly)}</div>
            <div className="mt-1.5 text-[11px] font-medium" style={{ color: D.text2 }}>
              Al mes
            </div>
          </div>
          <div className="flex-1 pl-7" style={{ borderLeft: `1px solid ${D.cardBorder}` }}>
            <div className="text-[20px] leading-none font-bold tabular-nums">{cop(monthly * 12)}</div>
            <div className="mt-1.5 text-[11px] font-medium" style={{ color: D.text2 }}>
              Anualmente
            </div>
          </div>
        </div>

        {rows.map((r, i) => (
          <div key={r.label} className="flex items-center justify-between py-3.5" style={i < rows.length - 1 ? { borderBottom: '1px solid rgba(255,255,255,0.08)' } : undefined}>
            <span className="flex items-center gap-3 text-[13px]" style={{ color: D.text2 }}>
              <r.icon size={16} />
              {r.label}
            </span>
            <span className={`text-[13px] ${r.bold ? 'font-bold' : 'font-medium'}`}>{r.value}</span>
          </div>
        ))}

        <div className="mt-4 pt-3" style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}>
          <span className="text-[10px] font-bold tracking-wider uppercase" style={{ color: D.text2 }}>
            Tiempo hasta el siguiente cobro
          </span>
          <div className="mt-2.5 flex justify-between text-[11px] font-medium" style={{ color: D.text2 }}>
            <span>Hoy</span>
            <span>{dateLabel(sub.inDays)}</span>
          </div>
          <div className="mt-1.5 h-2 overflow-hidden rounded-full" style={{ background: D.iconBg }}>
            <div className="h-full origin-left animate-[bar-grow_0.8s_cubic-bezier(0.22,1,0.36,1)] rounded-full" style={{ width: `${progress * 100}%`, background: D.green }} />
          </div>
          <div className="mt-2 text-[13px] font-bold">{sub.inDays <= 0 ? 'Es hoy' : `En ${sub.inDays} días`}</div>
        </div>

        <div className="mt-4 flex items-center justify-between pt-3.5 text-[13px]" style={{ borderTop: '1px solid rgba(255,255,255,0.08)', color: D.text2 }}>
          <span className="flex items-center gap-3">
            <Bell size={16} />
            Aviso de renovación
          </span>
          <span>{reminderLabel(sub.reminder)}</span>
        </div>

        {mark !== 'hidden' && (
          <div className={`mt-5 rounded-2xl p-4 transition-opacity duration-300`} style={{ background: D.card, border: `1px solid ${D.cardBorder}` }}>
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold">Actividad</span>
              {zombie && mark === 'idle' && (
                <span className="rounded-full px-2.5 py-1 text-xs font-medium" style={{ background: 'rgba(245,158,11,0.15)', color: D.amber }}>
                  Sin usar hace {sub.unusedDays} días
                </span>
              )}
            </div>
            {mark === 'confirmed' ? (
              <div className="mt-3 flex animate-[fade-up_0.32s_ease-out] items-center justify-center rounded-full py-2.5 text-sm font-medium" style={{ background: 'rgba(52,199,122,0.1)', border: '1px solid rgba(52,199,122,0.2)', color: D.green }}>
                <CircleCheck size={16} className="mr-1.5" />
                Usada hoy
              </div>
            ) : (
              <button
                type="button"
                onClick={() => {
                  setMark('confirmed');
                  onMarkUsed();
                }}
                className="mt-3 w-full cursor-pointer rounded-full py-2.5 text-sm font-medium transition-opacity active:opacity-80"
                style={{ background: D.iconBg }}
              >
                Marcar como usada hoy
              </button>
            )}
          </div>
        )}

        {sub.shared && (
          <div className="mt-4 rounded-2xl p-4" style={{ background: D.card, border: `1px solid ${D.cardBorder}` }}>
            <div className="text-sm font-semibold">Compartida con {sub.shared.with}</div>
            <div className="mt-1 text-sm" style={{ color: D.text2 }}>
              Tú pagas {cop(mine)} · {sub.shared.with} paga {cop(sub.amount - mine)}
            </div>
          </div>
        )}

        <button type="button" onClick={onCancel} className="mt-6 w-full cursor-pointer rounded-2xl py-3 text-sm font-medium transition-opacity active:opacity-80" style={{ background: 'rgba(255,98,89,0.12)', color: D.red }}>
          Cancelar
        </button>
        <div className="mt-3 py-2 text-center text-sm font-medium" style={{ color: D.text2 }}>
          Editar suscripción
        </div>
      </div>
    </Sheet>
  );
}

const SUCCESS_MS = 1900;

export function CancelSheet({ sub, done, onKeep, onConfirm, onFinish }: { sub: DemoSub; done: boolean; onKeep: () => void; onConfirm: () => void; onFinish: () => void }) {
  useEffect(() => {
    if (!done) return;
    const id = setTimeout(onFinish, SUCCESS_MS);
    return () => clearTimeout(id);
  }, [done, onFinish]);

  return (
    <Sheet onClose={done ? onFinish : onKeep} maxHeight="70%">
      {done ? (
        <div className="flex flex-col items-center px-6 pt-8 pb-12 text-center">
          <span className="flex size-16 animate-[pop-in_0.5s_ease-out] items-center justify-center rounded-full" style={{ background: 'rgba(52,199,122,0.15)', color: D.green }}>
            <Check size={32} strokeWidth={3} />
          </span>
          <span className="mt-4 animate-[fade-up_0.4s_ease-out] text-[18px] font-bold">{sub.name} cancelada</span>
          <span className="mt-1.5 animate-[fade-up_0.5s_ease-out] text-[13px]" style={{ color: D.text2 }}>
            Ya no aparecerá en tu lista ni en tus gastos.
          </span>
        </div>
      ) : (
        <div className="flex flex-col items-center px-6 pt-6 pb-8 text-center">
          <span className="relative">
            <ServiceBadge service={sub.service} name={sub.name} size={64} />
            <span className="absolute -right-1.5 -bottom-1.5 flex size-6 items-center justify-center rounded-full" style={{ background: D.red, border: `3px solid ${D.bg}` }}>
              <X size={12} strokeWidth={3.5} color="#fff" />
            </span>
          </span>
          <span className="mt-4 text-[18px] font-bold">¿Cancelar {sub.name}?</span>
          <span className="mt-2 text-[13px] leading-relaxed" style={{ color: D.text2 }}>
            Dejará de sumarse a tu gasto mensual de <b className="font-semibold text-[#F5F5F7]">{cop(sub.amount)}</b> y desaparecerá de tu lista.
          </span>
          <div className="mt-5 flex w-full flex-col gap-2.5">
            <button type="button" onClick={onConfirm} className="w-full cursor-pointer rounded-2xl py-3.5 text-sm font-semibold text-white transition-opacity active:opacity-80" style={{ background: D.red }}>
              Cancelar suscripción
            </button>
            <button type="button" onClick={onKeep} className="w-full cursor-pointer rounded-2xl py-3.5 text-sm font-medium transition-opacity active:opacity-80" style={{ background: D.card, border: `1px solid ${D.cardBorder}` }}>
              Mantener activa
            </button>
          </div>
        </div>
      )}
    </Sheet>
  );
}
