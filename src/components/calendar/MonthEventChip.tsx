import { Package } from "lucide-react";
import { ReservationEventPopup } from "#/components/calendar/ReservationEventPopup";
import type { ReservationEventData } from "#/lib/types/reservation-types";
import { statusLabel, statusVariantClass } from "#/lib/utils/reservation-utils";
import { cn } from "#/lib/utils.ts";

interface MonthEventChipProps {
  data: ReservationEventData;
}

/**
 * Conteúdo do chip para a visualização de Mês.
 * Renderizado dentro do wrapper do EventCalendar via `renderEvent`.
 * Exibe o nome da sala e um badge de status colorido.
 * Ao clicar, abre o popup com os detalhes da reserva.
 *
 * IMPORTANTE: Este componente retorna o conteúdo do chip (não o wrapper),
 * conforme a API do `renderEvent` do EventCalendar.
 */
export function MonthEventChip({ data }: MonthEventChipProps) {
  const trigger = (
    // Wrapper flex que ocupa toda a largura do chip
    <span className="flex w-full min-w-0 cursor-pointer items-center gap-1.5">
      {/* Dot colorido com a cor do status (flui de --ec-event-color) */}
      <span aria-hidden className="-me-0.5 size-1.5 shrink-0 rounded-full bg-(--ec-event-color)" />
      {/* Nome da sala (ou do recurso, na reserva avulsa) */}
      {data.kind === "resource" && <Package aria-label="Recurso" className="size-3 shrink-0 text-muted-foreground" />}
      <span className="truncate font-medium text-xs">{data.spaceName}</span>
      {data.kind === "space" && data.resources.length > 0 && (
        <span className="shrink-0 text-[10px] text-muted-foreground" title="Recursos reservados junto">
          +{data.resources.length}
        </span>
      )}
      {/* Badge de status */}
      <span
        className={cn(
          "ms-auto shrink-0 rounded border px-1 text-[10px] font-semibold",
          statusVariantClass(data.status),
        )}
      >
        {statusLabel(data.status)}
      </span>
    </span>
  );

  return <ReservationEventPopup data={data} trigger={trigger} />;
}
