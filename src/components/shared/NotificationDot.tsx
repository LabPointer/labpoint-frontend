import { cn } from "cn";

/** Bolinha de notificação: indica que há algo a fazer no item ao lado. */
export function NotificationDot({ label, className }: { label: string; className?: string }) {
  return (
    <span className={cn("flex size-2.5 shrink-0 rounded-full bg-rose-500 ring-2 ring-rose-500/25", className)}>
      <span className="sr-only">{label}</span>
    </span>
  );
}
