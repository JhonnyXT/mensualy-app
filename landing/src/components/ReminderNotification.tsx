import { Bell } from 'lucide-react';

/** Notificación de Android tal como la programa `src/features/reminders/notifications.ts`. */
export function ReminderNotification({ title, body, time, className = '' }: { title: string; body: string; time: string; className?: string }) {
  return (
    <div className={`flex w-full items-start gap-3 rounded-[22px] bg-[#26262f] px-4 py-3.5 text-left shadow-[0_18px_40px_rgba(0,0,0,0.5)] ring-1 ring-white/5 ${className}`}>
      <span className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-full bg-violet text-white">
        <Bell size={15} strokeWidth={2.4} className="bell-ring" aria-hidden />
      </span>
      <span className="flex min-w-0 flex-1 flex-col gap-0.5">
        <span className="text-[11px] text-dim">Mensualy · {time}</span>
        <span className="text-[14px] font-bold">{title}</span>
        <span className="text-[13px] leading-snug text-[#cfcfd6]">{body}</span>
      </span>
    </div>
  );
}
