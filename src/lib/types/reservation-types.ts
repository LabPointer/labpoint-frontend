import type { components } from "#/lib/utils/api";

/** Tipo de status vindo da API */
export type ReservationStatus =
  | "CONFIRMED"
  | "PENDING"
  | "ABSENT"
  | "LOCKED"
  | "CANCELED";

/** Tipo de chave de horário vindo da API */
export type ScheduleKey =
  | "M_AULA_1"
  | "M_AULA_2"
  | "M_AULA_3"
  | "M_AULA_4"
  | "M_AULA_5"
  | "V_AULA_1"
  | "V_AULA_2"
  | "V_AULA_3"
  | "V_AULA_4"
  | "V_AULA_5"
  | "N_AULA_1"
  | "N_AULA_2"
  | "N_AULA_3"
  | "N_AULA_4";

/** Dados extras armazenados em CalendarEvent.data para eventos de reserva */
export interface ReservationEventData {
  reserveId: number;
  spaceName: string;
  status: ReservationStatus;
  purpose: string;
  schedules: ScheduleKey[];
  reservedDateFrom: string;
  reservedDateTo: string;
}

/** DTO resumido de reserva — espelha ReserveSummaryDTO da API */
export type ReserveSummaryDTO =
  components["schemas"]["ReserveSummaryDTO"];

/** DTO de reserva com horários — espelha ReserveScheduleDTO da API */
export type ReserveScheduleDTO =
  components["schemas"]["ReserveScheduleDTO"];

/** DTO do histórico — espelha ReserveHistoryDTO da API */
export type ReserveHistoryDTO =
  components["schemas"]["ReserveHistoryDTO"];
