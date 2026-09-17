import { ReservationEventModal } from "#/components/calendar/ReservationEventModal";
import type { ReservationEventData } from "#/lib/types/reservation-types";
import { statusLabel, statusVariantClass } from "#/lib/utils/reservation-utils";
import { cn } from "#/lib/utils.ts";

interface AgendaEventRowProps {
  data: ReservationEventData;
}

/**
 * Conteúdo da linha de evento para a visualização de Agenda.
 * Renderizado dentro do wrapper do EventCalendar via `renderAgendaEvent`.
 *
 * Exibe:
 * - Dot colorido (cor do status via --ec-event-color)
 * - Nome da sala
 * - Badge de status
 * - Botão com ícone de exclamação que abre o modal de detalhes
 *
 * Ocupa a mesma linha que o gutter de data do calendário de agenda.
 */
export function AgendaEventRow({ data }: AgendaEventRowProps) {
  return (
    // O wrapper usa `flex w-full` para se encaixar na linha do EventCalendar
    <span className="flex w-full min-w-0 items-center gap-2">
      {/* Dot colorido — cor flui do CSS var --ec-event-color definido pelo calendário */}
      <span
        aria-hidden
        data-slot="event-calendar-agenda-dot"
        className="size-2 shrink-0 rounded-full bg-(--ec-event-color)"
      />

      {/* Nome da sala */}
      <span className="min-w-0 flex-1 truncate text-sm font-medium">{data.spaceName}</span>

      {/* Badge de status */}
      <span
        className={cn(
          "shrink-0 rounded border px-1.5 py-0.5 text-[10px] font-semibold",
          statusVariantClass(data.status),
        )}
      >
        {statusLabel(data.status)}
      </span>

      {/* Botão "!" que abre o modal de detalhes */}
      <ReservationEventModal data={data} />
    </span>
  );
}
