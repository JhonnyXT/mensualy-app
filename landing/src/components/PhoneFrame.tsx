import type { ReactNode } from 'react';

/** Marco de teléfono de 380×780 (al 80% en móvil). El contenido se dibuja a
 * 390 px de ancho lógico (como un Android típico) y se escala al marco, así
 * las medidas de la app se copian tal cual. */
export const PHONE_W = 390;
const INNER_W = 364;
const INNER_H = 764;
const SCALE = INNER_W / PHONE_W;
export const PHONE_H = Math.round(INNER_H / SCALE);

export function PhoneFrame({ children }: { children: ReactNode }) {
  return (
    <div className="h-[624px] w-[304px] sm:h-[780px] sm:w-[380px]">
      <div className="relative h-[780px] w-[380px] origin-top-left scale-[0.8] overflow-hidden rounded-[58px] border-8 border-[#24242c] bg-bg shadow-[0_50px_100px_-20px_rgba(0,0,0,0.8),0_0_0_1px_rgba(124,107,255,0.08),inset_0_0_0_2px_#34343e] sm:scale-100">
        <div className="pointer-events-none absolute top-3.5 left-1/2 z-50 size-[22px] -translate-x-1/2 rounded-full bg-black" />
        <div className="absolute top-0 left-0 origin-top-left" style={{ width: PHONE_W, height: PHONE_H, transform: `scale(${SCALE})` }}>
          {children}
        </div>
      </div>
    </div>
  );
}
