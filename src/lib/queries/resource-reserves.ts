import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { endOfMonth, startOfMonth } from "date-fns";
import type { components } from "#/lib/utils/api";
import { assertOk, unwrapList } from "#/lib/utils/api-result";
import { notifyError, notifySuccess } from "#/lib/utils/notify";
import { api } from "#/lib/utils/restapi";
import { invalidateReservations, RESERVE_STATUS, reserveKeys, toApiDate } from "./reserves";

export type ResourceReserve = components["schemas"]["ResourceReserveResponseDTO"];
export type AdminResourceReserve = components["schemas"]["AdminResourceReserveResponseDTO"];
/** Recurso vinculado a uma reserva de sala (vem dentro da reserva de sala). */
export type LinkedResource = components["schemas"]["LinkedResourceDTO"];

export type MyResourceReserveParams = {
  /** nome ou descrição do recurso */
  search?: string;
  /** yyyy-MM-dd; filtra por sobreposição com o período */
  startAt?: string;
  endAt?: string;
  scheduleIds?: number[];
  status?: number;
  /** `true` = só avulsas; `false` = só vinculadas a uma sala */
  standalone?: boolean;
  limit?: number;
  offset?: number;
};

export type AdminResourceReserveParams = {
  search?: string;
  /** yyyy-MM-dd (obrigatório no backend) */
  startAt: string;
  endAt: string;
  spaceIds?: number[];
  accountIds?: string[];
  status?: number;
  limit?: number;
  offset?: number;
};

export const resourceReserveKeys = {
  mine: (params: MyResourceReserveParams) => [...reserveKeys.all, "resource", "mine", params] as const,
  admin: (params: AdminResourceReserveParams) => [...reserveKeys.all, "resource", "admin", params] as const,
};

/** Minhas reservas de recurso. O backend devolve até `limit + 1` (o extra indica a próxima página). */
export function useMyResourceReserves(params: MyResourceReserveParams, options: { enabled?: boolean } = {}) {
  const { search, startAt, endAt, scheduleIds, status, standalone, limit = 30, offset = 0 } = params;

  return useQuery({
    queryKey: resourceReserveKeys.mine({
      search: search || undefined,
      startAt,
      endAt,
      scheduleIds: scheduleIds?.length ? scheduleIds : undefined,
      status,
      standalone,
      limit,
      offset,
    }),
    queryFn: async ({ signal }) =>
      unwrapList(
        await api.GET("/resource-reserve", {
          params: {
            query: {
              SearchQuery: search || undefined,
              StartAt: startAt,
              EndAt: endAt,
              ScheduleIds: scheduleIds?.length ? scheduleIds : undefined,
              Status: status,
              Standalone: standalone,
              Limit: limit,
              Offset: offset,
            },
          },
          signal,
        }),
        "Erro ao buscar reservas de recurso.",
      ),
    enabled: options.enabled ?? true,
    placeholderData: keepPreviousData,
  });
}

/** Mais que o suficiente para um mês; o backend aceita até 500. */
const MONTH_LIMIT = 500;

/** Reservas AVULSAS de recurso do usuário que tocam o mês (`month` de 0 a 11). O backend já filtra por sobreposição. */
export function useMonthResourceReserves({ year, month }: { year: number; month: number }) {
  const first = startOfMonth(new Date(year, month, 1));
  return useMyResourceReserves({
    startAt: toApiDate(first),
    endAt: toApiDate(endOfMonth(first)),
    standalone: true,
    limit: MONTH_LIMIT,
  });
}

