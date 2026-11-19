import type { ReactNode } from 'react';
import { D } from './Dashboard';

/** Bottom sheet de la app: fondo oscurecido + tarjeta que sube (260 ms, como
 * la entrada de `useDragToDismiss`). Tocar el fondo cierra. */
export function Sheet({ children, onClose, maxHeight = '90%' }: { children: ReactNode; onClose: () => void; maxHeight?: string }) {
  return (
    <div className="absolute inset-0 z-50 flex flex-col justify-end">
      <button type="button" aria-label="Cerrar" onClick={onClose} className="absolute inset-0 cursor-default animate-[backdrop-in_0.26s_ease-out] bg-black/55" />
      <div
        role="dialog"
        className="relative flex animate-[sheet-up_0.3s_cubic-bezier(0.22,1,0.36,1)] flex-col overflow-hidden rounded-t-[32px]"
        style={{ background: D.bg, maxHeight }}
      >
        <div className="flex justify-center pt-3">
          <span className="h-1.5 w-10 rounded-full" style={{ background: 'rgba(255,255,255,0.35)' }} />
        </div>
        {children}
      </div>
    </div>
  );
}

export function CloseButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      aria-label="Cerrar"
      onClick={onClick}
      className="flex size-7 cursor-pointer items-center justify-center rounded-full transition-transform active:scale-95"
      style={{ background: D.card, border: `1px solid ${D.cardBorder}` }}
    >
      <svg width="12" height="12" viewBox="0 0 12 12" stroke="#F5F5F7" strokeWidth="1.8" strokeLinecap="round" aria-hidden>
        <path d="M2 2l8 8M10 2l-8 8" />
      </svg>
    </button>
  );
}

/** Scroll interno de los sheets sin barra visible (como en el teléfono). */
export const scrollArea = 'overflow-y-auto overscroll-contain [scrollbar-width:none] [&::-webkit-scrollbar]:hidden';
