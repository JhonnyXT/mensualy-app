import Image from 'next/image';
import { SERVICES } from '@/content/app';

/** Badge cuadrado redondeado: logo real si existe, si no iniciales con el
 * color de marca (misma regla que `ServiceBadge` de la app). */
export function ServiceBadge({ service, name, size = 44 }: { service: string; name?: string; size?: number }) {
  const s = SERVICES[service];
  const radius = size * 0.32;
  if (s?.logo) {
    return (
      <span className="flex shrink-0 items-center justify-center overflow-hidden bg-white" style={{ width: size, height: size, borderRadius: radius }}>
        <Image src={s.logo} alt="" width={Math.round(size * 0.66)} height={Math.round(size * 0.66)} className="object-contain" />
      </span>
    );
  }
  const color = s?.color ?? '#6B6B70';
  const initials = s?.monogram ?? (name ?? '?').slice(0, 2).toUpperCase();
  return (
    <span
      className="flex shrink-0 items-center justify-center font-bold"
      style={{ width: size, height: size, borderRadius: radius, background: `${color}26`, color, fontSize: size * 0.38 }}
      aria-hidden
    >
      {initials}
    </span>
  );
}
