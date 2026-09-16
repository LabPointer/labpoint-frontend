import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "#/components/ui/dialog.tsx";
import { Button } from "#/components/ui/button.tsx";
import { Badge } from "#/components/ui/badge.tsx";
import { Separator } from "#/components/ui/separator.tsx";
import { AlertCircle, CalendarDays, Clock, BookOpen } from "lucide-react";
import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import type { ReservationEventData } from "#/components/calendar/reservation-types";
import {
  scheduleKeyToLabel,
  statusLabel,
  statusVariantClass,
} from "#/components/calendar/reservation-utils";
import { cn } from "#/lib/utils.ts";

interface ReservationEventModalProps {
  data: ReservationEventData;
}

/**
 * Botão com ícone de exclamação que abre um Dialog com os detalhes da reserva.
 * Usado na visualização de Agenda.
 */
export function ReservationEventModal({ data }: ReservationEventModalProps) {
  const [open, setOpen] = useState(false);

  const dateFrom = parseISO(data.reservedDateFrom);
  const dateTo = parseISO(data.reservedDateTo);
  const isSameDay = data.reservedDateFrom === data.reservedDateTo;

  return (
    <>
      <Button
        variant="ghost"
        size="icon-sm"
        className="size-6 shrink-0 text-muted-foreground hover:text-foreground"
        aria-label={`Detalhes da reserva: ${data.spaceName}`}
        onClick={(e) => {
          e.stopPropagation();
          setOpen(true);
        }}
      >
        <AlertCircle className="size-3.5" aria-hidden="true" />
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-base">{data.spaceName}</DialogTitle>
          </DialogHeader>

          <div className="flex flex-col gap-4 pt-1">
            {/* Status */}
            <Badge
              variant="outline"
              className={cn("w-fit text-xs font-medium", statusVariantClass(data.status))}
            >
              {statusLabel(data.status)}
            </Badge>

            <Separator />

            {/* Datas */}
            <div className="flex items-start gap-3">
              <CalendarDays className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
              <div className="flex flex-col gap-0.5">
                <p className="text-xs font-medium text-muted-foreground">Período</p>
                {isSameDay ? (
                  <p className="text-sm">
                    {format(dateFrom, "d 'de' MMMM 'de' yyyy", { locale: ptBR })}
                  </p>
                ) : (
                  <p className="text-sm">
                    {format(dateFrom, "d 'de' MMM", { locale: ptBR })}
                    {" – "}
                    {format(dateTo, "d 'de' MMMM 'de' yyyy", { locale: ptBR })}
                  </p>
                )}
              </div>
            </div>

            {/* Horários */}
            <div className="flex items-start gap-3">
              <Clock className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
              <div className="flex flex-col gap-0.5">
                <p className="text-xs font-medium text-muted-foreground">Horários</p>
                <div className="flex flex-col gap-1">
                  {data.schedules.map((key) => (
                    <p key={key} className="text-sm">
                      {scheduleKeyToLabel(key)}
                    </p>
                  ))}
                </div>
              </div>
            </div>

            {/* Propósito */}
            <div className="flex items-start gap-3">
              <BookOpen className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
              <div className="flex flex-col gap-0.5">
                <p className="text-xs font-medium text-muted-foreground">Propósito</p>
                <p className="text-sm leading-relaxed">{data.purpose}</p>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
