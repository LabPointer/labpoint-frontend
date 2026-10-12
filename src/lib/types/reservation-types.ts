import type { Schedule } from "#/lib/queries/schedules";

/** Status de uma reserva, em texto (convertido de `EReserveStatus` por `statusFromNumber`). */
export type ReservationStatus = "BOOKING" | "CONFIRMED" | "CANCELED" | "REJECTED" | "BLOCKED";

/** Dados extras armazenados em CalendarEvent.data para eventos de reserva */
export interface ReservationEventData {
  reserveId: number;
  spaceName: string;
  status: ReservationStatus;
  purpose: string;
  schedules: Schedule[];
  reservedDateFrom: string;
  reservedDateTo: string;
}
