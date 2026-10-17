import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { addDays, endOfMonth, format, parseISO, startOfMonth, startOfToday } from "date-fns";
import { useCallback } from "react";
import type { ReservationStatus } from "#/lib/types/reservation-types";
import type { components } from "#/lib/utils/api";
import { assertOk, unwrapList } from "#/lib/utils/api-result";
import { notifyError, notifySuccess } from "#/lib/utils/notify";
import { api } from "#/lib/utils/restapi";
import type { Schedule } from "./schedules";

export type Reserve = components["schemas"]["SpaceReserveResponseDTO"];

/** Valores de `EReserveStatus` no backend (Models/Types.cs): Booking, Confirmed, Canceled, Rejected, Blocked. */
export const RESERVE_STATUS: Record<ReservationStatus, number> = {
  BOOKING: 0,
  CONFIRMED: 1,
  CANCELED: 2,
  REJECTED: 3,
  BLOCKED: 4,
};

export function statusFromNumber(status: number | string): ReservationStatus {
  const entry = Object.entries(RESERVE_STATUS).find(([, value]) => value === Number(status));
  return (entry?.[0] as ReservationStatus | undefined) ?? "BOOKING";
}

export type ReserveTab = "next" | "concluded" | "canceled";

/**
 * Próximas = ainda não terminaram; Concluídas = já terminaram;
 * Canceladas = status que não estão mais ativos (cancelada, recusada ou bloqueada).
 */
export function reserveTab(reserve: Reserve, today = startOfToday()): ReserveTab {
  const status = statusFromNumber(reserve.status);
  if (status === "CANCELED" || status === "REJECTED") return "canceled";
  return parseISO(reserve.dateTo) < today ? "concluded" : "next";
}

export const toApiDate = (date: Date) => format(date, "yyyy-MM-dd");

export const reserveKeys = {
  all: ["reserves"] as const,
  month: (year: number, month: number) => [...reserveKeys.all, "month", year, month] as const,
  range: (startAt: string, endAt: string, status: number | undefined) =>
    [...reserveKeys.all, "range", startAt, endAt, status] as const,
  existingSchedules: (spaceId: number, startAt: string, endAt: string) =>
    [...reserveKeys.all, "existing-schedules", spaceId, startAt, endAt] as const,
};

/** Reservas mais longas que isso podem ficar de fora da janela do mês (a UI limita a reserva a 30 dias). */
const MAX_RESERVE_DAYS = 30;

/**
 * Reservas do usuário que tocam o mês informado (`month` de 0 a 11).
 *
 * O backend filtra por CONTENÇÃO (`DateFrom >= StartAt && DateTo <= EndAt`), então uma reserva que cruza a virada
 * do mês não apareceria em nenhuma das duas consultas. Pedimos uma janela maior e filtramos a sobreposição aqui.
 */
export function useMonthReserves({ year, month }: { year: number; month: number }) {
  const first = startOfMonth(new Date(year, month, 1));
  const last = endOfMonth(first);
  const startAt = toApiDate(addDays(first, -MAX_RESERVE_DAYS));
  const endAt = toApiDate(addDays(last, MAX_RESERVE_DAYS));
  const monthStart = toApiDate(first);
  const monthEnd = toApiDate(last);

  const select = useCallback(
    (reserves: Reserve[]) => reserves.filter((reserve) => reserve.dateFrom <= monthEnd && reserve.dateTo >= monthStart),
    [monthStart, monthEnd],
  );

  return useQuery({
    queryKey: reserveKeys.month(year, month),
    queryFn: async ({ signal }) =>
      // O api.ts tipa o 200 de GET /space-reserve como SpaceResponseDTO[] (anotação errada no controller),
      // mas o corpo real é SpaceReserveResponseDTO[].
      unwrapList(
        await api.GET("/space-reserve", { params: { query: { StartAt: startAt, EndAt: endAt } }, signal }),
        "Erro ao buscar reservas.",
      ) as unknown as Reserve[],
    select,
    placeholderData: keepPreviousData,
  });
}

/**
 * Reservas do usuário que tocam o período `startAt`–`endAt` (yyyy-MM-dd), opcionalmente de um único status.
 * Mesma estratégia de `useMonthReserves`: janela maior no backend (que filtra por contenção) e sobreposição filtrada aqui.
 */
export function useRangeReserves({ startAt, endAt, status }: { startAt: string; endAt: string; status?: number }) {
  const windowStart = toApiDate(addDays(parseISO(startAt), -MAX_RESERVE_DAYS));
  const windowEnd = toApiDate(addDays(parseISO(endAt), MAX_RESERVE_DAYS));

  const select = useCallback(
    (reserves: Reserve[]) => reserves.filter((reserve) => reserve.dateFrom <= endAt && reserve.dateTo >= startAt),
    [startAt, endAt],
  );

  return useQuery({
    queryKey: reserveKeys.range(startAt, endAt, status),
    queryFn: async ({ signal }) =>
      unwrapList(
        await api.GET("/space-reserve", {
          params: { query: { StartAt: windowStart, EndAt: windowEnd, Status: status } },
          signal,
        }),
        "Erro ao buscar reservas.",
      ) as unknown as Reserve[],
    select,
    placeholderData: keepPreviousData,
  });
}

/** Horários já ocupados do espaço no período (`to` ausente = um único dia). */
export function useExistingSchedules(spaceId: number, range: { from?: Date; to?: Date } | undefined) {
  const from = range?.from;
  const startAt = from ? toApiDate(from) : "";
  const endAt = from ? toApiDate(range?.to ?? from) : "";

  return useQuery({
    queryKey: reserveKeys.existingSchedules(spaceId, startAt, endAt),
    queryFn: async ({ signal }): Promise<Schedule[]> =>
      unwrapList(
        await api.GET("/space-reserve/existing-schedules/{spaceId}", {
          params: { path: { spaceId }, query: { StartAt: startAt, EndAt: endAt } },
          signal,
        }),
        "Erro ao buscar horários ocupados.",
      ),
    enabled: Boolean(from),
  });
}

export function useCreateReserve() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      spaceId,
      body,
    }: {
      spaceId: number;
      body: components["schemas"]["SpaceReserveCreateRequestDTO"];
    }) => assertOk(await api.POST("/space-reserve/create/{spaceId}", { params: { path: { spaceId } }, body })),
    onSuccess: () => {
      notifySuccess("Reserva criada com sucesso!");
      return queryClient.invalidateQueries({ queryKey: reserveKeys.all });
    },
    onError: notifyError,
  });
}

export function useEditReserve() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      reserveId,
      body,
    }: {
      reserveId: number;
      body: components["schemas"]["SpaceReserveEditRequestDTO"];
    }) => assertOk(await api.PATCH("/space-reserve/edit/{reserveId}", { params: { path: { reserveId } }, body })),
    onSuccess: () => {
      notifySuccess("Reserva atualizada com sucesso!");
      return queryClient.invalidateQueries({ queryKey: reserveKeys.all });
    },
    onError: notifyError,
  });
}

export function useCancelReserve() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: number) =>
      assertOk(await api.DELETE("/space-reserve/cancel/{id}", { params: { path: { id } } })),
    onSuccess: () => {
      notifySuccess("Reserva cancelada com sucesso!");
      return queryClient.invalidateQueries({ queryKey: reserveKeys.all });
    },
    onError: notifyError,
  });
}
