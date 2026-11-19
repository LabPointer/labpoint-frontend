import { differenceInCalendarDays, format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import { CalendarDays, Clock, FileText, Pencil, X } from "lucide-react";
import { useMemo } from "react";
import { statusFromNumber } from "#/lib/queries/reserves";
import { hhmm, type Schedule, shiftLabels, sortSchedules } from "#/lib/queries/schedules";
import { statusLabel, statusVariantClass } from "#/lib/utils/reservation-utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CardFooter } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { RESERVE_CARD_FOOTER_CLASS, ReserveCardStat } from "./ReserveCardParts";

/** Peças dos cards de histórico (salas e recursos), sobre as mesmas bases dos cards de reserva. */

export function ReserveStatusBadge({ status }: { status: number | string }) {
  const value = statusFromNumber(status);
  return (
    <Badge
      variant="outline"
      className={cn("shrink-0 rounded-full px-2.5 py-0.5 text-xs font-normal", statusVariantClass(value))}
    >
      {statusLabel(value)}
    </Badge>
  );
}

const fmtShort = (date: string) => format(parseISO(date), "dd/MM", { locale: ptBR });
const fmtFull = (date: string) => format(parseISO(date), "dd/MM/yyyy", { locale: ptBR });

/** Dia (com o dia da semana) ou período (com a quantidade de dias). */
export function ReservePeriodStat({ dateFrom, dateTo }: { dateFrom: string; dateTo: string }) {
  const singleDay = dateFrom === dateTo;
  const days = differenceInCalendarDays(parseISO(dateTo), parseISO(dateFrom)) + 1;
  return (
    <dl>
      <ReserveCardStat
        icon={<CalendarDays />}
        label={singleDay ? "Data" : "Período"}
        value={singleDay ? fmtFull(dateFrom) : `${fmtShort(dateFrom)} a ${fmtFull(dateTo)}`}
        unit={singleDay ? format(parseISO(dateFrom), "EEEE", { locale: ptBR }) : `${days} dias`}
      />
    </dl>
  );
}

/** Horários agrupados por turno: o turno como rótulo e cada horário como um chip. */
export function ReserveSchedules({ schedules }: { schedules: Pick<Schedule, "shift" | "startAt" | "endAt">[] }) {
  const groups = useMemo(() => {
    const byShift = new Map<number, string[]>();
    for (const schedule of sortSchedules(schedules)) {
      const list = byShift.get(schedule.shift) ?? [];
      list.push(`${hhmm(schedule.startAt)} – ${hhmm(schedule.endAt)}`);
      byShift.set(schedule.shift, list);
    }
    return [...byShift.entries()];
  }, [schedules]);

  if (groups.length === 0) return null;

  return (
    <div className="flex flex-col gap-2">
      {groups.map(([shift, times]) => (
        <div key={shift} className="flex flex-col gap-1">
          <span className="flex items-center gap-1.5 text-xs font-semibold text-neutral-700 dark:text-neutral-300">
            <Clock className="size-3.5 text-violet-600 dark:text-violet-400" aria-hidden="true" />
            {shiftLabels[shift] ?? "—"}
          </span>
          <ul className="flex flex-wrap gap-1.5" aria-label={`Horários da ${shiftLabels[shift] ?? "turno"}`}>
            {times.map((time) => (
              <li key={time}>
                <Badge
                  variant="outline"
                  className="rounded-md border-neutral-200 bg-neutral-100/70 font-medium text-neutral-700 tabular-nums dark:border-white/10 dark:bg-white/5 dark:text-neutral-200"
                >
                  {time}
                </Badge>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}

/** Propósito informado na reserva. */
export function ReservePurpose({ purpose }: { purpose: string | null | undefined }) {
  return (
    <div className="mt-auto rounded-lg border-l-2 border-violet-500/40 bg-violet-500/5 px-3 py-2 dark:bg-violet-400/5">
      <p className="text-[0.7rem] leading-none tracking-wide text-neutral-500 uppercase dark:text-neutral-400">
        Propósito
      </p>
      <p
        className={cn(
          "mt-1 line-clamp-2 text-sm",
          purpose ? "text-neutral-700 dark:text-neutral-200" : "text-neutral-400 italic dark:text-neutral-500",
        )}
        title={purpose || undefined}
      >
        {purpose || "Não informado."}
      </p>
    </div>
  );
}

type HistoryCardActionsProps = {
  /** Quantas sessões têm relatório; o botão só aparece com pelo menos uma. */
  reports: number;
  onReport?: () => void;
  /** Alterar/Cancelar (só reservas que ainda podem mudar). */
  showCTA: boolean;
  onEdit?: () => void;
  onCancel?: () => void;
};

/** Rodapé do histórico: relatório de uso e Alterar/Cancelar. Some quando não há nenhuma ação. */
export function HistoryCardActions({ reports, onReport, showCTA, onEdit, onCancel }: HistoryCardActionsProps) {
  const showReport = reports > 0 && onReport !== undefined;
  if (!showReport && !showCTA) return null;

  return (
    <CardFooter className={cn(RESERVE_CARD_FOOTER_CLASS, "flex flex-col gap-2")}>
      {showReport && (
        <Button variant="outline" className="h-10 w-full gap-2 rounded-xl" onClick={onReport}>
          <FileText className="size-4" />
          Ver relatório de uso ({reports})
        </Button>
      )}
      {showCTA && (
        <div className="grid w-full grid-cols-2 gap-2">
          <Button
            variant="outline"
            className="h-10 w-full gap-2 rounded-xl border-neutral-200 font-medium hover:bg-neutral-100 dark:border-neutral-700 dark:hover:bg-neutral-800"
            onClick={onEdit}
          >
            <Pencil className="size-4" />
            Alterar
          </Button>
          <Button
            variant="outline"
            className="h-10 w-full gap-2 rounded-xl border-rose-300 font-medium text-rose-600 hover:border-rose-400 hover:bg-rose-50 hover:text-rose-700 dark:border-rose-900/70 dark:text-rose-400 dark:hover:bg-rose-950/40"
            onClick={onCancel}
          >
            <X className="size-4" />
            Cancelar
          </Button>
        </div>
      )}
    </CardFooter>
  );
}
