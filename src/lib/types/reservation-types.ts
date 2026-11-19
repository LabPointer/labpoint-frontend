import type { Schedule } from "#/lib/queries/schedules";

/** Status de uma reserva, em texto (convertido de `EReserveStatus` por `statusFromNumber`). */
export type ReservationStatus = "BOOKING" | "CONFIRMED" | "CANCELED" | "REJECTED" | "BLOCKED";

/** Recurso reservado, exibido no card do calendário. */
export interface ReservedResourceSummary {
  name: string;
  quantity: number;
  status: ReservationStatus;
}

/** Dados extras armazenados em CalendarEvent.data para eventos de reserva */
export interface ReservationEventData {
  reserveId: number;
  /** `space` = reserva de sala (com os recursos vinculados); `resource` = reserva avulsa de recurso. */
  kind: "space" | "resource";
  /** Título do card: nome da sala ou, na reserva avulsa, do recurso. */
  spaceName: string;
  status: ReservationStatus;
  purpose: string;
  schedules: Schedule[];
  reservedDateFrom: string;
  reservedDateTo: string;
  /** Sala: recursos reservados junto com ela. Recurso avulso: o próprio recurso e a quantidade. */
  resources: ReservedResourceSummary[];
}
