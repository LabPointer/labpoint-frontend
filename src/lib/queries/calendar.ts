import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { components } from "#/lib/utils/api";
import { assertOk, unwrap, unwrapList } from "#/lib/utils/api-result";
import { notifyError, notifySuccess } from "#/lib/utils/notify";
import { api } from "#/lib/utils/restapi";
import { invalidateReservations, toApiDate } from "./reserves";

export type CalendarDay = components["schemas"]["CalendarDayResponseDTO"];
export type Holiday = components["schemas"]["HolidayResponseDTO"];
export type AffectedReserves = components["schemas"]["AffectedReservesResponseDTO"];

/** Valores de `EHolidaySource` no backend (Models/Types.cs). */
export const HOLIDAY_SOURCE = { NATIONAL: 0, STATE: 1, MUNICIPAL: 2, CUSTOM: 3 } as const;

const HOLIDAY_SOURCE_LABELS: Record<number, string> = {
  [HOLIDAY_SOURCE.NATIONAL]: "Nacional",
  [HOLIDAY_SOURCE.STATE]: "Estadual",
  [HOLIDAY_SOURCE.MUNICIPAL]: "Municipal",
  [HOLIDAY_SOURCE.CUSTOM]: "Extra",
};

export const holidaySourceLabel = (source: number | string) => HOLIDAY_SOURCE_LABELS[Number(source)] ?? "—";

export const calendarKeys = {
  all: ["calendar"] as const,
  days: (startAt: string, endAt: string) => [...calendarKeys.all, "days", startAt, endAt] as const,
  affected: (date: string) => [...calendarKeys.all, "affected", date] as const,
};

/** "yyyy-MM-dd" → Date local (sem o deslocamento de fuso do `new Date("yyyy-MM-dd")`). */
export const parseApiDate = (value: string) => {
  const [year, month, day] = value.split("-").map(Number);
  return new Date(year, month - 1, day);
};

/** Fins de semana, feriados e liberações de cada dia do período (no máximo 400 dias). */
export function useCalendarDays(range: { startAt: Date; endAt: Date }, options: { enabled?: boolean } = {}) {
  const startAt = toApiDate(range.startAt);
  const endAt = toApiDate(range.endAt);
  return useQuery({
    queryKey: calendarKeys.days(startAt, endAt),
    queryFn: async ({ signal }) =>
      unwrapList(
        await api.GET("/calendar/days", { params: { query: { StartAt: startAt, EndAt: endAt } }, signal }),
        "Erro ao carregar o calendário.",
      ),
    enabled: options.enabled ?? true,
    placeholderData: keepPreviousData,
    staleTime: 5 * 60_000,
  });
}

/** Reservas ativas que usam a data (para decidir entre manter e cancelar ao bloquear de novo). */
export function useAffectedReserves(date: string | null) {
  return useQuery({
    queryKey: calendarKeys.affected(date ?? ""),
    queryFn: async ({ signal }) =>
      unwrap(
        await api.GET("/calendar/admin/affected", { params: { query: { date: date ?? "" } }, signal }),
        "Erro ao buscar as reservas do dia.",
      ),
    enabled: date !== null,
  });
}

/** Mudanças no calendário mexem em quais dias as reservas usam: atualiza calendário e reservas. */
function useInvalidateCalendar() {
  const queryClient = useQueryClient();
  return () =>
    Promise.all([queryClient.invalidateQueries({ queryKey: calendarKeys.all }), invalidateReservations(queryClient)]);
}

export function useReleaseDates() {
  const invalidate = useInvalidateCalendar();
  return useMutation({
    mutationFn: async (dates: string[]) => assertOk(await api.POST("/calendar/admin/release", { body: { dates } })),
    onSuccess: (_, dates) => {
      notifySuccess(
        dates.length === 1 ? "Data liberada para reservas." : `${dates.length} datas liberadas para reservas.`,
      );
      return invalidate();
    },
    onError: notifyError,
  });
}

export function useRevokeDate() {
  const invalidate = useInvalidateCalendar();
  return useMutation({
    mutationFn: async (body: components["schemas"]["RevokeDateRequestDTO"]) =>
      assertOk(await api.POST("/calendar/admin/revoke", { body })),
    onSuccess: (_, body) => {
      notifySuccess(body.keepReserves ? "Data bloqueada; as reservas existentes foram mantidas." : "Data bloqueada.");
      return invalidate();
    },
    onError: notifyError,
  });
}

export function useAddHoliday() {
  const invalidate = useInvalidateCalendar();
  return useMutation({
    mutationFn: async (body: components["schemas"]["HolidayCreateRequestDTO"]) =>
      assertOk(await api.POST("/calendar/admin/holiday", { body })),
    onSuccess: () => {
      notifySuccess("Feriado cadastrado.");
      return invalidate();
    },
    onError: notifyError,
  });
}

export function useRemoveHoliday() {
  const invalidate = useInvalidateCalendar();
  return useMutation({
    mutationFn: async (holidayId: number) =>
      assertOk(await api.DELETE("/calendar/admin/holiday/{holidayId}", { params: { path: { holidayId } } })),
    onSuccess: () => {
      notifySuccess("Feriado removido.");
      return invalidate();
    },
    onError: notifyError,
  });
}
