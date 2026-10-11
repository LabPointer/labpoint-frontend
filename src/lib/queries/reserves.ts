import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { endOfMonth, format, parseISO, startOfMonth, startOfToday } from "date-fns";
import type { ReservationStatus } from "#/lib/types/reservation-types";
import type { components } from "#/lib/utils/api";
import { assertOk, unwrapList } from "#/lib/utils/api-result";
import { notifyError, notifySuccess } from "#/lib/utils/notify";
import { api } from "#/lib/utils/restapi";
import type { Schedule } from "./schedules";

export type Reserve = components["schemas"]["SpaceReserveResponseDTO"];

/**
 * ATENÇÃO — valores presumidos de `EReserveStatus` (o api.ts só diz `number`).
 * Segui a ordem do enum antigo (CONFIRMED, PENDING, ABSENT, LOCKED, CANCELED).
 * Se o enum do backend tiver outra ordem, ajuste SOMENTE este mapa.
 */
export const RESERVE_STATUS: Record<ReservationStatus, number> = {
  CONFIRMED: 0,
  PENDING: 1,
  ABSENT: 2,
  LOCKED: 3,
  CANCELED: 4,
};

export function statusFromNumber(status: number | string): ReservationStatus {
  const entry = Object.entries(RESERVE_STATUS).find(([, value]) => value === Number(status));
  return (entry?.[0] as ReservationStatus | undefined) ?? "PENDING";
}

export type ReserveTab = "next" | "concluded" | "canceled";

/** Próximas = ainda não terminaram; Concluídas = já terminaram; Canceladas = status cancelado. */
export function reserveTab(reserve: Reserve, today = startOfToday()): ReserveTab {
  if (statusFromNumber(reserve.status) === "CANCELED") return "canceled";
  return parseISO(reserve.dateTo) < today ? "concluded" : "next";
}

export const toApiDate = (date: Date) => format(date, "yyyy-MM-dd");

export const reserveKeys = {
  all: ["reserves"] as const,
  month: (year: number, month: number) => [...reserveKeys.all, "month", year, month] as const,
  existingSchedules: (spaceId: number, startAt: string, endAt: string) =>
    [...reserveKeys.all, "existing-schedules", spaceId, startAt, endAt] as const,
};

/** Reservas do usuário que tocam o mês informado (`month` de 0 a 11). */
export function useMonthReserves({ year, month }: { year: number; month: number }) {
  const first = startOfMonth(new Date(year, month, 1));
  const startAt = toApiDate(first);
  const endAt = toApiDate(endOfMonth(first));

  return useQuery({
    queryKey: reserveKeys.month(year, month),
    queryFn: async ({ signal }) =>
      // O api.ts tipa o 200 de GET /space-reserve como SpaceResponseDTO[], mas o corpo real é de reservas.
      unwrapList(
        await api.GET("/space-reserve", { params: { query: { StartAt: startAt, EndAt: endAt } }, signal }),
        "Erro ao buscar reservas.",
      ) as unknown as Reserve[],
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
