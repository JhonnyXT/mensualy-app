'use client';

// Réplica de `NewSubscriptionSheet.tsx` (sin "Gasto compartido" ni cambio de
// moneda: la demo es en COP). Mismas filas, textos y reglas: elegir un servicio
// completa nombre y categoría; si la búsqueda no encuentra nada, se agrega como
// servicio local con iniciales.

import { Bell, Calendar, ChevronDown, ChevronUp, CirclePlus, Search, Tag } from 'lucide-react';
import { useMemo, useState, type ReactNode } from 'react';
import { ServiceBadge } from '@/components/ServiceBadge';
import { categoryOf, CYCLE_LABEL, dateLabel, SERVICES, type Cycle } from '@/content/app';
import type { NewSubInput } from '../useDemo';
import { D } from './Dashboard';
import { CloseButton, scrollArea, Sheet } from './Sheet';

const CATALOG = Object.values(SERVICES).filter((s) => s.logo);
const CATEGORIES = ['Streaming', 'Música', 'Trabajo / IA', 'Gimnasio / Salud', 'Almacenamiento en la nube', 'Gaming', 'Otros'];
const REMINDERS: { days: number | null; label: string }[] = [
  { days: null, label: 'Predeterminado' },
  { days: 0, label: 'El mismo día' },
  { days: 1, label: '1 día antes' },
  { days: 2, label: '2 días antes' },
  { days: 3, label: '3 días antes' },
];
const DATE_CHOICES = Array.from({ length: 31 }, (_, i) => i);

/** `formatMontoInput` para COP: separador de miles con punto, sin decimales. */
const formatAmount = (digits: string) => (digits ? Number(digits).toLocaleString('es-CO') : '');

function SectionLabel({ children }: { children: ReactNode }) {
  return (
    <span className="mb-2 block px-0.5 text-[11px] font-bold tracking-wider uppercase" style={{ color: D.text2 }}>
      {children}
    </span>
  );
}

function Row({ icon, iconColor, label, value, open, onToggle }: { icon: ReactNode; iconColor: string; label: string; value: ReactNode; open: boolean; onToggle: () => void }) {
  return (
    <button type="button" onClick={onToggle} className="flex w-full cursor-pointer items-center justify-between p-3.5 text-left">
      <span className="flex items-center gap-3">
        <span className="flex size-[34px] items-center justify-center rounded-lg" style={{ background: D.iconBg, color: iconColor }}>
          {icon}
        </span>
        <span className="text-sm font-medium" style={{ color: D.text2 }}>
          {label}
        </span>
      </span>
      <span className="flex items-center gap-1.5">
        {value}
        {open ? <ChevronUp size={16} color={D.text2} /> : <ChevronDown size={16} color={D.text2} />}
      </span>
    </button>
  );
}

function Chips<T>({ items, selected, label, onPick }: { items: T[]; selected: T; label: (t: T) => string; onPick: (t: T) => void }) {
  return (
    <div className="flex flex-wrap gap-2 px-3.5 pt-1 pb-3.5" style={{ borderTop: `1px solid ${D.cardBorder}` }}>
      {items.map((it) => {
        const active = it === selected;
        return (
          <button
            key={label(it)}
            type="button"
            onClick={() => onPick(it)}
            className="mt-2 cursor-pointer rounded-full px-3 py-1.5 text-xs font-semibold transition-colors"
            style={{ background: active ? D.violet : D.iconBg, color: active ? '#fff' : D.text }}
          >
            {label(it)}
          </button>
        );
      })}
    </div>
  );
}

const Divider = () => <div className="h-px" style={{ background: 'rgba(255,255,255,0.08)', marginLeft: 62 }} />;

