import { parseISO, addDays } from "date-fns";
import { Schedules } from "#/lib/service";
import type { CalendarEvent } from "#/components/reui/event-calendar/event-calendar-types.tsx";
import type {
  ReservationEventData,
  ReservationStatus,
  ReserveHistoryDTO,
  ReserveScheduleDTO,
  ScheduleKey,
} from "#/components/calendar/reservation-types";

// ---------------------------------------------------------------------------
// Status → Cor (CSS var do Tailwind)
// ---------------------------------------------------------------------------

const STATUS_COLOR_MAP: Record<ReservationStatus, string> = {
  CONFIRMED: "var(--color-emerald-500)",
  PENDING: "var(--color-amber-500)",
  ABSENT: "var(--color-orange-500)",
  LOCKED: "var(--color-blue-500)",
  CANCELED: "var(--color-rose-500)",
};

export function statusToColor(status: ReservationStatus): string {
  return STATUS_COLOR_MAP[status] ?? "var(--color-slate-500)";
}

// ---------------------------------------------------------------------------
// Status → Label PT-BR
// ---------------------------------------------------------------------------

const STATUS_LABEL_MAP: Record<ReservationStatus, string> = {
  CONFIRMED: "Confirmado",
  PENDING: "Pendente",
  ABSENT: "Ausente",
  LOCKED: "Bloqueado",
  CANCELED: "Cancelado",
};

export function statusLabel(status: ReservationStatus): string {
  return STATUS_LABEL_MAP[status] ?? status;
}

// ---------------------------------------------------------------------------
// Status → classe de variante para badge/botão
// ---------------------------------------------------------------------------

export function statusVariantClass(status: ReservationStatus): string {
  const map: Record<ReservationStatus, string> = {
    CONFIRMED: "bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border-emerald-500/30",
    PENDING: "bg-amber-500/20 text-amber-600 dark:text-amber-400 border-amber-500/30",
    ABSENT: "bg-orange-500/20 text-orange-600 dark:text-orange-400 border-orange-500/30",
    LOCKED: "bg-blue-500/20 text-blue-600 dark:text-blue-400 border-blue-500/30",
    CANCELED: "bg-rose-500/20 text-rose-600 dark:text-rose-400 border-rose-500/30",
  };
  return map[status] ?? "bg-slate-500/20 text-slate-600 dark:text-slate-400 border-slate-500/30";
}

// ---------------------------------------------------------------------------
// Conversão de schedule key para label legível
// ---------------------------------------------------------------------------

export function scheduleKeyToLabel(key: ScheduleKey): string {
  return Schedules.get(key) ?? key;
}

// ---------------------------------------------------------------------------
// Converte um ReserveScheduleDTO em CalendarEvent
// ---------------------------------------------------------------------------

function dtoToEvent(
  dto: ReserveScheduleDTO
): CalendarEvent<ReservationEventData> {
  const { reserve, schedules } = dto;
  const startDate = parseISO(reserve.reservedDateFrom);
  // end é exclusivo no EventCalendar: último dia + 1
  const endDate = addDays(parseISO(reserve.reservedDateTo), 1);

  return {
    id: String(reserve.id),
    title: reserve.spaceName,
    start: startDate,
    end: endDate,
    allDay: true,
    color: statusToColor(reserve.status),
    // Desabilita drag e resize explicitamente por evento
    draggable: false,
    resizable: false,
    readOnly: true,
    data: {
      reserveId: reserve.id,
      spaceName: reserve.spaceName,
      status: reserve.status,
      purpose: reserve.purpose,
      schedules: schedules as ScheduleKey[],
      reservedDateFrom: reserve.reservedDateFrom,
      reservedDateTo: reserve.reservedDateTo,
    },
  };
}

// ---------------------------------------------------------------------------
// Converte ReserveHistoryDTO inteiro em array de CalendarEvent
// ---------------------------------------------------------------------------

export function apiToCalendarEvents(
  dto: ReserveHistoryDTO
): CalendarEvent<ReservationEventData>[] {
  const allDtos: ReserveScheduleDTO[] = [
    ...(dto.next ?? []),
    ...(dto.concluded ?? []),
    ...(dto.canceled ?? []),
  ];

  return allDtos.map(dtoToEvent);
}

// ---------------------------------------------------------------------------
// Formata o yearMonth para o parâmetro da API ("YYYY-MM")
// ---------------------------------------------------------------------------

export function toYearMonth(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  return `${y}-${m}`;
}