export function useAdminResourceReserves(params: AdminResourceReserveParams, options: { enabled?: boolean } = {}) {
  const { search, startAt, endAt, spaceIds, accountIds, status, limit = 30, offset = 0 } = params;

  return useQuery({
    queryKey: resourceReserveKeys.admin({
      search: search || undefined,
      startAt,
      endAt,
      spaceIds: spaceIds?.length ? spaceIds : undefined,
      accountIds: accountIds?.length ? accountIds : undefined,
      status,
      limit,
      offset,
    }),
    queryFn: async ({ signal }) =>
      unwrapList(
        await api.GET("/resource-reserve/admin", {
          params: {
            query: {
              SearchQuery: search || undefined,
              StartAt: startAt,
              EndAt: endAt,
              SpaceIds: spaceIds?.length ? spaceIds : undefined,
              AccountIds: accountIds?.length ? accountIds : undefined,
              Status: status,
              Limit: limit,
              Offset: offset,
            },
          },
          signal,
        }),
        "Erro ao buscar reservas de recurso.",
      ),
    enabled: options.enabled ?? true,
    placeholderData: keepPreviousData,
  });
}

export function useCreateResourceReserve() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      resourceId,
      body,
    }: {
      resourceId: number;
      body: components["schemas"]["ResourceReserveCreateRequestDTO"];
    }) => assertOk(await api.POST("/resource-reserve/create/{resourceId}", { params: { path: { resourceId } }, body })),
    onSuccess: () => {
      notifySuccess("Recurso reservado com sucesso!");
      return invalidateReservations(queryClient);
    },
    onError: notifyError,
  });
}

/** Campos `null` não mudam. Em reserva vinculada, período e horários mudam também na reserva da sala. */
export function useEditResourceReserve() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      reserveId,
      body,
    }: {
      reserveId: number;
      body: components["schemas"]["ResourceReserveEditRequestDTO"];
    }) =>
      assertOk(
        await api.PATCH("/resource-reserve/edit/{resourceReserveId}", {
          params: { path: { resourceReserveId: reserveId } },
          body,
        }),
      ),
    onSuccess: () => {
      notifySuccess("Reserva de recurso atualizada com sucesso!");
      return invalidateReservations(queryClient);
    },
    onError: notifyError,
  });
}

export function useCancelResourceReserve() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (reserveId: number) =>
      assertOk(
        await api.DELETE("/resource-reserve/cancel/{resourceReserveId}", {
          params: { path: { resourceReserveId: reserveId } },
        }),
      ),
    onSuccess: () => {
      notifySuccess("Reserva de recurso cancelada com sucesso!");
      return invalidateReservations(queryClient);
    },
    onError: notifyError,
  });
}

type AdminResourceEditBody = components["schemas"]["AdminResourceReserveEditRequestDTO"];

export function useEditAdminResourceReserve() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ reserveId, body }: { reserveId: number; body: AdminResourceEditBody }) =>
      assertOk(
        await api.PATCH("/resource-reserve/admin/edit/{resourceReserveId}", {
          params: { path: { resourceReserveId: reserveId } },
          body,
        }),
      ),
    onSuccess: () => {
      notifySuccess("Reserva de recurso atualizada com sucesso!");
      return invalidateReservations(queryClient);
    },
    onError: notifyError,
  });
}

/** Admin cancela editando o status para "Canceled" (não cancela a sala vinculada). */
export function useCancelAdminResourceReserve() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (reserveId: number) =>
      assertOk(
        await api.PATCH("/resource-reserve/admin/edit/{resourceReserveId}", {
          params: { path: { resourceReserveId: reserveId } },
          body: { status: RESERVE_STATUS.CANCELED, startAt: null, endAt: null, scheduleIds: null, quantity: null },
        }),
      ),
    onSuccess: () => {
      notifySuccess("Reserva de recurso cancelada com sucesso!");
      return invalidateReservations(queryClient);
    },
    onError: notifyError,
  });
}

/** Reserva de recurso ainda ativa (pendente ou confirmada): ocupa unidades. */
export function isActiveReserveStatus(status: number | string) {
  const value = Number(status);
  return value === RESERVE_STATUS.BOOKING || value === RESERVE_STATUS.CONFIRMED;
}
