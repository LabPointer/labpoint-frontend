import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import { BookOpen, CalendarDays, Clock } from "lucide-react";
import type { ReactNode } from "react";
import { Badge } from "#/components/ui/badge.tsx";
import { Popover, PopoverContent, PopoverTrigger } from "#/components/ui/popover.tsx";
import { Separator } from "#/components/ui/separator.tsx";
import type { ReservationEventData } from "#/lib/types/reservation-types";
import { scheduleKeyToLabel, statusLabel, statusVariantClass } from "#/lib/utils/reservation-utils";
import { cn } from "#/lib/utils.ts";

interface ReservationEventPopupProps {
  data: ReservationEventData;
  /** Elemento que dispara o popover (chip no calendário mensal) */
  trigger: ReactNode;
}

/**
 * Popup de detalhes de reserva para a visualização de mês.
 * Abre ao clicar no chip do evento no grid mensal.
 */
export function ReservationEventPopup({ data, trigger }: ReservationEventPopupProps) {
  const dateFrom = parseISO(data.reservedDateFrom);
  const dateTo = parseISO(data.reservedDateTo);
  const isSameDay = data.reservedDateFrom === data.reservedDateTo;

  return (
    <Popover>
      <PopoverTrigger>{trigger}</PopoverTrigger>
      <PopoverContent
        className="w-72 p-0 shadow-lg"
        align="start"
        sideOffset={6}
        // Impede que o clique no trigger propague e cause conflito com o
        // handler de seleção do calendário
        onClick={(e) => e.stopPropagation()}
      >
        {/* Cabeçalho colorido com nome da sala e status */}
        <div
          className="rounded-t-md px-4 py-3"
          style={{ backgroundColor: `color-mix(in srgb, ${getStatusBgColor(data.status)} 15%, transparent)` }}
        >
          <p className="text-sm font-semibold leading-tight">{data.spaceName}</p>
          <Badge variant="outline" className={cn("mt-1 text-xs font-medium", statusVariantClass(data.status))}>
            {statusLabel(data.status)}
          </Badge>
        </div>

        <div className="flex flex-col gap-3 p-4">
          {/* Datas */}
          <div className="flex items-start gap-2">
            <CalendarDays className="mt-0.5 size-3.5 shrink-0 text-muted-foreground" />
            <div className="text-xs text-foreground">
              {isSameDay ? (
                <span>{format(dateFrom, "d 'de' MMMM 'de' yyyy", { locale: ptBR })}</span>
              ) : (
                <span>
                  {format(dateFrom, "d 'de' MMM", { locale: ptBR })}
                  {" – "}
                  {format(dateTo, "d 'de' MMMM 'de' yyyy", { locale: ptBR })}
                </span>
              )}
            </div>
          </div>

          <Separator />

          {/* Horários */}
          <div className="flex items-start gap-2">
            <Clock className="mt-0.5 size-3.5 shrink-0 text-muted-foreground" />
            <div className="flex flex-col gap-1">
              {data.schedules.map((key) => (
                <span key={key} className="text-xs text-foreground">
                  {scheduleKeyToLabel(key)}
                </span>
              ))}
            </div>
          </div>

          <Separator />

          {/* Propósito */}
          <div className="flex items-start gap-2">
            <BookOpen className="mt-0.5 size-3.5 shrink-0 text-muted-foreground" />
            <p className="text-xs text-foreground leading-relaxed">{data.purpose}</p>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}

// Cor de fundo do header do popup, derivada do status
function getStatusBgColor(status: ReservationEventData["status"]): string {
  const map: Record<string, string> = {
    CONFIRMED: "var(--color-emerald-500)",
    PENDING: "var(--color-amber-500)",
    ABSENT: "var(--color-orange-500)",
    LOCKED: "var(--color-blue-500)",
    CANCELED: "var(--color-rose-500)",
  };
  return map[status] ?? "var(--color-slate-500)";
}