export function NewSheet({ onClose, onCreate }: { onClose: () => void; onCreate: (input: NewSubInput) => void }) {
  const [query, setQuery] = useState('');
  const [service, setService] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [amount, setAmount] = useState('');
  const [cycle, setCycle] = useState<Cycle>('monthly');
  const [category, setCategory] = useState<string | null>(null);
  const [inDays, setInDays] = useState(0);
  const [reminder, setReminder] = useState<number | null>(null);
  const [open, setOpen] = useState<'category' | 'date' | 'reminder' | null>(null);

  const matches = useMemo(() => {
    const q = query.trim().toLowerCase();
    return (q ? CATALOG.filter((s) => s.name.toLowerCase().includes(q)) : CATALOG).slice(0, 12);
  }, [query]);

  const selectedCategory = category ?? categoryOf(service);
  const canSave = name.trim().length > 0 && Number(amount) > 0;
  const toggle = (k: typeof open) => setOpen((o) => (o === k ? null : k));

  const pickService = (key: string) => {
    setService(key);
    if (!name.trim()) setName(SERVICES[key].name);
    setCategory(null);
  };
  const useLocal = () => {
    setService(null);
    setName(query.trim());
    setCategory('Otros');
    setQuery('');
  };

  const create = () => {
    if (!canSave) return;
    onCreate({ service: service ?? 'local', name: name.trim(), amount: Number(amount), cycle, category: selectedCategory, inDays, reminder });
  };

  return (
    <Sheet onClose={onClose}>
      <div className="flex items-center justify-between px-5 pt-3">
        <span className="text-lg font-bold">Nueva suscripción</span>
        <CloseButton onClick={onClose} />
      </div>
      <div className={`${scrollArea} px-5 pt-5 pb-10`}>
        <SectionLabel>Servicio (opcional)</SectionLabel>
        <label className="mb-3 flex items-center rounded-xl px-3.5" style={{ background: D.card, border: `1px solid ${D.cardBorder}` }}>
          <Search size={18} color={D.text2} />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar Netflix, Spotify, iCloud..."
            aria-label="Buscar servicio"
            className="min-w-0 flex-1 bg-transparent py-2.5 pl-2.5 text-sm font-medium outline-none placeholder:text-[#9A9AA2]"
          />
        </label>

        {query.trim() && matches.length === 0 ? (
          <button type="button" onClick={useLocal} className="mb-5 flex w-full animate-[fade-up_0.3s_ease-out] cursor-pointer items-center gap-3 rounded-2xl p-3.5 text-left" style={{ background: D.card, border: `1px solid ${D.cardBorder}` }}>
            <ServiceBadge service="local" name={query.trim()} size={40} />
            <span className="flex flex-1 flex-col">
              <span className="text-sm font-semibold">No está en el catálogo</span>
              <span className="mt-0.5 text-xs font-medium" style={{ color: D.text2 }}>
                Agregar &quot;{query.trim()}&quot; como servicio local
              </span>
            </span>
            <CirclePlus size={22} color={D.violet} />
          </button>
        ) : (
          <div className={`mb-5 flex gap-3 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden`}>
            {matches.map((s) => {
              const selected = service === s.key;
              return (
                <button key={s.key} type="button" onClick={() => pickService(s.key)} className="flex w-16 shrink-0 cursor-pointer flex-col items-center">
                  <span className="rounded-2xl p-0.5 transition-colors" style={{ border: `2px solid ${selected ? D.violet : 'transparent'}` }}>
                    <ServiceBadge service={s.key} size={48} />
                  </span>
                  <span className="mt-1.5 w-full truncate text-center text-[10px] font-medium" style={{ color: selected ? D.text : D.text2 }}>
                    {s.name}
                  </span>
                </button>
              );
            })}
          </div>
        )}

        <div className="mb-4 flex flex-col items-center rounded-2xl p-5" style={{ background: D.card, border: `1px solid ${D.cardBorder}` }}>
          <span className="mb-3 text-[11px] font-bold tracking-wider uppercase" style={{ color: D.text2 }}>
            Monto recurrente
          </span>
          <div className="mb-4 flex items-center gap-2">
            <span className="rounded-lg px-2.5 py-1.5 text-sm font-bold" style={{ background: D.iconBg, color: D.text2 }}>
              COP
            </span>
            <input
              value={formatAmount(amount)}
              onChange={(e) => setAmount(e.target.value.replace(/\D/g, '').slice(0, 9))}
              inputMode="numeric"
              placeholder="0"
              aria-label="Monto"
              className="w-[170px] bg-transparent text-center text-[34px] font-extrabold tabular-nums outline-none placeholder:text-[#9A9AA2]"
            />
          </div>
          <div className="flex w-full rounded-full p-1" style={{ background: D.iconBg }}>
            {(['weekly', 'monthly', 'yearly'] as Cycle[]).map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setCycle(c)}
                className="flex-1 cursor-pointer rounded-full py-2 text-xs font-semibold transition-colors"
                style={{ background: cycle === c ? D.violet : 'transparent', color: cycle === c ? '#fff' : D.text2 }}
              >
                {CYCLE_LABEL[c]}
              </button>
            ))}
          </div>
        </div>

        <div className="mb-6 overflow-hidden rounded-2xl" style={{ background: D.card, border: `1px solid ${D.cardBorder}` }}>
          <div className="flex items-center gap-3 p-3.5">
            <ServiceBadge service={service ?? 'local'} name={name || '?'} size={34} />
            <span className="text-sm font-medium" style={{ color: D.text2 }}>
              Nombre
            </span>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ej: Netflix"
              aria-label="Nombre"
              className="min-w-0 flex-1 bg-transparent text-right text-[15px] font-semibold outline-none placeholder:text-[#9A9AA2]"
            />
          </div>
          <Divider />
          <Row
            icon={<Tag size={16} />}
            iconColor={D.violet}
            label="Categoría"
            open={open === 'category'}
            onToggle={() => toggle('category')}
            value={
              <span className="max-w-[130px] truncate rounded-full px-2.5 py-1 text-xs font-semibold" style={{ background: D.iconBg }}>
                {selectedCategory}
              </span>
            }
          />
          {open === 'category' && <Chips items={CATEGORIES} selected={selectedCategory} label={(c) => c} onPick={(c) => {
                setCategory(c);
                setOpen(null);
              }} />}
          <Divider />
          <Row
            icon={<Calendar size={16} />}
            iconColor={D.green}
            label="Fecha de cobro"
            open={open === 'date'}
            onToggle={() => toggle('date')}
            value={<span className="text-sm font-semibold">{inDays === 0 ? 'Hoy' : dateLabel(inDays)}</span>}
          />
          {open === 'date' && <Chips items={DATE_CHOICES} selected={inDays} label={(d) => (d === 0 ? 'Hoy' : dateLabel(d, false))} onPick={(d) => {
                setInDays(d);
                setOpen(null);
              }} />}
          <Divider />
          <Row
            icon={<Bell size={16} />}
            iconColor={D.amber}
            label="Recordatorio"
            open={open === 'reminder'}
            onToggle={() => toggle('reminder')}
            value={<span className="text-sm font-semibold">{reminder === null ? 'Predeterminado' : REMINDERS.find((r) => r.days === reminder)?.label}</span>}
          />
          {open === 'reminder' && <Chips items={REMINDERS} selected={REMINDERS.find((r) => r.days === reminder) ?? REMINDERS[0]} label={(r) => r.label} onPick={(r) => {
                setReminder(r.days);
                setOpen(null);
              }} />}
        </div>

        <button
          type="button"
          onClick={create}
          disabled={!canSave}
          className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-2xl py-3.5 text-[15px] font-bold transition-colors disabled:cursor-not-allowed"
          style={{ background: canSave ? D.violet : D.card, color: canSave ? '#fff' : D.text2 }}
        >
          <CirclePlus size={18} />
          Crear suscripción
        </button>
      </div>
    </Sheet>
  );
}
