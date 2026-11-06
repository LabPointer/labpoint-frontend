import { format, parseISO, startOfToday } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Building2, Calendar, Clock, FileText, Package, Pencil, X } from "lucide-react";
import { memo, useMemo } from "react";
import { statusFromNumber } from "#/lib/queries/reserves";
import { isActiveReserveStatus, type ResourceReserve } from "#/lib/queries/resource-reserves";
import { hhmm, shiftLabels, sortSchedules } from "#/lib/queries/schedules";
import { reportCount } from "#/lib/queries/usage";
import { statusLabel, statusVariantClass } from "#/lib/utils/reservation-utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardAction, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

type ResourceReserveCardProps = {
  reserve: ResourceReserve;
  onEdit: (reserve: ResourceReserve) => void;
  onCancel: (reserve: ResourceReserve) => void;
  /** Abre o relatório de uso (só aparece depois de algum check-in). */
  onReport?: (reserve: ResourceReserve) => void;
};

const fmtDate = (date: string) => format(parseISO(date), "dd/MM/yyyy", { locale: ptBR });

/** Ações só para reservas ativas que ainda não terminaram. */
export function canChangeResourceReserve(reserve: ResourceReserve, today = startOfToday()) {
  return isActiveReserveStatus(reserve.status) && parseISO(reserve.dateTo) >= today;
}

export const ResourceReserveCard = memo(function ResourceReserveCard({
  reserve,
  onEdit,
  onCancel,
  onReport,
}: ResourceReserveCardProps) {
  const status = statusFromNumber(reserve.status);
  const reports = reportCount(reserve.usage);
  const showCTA = canChangeResourceReserve(reserve);

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
    <Card className="min-h-72 w-72 rounded-md border bg-white p-4 shadow-md hover:shadow-lg dark:border-violet-500/10 dark:bg-white/5 dark:shadow-violet-300/15">
      <CardHeader className="flex flex-row items-start justify-between border-0 p-0">
        <div className="flex min-w-0 flex-col gap-1">
          <CardTitle className="truncate text-lg font-bold" title={reserve.resource.name}>
            {reserve.resource.name}
          </CardTitle>
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Package className="size-3.5" />
            <span>
              {reserve.quantity} de {reserve.resource.quantity} unidade(s)
            </span>
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
        <div className="flex items-center gap-2">
          <Calendar className="size-4 shrink-0 text-violet-500 dark:text-violet-400" />
          <span className="text-sm font-semibold">
            {reserve.dateFrom === reserve.dateTo
              ? fmtDate(reserve.dateFrom)
              : `${fmtDate(reserve.dateFrom)} a ${fmtDate(reserve.dateTo)}`}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <Building2 className="size-4 shrink-0 text-violet-500 dark:text-violet-400" />
          <span className="text-xs font-medium">
            {reserve.spaceReserve ? `Junto com a sala ${reserve.spaceReserve.spaceName}` : "Reserva avulsa (sem sala)"}
          </span>
        </div>

        <div className="flex flex-col items-start gap-2">
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

        <p className="text-xs font-medium">
          <span className="text-sm font-semibold">Propósito:</span> {reserve.purpose}
        </p>
      </CardContent>

      {reports > 0 && onReport && (
        <Button variant="outline" size="sm" className="w-full gap-2" onClick={() => onReport(reserve)}>
          <FileText className="size-4" />
          Ver relatório de uso ({reports})
        </Button>
      )}

      {showCTA && (
        <CardFooter className="grid grid-cols-2 gap-3 border-0 bg-transparent">
          <Button
            variant="outline"
            size="lg"
            className="w-full gap-2 rounded-xl text-sm font-medium"
            onClick={() => onEdit(reserve)}
          >
            <Pencil className="size-4" />
            Alterar
          </Button>
          <Button
            variant="outline"
            size="lg"
            className="w-full gap-2 rounded-xl border-rose-300 text-sm font-medium text-rose-600 hover:border-rose-400 hover:bg-rose-50 hover:text-rose-700 dark:border-rose-900/70 dark:text-rose-400 dark:hover:bg-rose-950/40"
            onClick={() => onCancel(reserve)}
          >
            <X className="size-4" />
            Cancelar
          </Button>
        </CardFooter>
      )}
    </Card>
  );
});
