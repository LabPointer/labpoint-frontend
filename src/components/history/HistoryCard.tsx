import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Calendar, Clock, Pencil, Users, X } from "lucide-react";
import { memo, useMemo } from "react";
import { type Reserve, statusFromNumber } from "#/lib/queries/reserves";
import { hhmm, shiftLabels, sortSchedules } from "#/lib/queries/schedules";
import { statusLabel, statusVariantClass } from "#/lib/utils/reservation-utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardAction, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export interface HistoryCardProps {
  reserve: Reserve;
  /** Exibe os botões Alterar/Cancelar (somente reservas futuras). */
  showCTA: boolean;
  onEdit?: (reserve: Reserve) => void;
  onCancel?: (reserve: Reserve) => void;
}

const fmtDate = (date: string) => format(parseISO(date), "dd/MM/yyyy", { locale: ptBR });

export const HistoryCard = memo(function HistoryCard({ reserve, showCTA, onEdit, onCancel }: HistoryCardProps) {
  const status = statusFromNumber(reserve.status);

  // horários agrupados por turno, em ordem: [[turno, ["07:30 às 08:30", ...]], ...]
  const groups = useMemo(() => {
    const byShift = new Map<number, string[]>();
    for (const schedule of sortSchedules(reserve.schedules)) {
      const list = byShift.get(schedule.shift) ?? [];
      list.push(`${hhmm(schedule.startAt)} às ${hhmm(schedule.endAt)}`);
      byShift.set(schedule.shift, list);
    }
    return [...byShift.entries()];
  }, [reserve.schedules]);

  return (
    <Card className="min-h-72 min-w-72 max-w-72 rounded-md border bg-white p-4 shadow-md hover:shadow-lg dark:border-violet-500/10 dark:bg-white/5 dark:shadow-violet-300/15">
      <CardHeader className="flex flex-row items-start justify-between border-0 p-0">
        <div className="flex flex-col gap-1">
          <CardTitle className="text-lg font-bold text-foreground">{reserve.space.name}</CardTitle>
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Users className="size-3.5" />
            <span>{reserve.space.capacity} lugares</span>
          </div>
        </div>

        <CardAction className="m-0">
          <Badge
            variant="outline"
            className={cn("rounded-full px-3 py-0.5 text-xs font-medium", statusVariantClass(status))}
          >
            {statusLabel(status)}
          </Badge>
        </CardAction>
      </CardHeader>

      <CardContent className="flex h-full flex-col gap-2.5 p-0 text-sm">
        <div className="flex items-center gap-2 text-foreground/90">
          <Calendar className="size-4 shrink-0 text-violet-500 dark:text-violet-400" />
          <span className="text-sm font-semibold">
            {reserve.dateFrom === reserve.dateTo
              ? fmtDate(reserve.dateFrom)
              : `${fmtDate(reserve.dateFrom)} a ${fmtDate(reserve.dateTo)}`}
          </span>
        </div>

        <div className="flex min-h-40 flex-col items-start gap-2 text-foreground/90">
          {groups.map(([shift, times]) => (
            <div key={shift} className="flex w-full flex-col items-start gap-1">
              <div className="flex w-full items-center gap-1">
                <Clock className="size-4 shrink-0 text-violet-500 dark:text-violet-400" />
                <span className="text-sm font-semibold">{shiftLabels[shift] ?? "—"}:</span>
              </div>
              <p className="w-full rounded-md border p-1 text-xs font-medium">{times.join(" - ")}</p>
            </div>
          ))}
        </div>

        <p className="text-xs font-medium text-foreground">
          <span className="text-sm font-semibold">Propósito:</span> {reserve.purpose || "Propósito não informado"}
        </p>
      </CardContent>

      {showCTA && (
        <CardFooter className="grid grid-cols-2 gap-3 border-0 bg-transparent">
          <Button
            variant="outline"
            size="lg"
            className="w-full gap-2 rounded-xl border-neutral-200 text-sm font-medium hover:bg-neutral-100 dark:border-neutral-700 dark:hover:bg-neutral-800"
            onClick={() => onEdit?.(reserve)}
          >
            <Pencil className="size-4" />
            Alterar
          </Button>

          <Button
            variant="outline"
            size="lg"
            className="w-full gap-2 rounded-xl border-rose-300 text-sm font-medium text-rose-600 hover:border-rose-400 hover:bg-rose-50 hover:text-rose-700 dark:border-rose-900/70 dark:text-rose-400 dark:hover:bg-rose-950/40"
            onClick={() => onCancel?.(reserve)}
          >
            <X className="size-4" />
            Cancelar
          </Button>
        </CardFooter>
      )}
    </Card>
  );
});
