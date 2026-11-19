'use client';

import Image from 'next/image';
import { useEffect } from 'react';
import { cop, type DemoSub } from '@/content/app';

const VISIBLE_MS = 9000;

/** Texto exacto de `rescheduleAllReminders` (src/features/reminders/notifications.ts). */
export function reminderText(sub: DemoSub) {
  const days = sub.reminder ?? 0;
  return {
    title: days === 0 ? `${sub.name} se cobra hoy` : `${sub.name} se cobra pronto`,
    body: days === 0 ? `Hoy se renueva por ${cop(sub.amount)}.` : `Se renueva en ${days} día${days === 1 ? '' : 's'} por ${cop(sub.amount)}.`,
  };
}

/** Notificación heads-up de Android que baja sobre la app. Tocarla abre el
 * detalle de esa suscripción (como el listener de `_layout.tsx`). */
export function Banner({ sub, n, onTap, onHide }: { sub: DemoSub; n: number; onTap: () => void; onHide: () => void }) {
  useEffect(() => {
    const id = setTimeout(onHide, VISIBLE_MS);
    return () => clearTimeout(id);
  }, [n, onHide]);

  const { title, body } = reminderText(sub);
  return (
    <button
      key={n}
      type="button"
      onClick={onTap}
      className="absolute inset-x-3 top-10 z-[60] flex animate-[notif-drop_0.45s_cubic-bezier(0.22,1,0.36,1)] cursor-pointer flex-col overflow-hidden rounded-[22px] text-left shadow-[0_18px_40px_rgba(0,0,0,0.6)] ring-1 ring-white/10"
      style={{ background: 'rgba(38,38,47,0.97)', backdropFilter: 'blur(12px)' }}
    >
      <span className="flex items-start gap-3 px-4 py-3.5">
        <Image src="/img/mensualy-mark.png" alt="" width={32} height={32} className="mt-0.5 size-8" />
        <span className="flex min-w-0 flex-1 flex-col gap-0.5">
          <span className="text-[11px] text-[#a1a1aa]">Mensualy · ahora</span>
          <span className="text-[14px] font-bold text-[#F5F5F7]">{title}</span>
          <span className="text-[13px] leading-snug text-[#cfcfd6]">{body}</span>
        </span>
      </span>
      <span aria-hidden className="block h-[3px] origin-left bg-[#7C6BFF]/70" style={{ animation: `banner-timer ${VISIBLE_MS}ms linear forwards` }} />
    </button>
  );
}
