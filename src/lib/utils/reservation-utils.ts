import { addDays, parseISO } from "date-fns";
import type { CalendarEvent } from "#/components/reui/event-calendar/event-calendar-types.tsx";
import { type Reserve, statusFromNumber } from "#/lib/queries/reserves";
import { sortSchedules } from "#/lib/queries/schedules";
import type { ReservationEventData, ReservationStatus } from "#/lib/types/reservation-types";

// ---------------------------------------------------------------------------
// Status → Cor (CSS var do Tailwind)
// ---------------------------------------------------------------------------

const STATUS_COLOR_MAP: Record<ReservationStatus, string> = {
  BOOKING: "var(--color-amber-500)",
  CONFIRMED: "var(--color-emerald-500)",
  CANCELED: "var(--color-rose-500)",
  REJECTED: "var(--color-orange-500)",
  BLOCKED: "var(--color-blue-500)",
};

export function statusToColor(status: ReservationStatus): string {
  return STATUS_COLOR_MAP[status] ?? "var(--color-slate-500)";
}

// ---------------------------------------------------------------------------
// Status → Label PT-BR
// ---------------------------------------------------------------------------

const STATUS_LABEL_MAP: Record<ReservationStatus, string> = {
  BOOKING: "Pendente",
  CONFIRMED: "Confirmada",
  CANCELED: "Cancelada",
  REJECTED: "Recusada",
  BLOCKED: "Bloqueada",
};

export function statusLabel(status: ReservationStatus): string {
  return STATUS_LABEL_MAP[status] ?? status;
}

// ---------------------------------------------------------------------------
// Status → classe de variante para badge/botão
// ---------------------------------------------------------------------------

export function statusVariantClass(status: ReservationStatus): string {
  const map: Record<ReservationStatus, string> = {
    BOOKING: "bg-amber-500/20 text-amber-600 dark:text-amber-400 border-amber-500/30",
    CONFIRMED: "bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border-emerald-500/30",
    CANCELED: "bg-rose-500/20 text-rose-600 dark:text-rose-400 border-rose-500/30",
    REJECTED: "bg-orange-500/20 text-orange-600 dark:text-orange-400 border-orange-500/30",
    BLOCKED: "bg-blue-500/20 text-blue-600 dark:text-blue-400 border-blue-500/30",
  };
  return map[status] ?? "bg-slate-500/20 text-slate-600 dark:text-slate-400 border-slate-500/30";
}

// ---------------------------------------------------------------------------
// Converte uma reserva da API em CalendarEvent
// ---------------------------------------------------------------------------

function reserveToEvent(reserve: Reserve): CalendarEvent<ReservationEventData> {
  const status = statusFromNumber(reserve.status);
  const startDate = parseISO(reserve.dateFrom);
  // end é exclusivo no EventCalendar: último dia + 1
  const endDate = addDays(parseISO(reserve.dateTo), 1);

  return {
    id: String(reserve.id),
    title: reserve.space.name,
    start: startDate,
    end: endDate,
    allDay: true,
    color: statusToColor(status),
    // Desabilita drag e resize explicitamente por evento
    draggable: false,
    resizable: false,
    readOnly: true,
    data: {
      reserveId: Number(reserve.id),
      spaceName: reserve.space.name,
      status,
      purpose: reserve.purpose,
      schedules: sortSchedules(reserve.schedules),
      reservedDateFrom: reserve.dateFrom,
      reservedDateTo: reserve.dateTo,
    },
  };
}

export function reservesToCalendarEvents(reserves: Reserve[]): CalendarEvent<ReservationEventData>[] {
  return reserves.map(reserveToEvent);
}
