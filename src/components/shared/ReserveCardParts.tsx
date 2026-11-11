import { CalendarPlus, CircleCheck, CircleSlash, Lock } from "lucide-react";
import type { ComponentProps, ReactNode } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/**
 * Peças dos cards de reserva (salas e recursos): mesmo visual e mesma hierarquia nas duas listas.
 * O Card do shadcn zera o padding de baixo quando há rodapé; o pb-4 devolve o respiro abaixo do botão.
 */
export const RESERVE_CARD_CLASS =
  "h-full w-full gap-4 rounded-md border bg-white p-4 shadow-md transition-shadow hover:shadow-lg has-data-[slot=card-footer]:pb-4 dark:border-violet-500/10 dark:bg-white/5 dark:shadow-violet-300/15";

export const RESERVE_CARD_FOOTER_CLASS =
  "border-t border-neutral-200 bg-transparent px-0 pt-4 pb-0 dark:border-violet-500/10";

/** Ícone do tipo de item (laboratório, recurso) no canto do card. */
export function ReserveCardIcon({ children }: { children: ReactNode }) {
  return (
    <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-violet-500/10 text-violet-600 ring-1 ring-violet-500/20 ring-inset dark:bg-violet-400/10 dark:text-violet-300 [&_svg]:size-5">
      {children}
    </div>
  );
}

type AvailabilityBadgeProps = {
  available: boolean;
  availableLabel?: string;
  unavailableLabel: string;
  /** Ícone quando indisponível: cadeado (bloqueado) ou círculo cortado (esgotado). */
  unavailableIcon?: "lock" | "slash";
};

export function AvailabilityBadge({
  available,
  availableLabel = "Disponível",
  unavailableLabel,
  unavailableIcon = "lock",
}: AvailabilityBadgeProps) {
  const UnavailableIcon = unavailableIcon === "lock" ? Lock : CircleSlash;
  return (
    <Badge
      variant="outline"
      className={cn(
        "shrink-0 gap-1 rounded-full px-2.5 py-0.5 text-xs font-normal",
        available
          ? "border-emerald-500/30 bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300"
          : "border-rose-500/30 bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300",
      )}
    >
      {available ? <CircleCheck aria-hidden="true" /> : <UnavailableIcon aria-hidden="true" />}
      {available ? availableLabel : unavailableLabel}
    </Badge>
  );
}

type ReserveCardStatProps = {
  icon: ReactNode;
  label: string;
  value: ReactNode;
  unit?: string;
  /** Conteúdo extra abaixo do valor (ex.: barra de ocupação). */
  children?: ReactNode;
};

/** Número de destaque do card (capacidade, unidades). Use dentro de um `<dl>`. */
export function ReserveCardStat({ icon, label, value, unit, children }: ReserveCardStatProps) {
  return (
    <div className="flex items-center gap-2.5 rounded-lg bg-neutral-100/70 px-3 py-2 dark:bg-white/5">
      <span className="text-violet-600 dark:text-violet-400 [&_svg]:size-4" aria-hidden="true">
        {icon}
      </span>
      <div className="min-w-0 flex-1">
        <dt className="text-[0.7rem] leading-none tracking-wide text-neutral-500 uppercase dark:text-neutral-400">
          {label}
        </dt>
        <dd className="mt-1 leading-none">
          <span className="text-lg font-bold text-neutral-900 tabular-nums dark:text-neutral-100">{value}</span>
          {unit && <span className="text-xs text-neutral-500 dark:text-neutral-400"> {unit}</span>}
          {children}
        </dd>
      </div>
    </div>
  );
}

/** Descrição curta (3 linhas); o texto inteiro aparece ao passar o mouse. */
export function ReserveCardDescription({ text }: { text: string | null | undefined }) {
  return (
    <p
      className={cn(
        "line-clamp-3 text-sm leading-relaxed",
        text ? "text-neutral-600 dark:text-neutral-300" : "text-neutral-400 italic dark:text-neutral-500",
      )}
      title={text || undefined}
    >
      {text || "Sem descrição."}
    </p>
  );
}

/** Botão principal do card, com o nome do item no rótulo acessível. */
export function ReserveCardButton({ itemName, ...props }: ComponentProps<typeof Button> & { itemName: string }) {
  return (
    <Button
      className="h-10 w-full rounded-xl bg-[#5925dc] font-medium text-white shadow-sm transition-colors hover:bg-[#4b1ec0]"
      aria-label={`Reservar ${itemName}`}
      {...props}
    >
      <CalendarPlus data-icon="inline-start" />
      Reservar
    </Button>
  );
}
