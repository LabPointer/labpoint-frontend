import { keepPreviousData, type QueryClient, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { components } from "#/lib/utils/api";
import { assertOk, unwrap, unwrapList } from "#/lib/utils/api-result";
import { notifyError, notifySuccess } from "#/lib/utils/notify";
import { api } from "#/lib/utils/restapi";
import { invalidateReservations, reserveKeys } from "./reserves";

export type UsageSession = components["schemas"]["UsageSessionResponseDTO"];
export type UsageEntry = components["schemas"]["UsageEntryResponseDTO"];
export type UsageEntriesBody = components["schemas"]["UsageEntriesRequestDTO"];
export type UsageSummary = components["schemas"]["UsageSummaryDTO"];

/** Valores de `EUsageStatus` no backend (Models/Types.cs). */
export const USAGE_STATUS = {
  SCHEDULED: 0,
  CHECKED_IN: 1,
  COMPLETED: 2,
  ABSENT: 3,
  CHECKOUT_PENDING: 4,
} as const;

/** Valores de `EUsageStep`: etapa permitida por um link do e-mail. */
export const USAGE_STEP = { CHECK_IN: 0, CHECK_OUT: 1 } as const;

const USAGE_STATUS_LABELS: Record<number, string> = {
  [USAGE_STATUS.SCHEDULED]: "Aguardando check-in",
  [USAGE_STATUS.CHECKED_IN]: "Em uso",
  [USAGE_STATUS.COMPLETED]: "Concluída",
  [USAGE_STATUS.ABSENT]: "Ausente",
  [USAGE_STATUS.CHECKOUT_PENDING]: "Check-out pendente",
};

const USAGE_STATUS_CLASSES: Record<number, string> = {
  [USAGE_STATUS.SCHEDULED]: "bg-amber-500/20 text-amber-600 dark:text-amber-400 border-amber-500/30",
  [USAGE_STATUS.CHECKED_IN]: "bg-blue-500/20 text-blue-600 dark:text-blue-400 border-blue-500/30",
  [USAGE_STATUS.COMPLETED]: "bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border-emerald-500/30",
  [USAGE_STATUS.ABSENT]: "bg-rose-500/20 text-rose-600 dark:text-rose-400 border-rose-500/30",
  [USAGE_STATUS.CHECKOUT_PENDING]: "bg-orange-500/20 text-orange-600 dark:text-orange-400 border-orange-500/30",
};

export const usageStatusLabel = (status: number | string) => USAGE_STATUS_LABELS[Number(status)] ?? "—";
export const usageStatusClass = (status: number | string) => USAGE_STATUS_CLASSES[Number(status)] ?? "";

/** Valores de `EUsageModality`, na ordem da folha de controle. */
export const MODALITY_OPTIONS = [
  { value: 0, label: "Aprendizagem" },
  { value: 1, label: "Técnico" },
  { value: 2, label: "Graduação" },
  { value: 3, label: "Pós-graduação" },
] as const;

export const modalityLabel = (modality: number | string) =>
  MODALITY_OPTIONS.find((option) => option.value === Number(modality))?.label ?? "—";

/** Check-in feito (em uso, encerrada ou aguardando a coordenação): há relatório para ver. */
export const hasCheckIn = (status: number | string) =>
  [USAGE_STATUS.CHECKED_IN, USAGE_STATUS.COMPLETED, USAGE_STATUS.CHECKOUT_PENDING].includes(
    Number(status) as 1 | 2 | 4,
  );

/** Quantas sessões da reserva já têm relatório (check-in feito). */
export const reportCount = (usage: UsageSummary | null | undefined) =>
  usage ? Number(usage.checkedIn) + Number(usage.completed) + Number(usage.checkoutPending) : 0;

export type ReserveKind = "space" | "resource";

export type MyUsageParams = { statuses?: number[]; startAt?: string; endAt?: string; limit?: number; offset?: number };

export type AdminUsageParams = {
  /** yyyy-MM-dd (obrigatório no backend) */
  startAt: string;
  endAt: string;
  statuses?: number[];
  spaceIds?: number[];
  accountIds?: string[];
  limit?: number;
  offset?: number;
};

/** Sob `reserveKeys.all`: `invalidateReservations` também atualiza as sessões (e vice-versa). */
export const usageKeys = {
  all: [...reserveKeys.all, "usage"] as const,
  token: (token: string) => [...usageKeys.all, "token", token] as const,
  mine: (params: MyUsageParams) => [...usageKeys.all, "mine", params] as const,
  admin: (params: AdminUsageParams) => [...usageKeys.all, "admin", params] as const,
  reserve: (kind: ReserveKind, reserveId: number) => [...usageKeys.all, "reserve", kind, reserveId] as const,
};

/** As sessões aparecem no resumo das reservas: invalida tudo que é reserva. */
const invalidateUsage = (queryClient: QueryClient) => invalidateReservations(queryClient);

// ---------------------------------------------------------------- link do e-mail (público)

export function useUsageByToken(token: string) {
  return useQuery({
    queryKey: usageKeys.token(token),
    queryFn: async ({ signal }) =>
      unwrap(
        await api.GET("/usage/token/{token}", { params: { path: { token } }, signal }),
        "Link inválido ou expirado.",
      ),
    retry: false,
  });
}

export function useTokenCheckIn(token: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (body: UsageEntriesBody) =>
      assertOk(await api.POST("/usage/token/{token}/check-in", { params: { path: { token } }, body })),
    onSuccess: () => {
      notifySuccess("Check-in confirmado!");
      return invalidateUsage(queryClient);
    },
    onError: notifyError,
  });
}

export function useTokenCheckOut(token: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (body: UsageEntriesBody) =>
      assertOk(await api.POST("/usage/token/{token}/check-out", { params: { path: { token } }, body })),
    onSuccess: () => {
      notifySuccess("Check-out confirmado!");
      return invalidateUsage(queryClient);
    },
    onError: notifyError,
  });
}

// ---------------------------------------------------------------- usuário

/** Sessões do próprio usuário. O backend devolve até `limit + 1` (o extra indica a próxima página). */
export function useMyUsages(params: MyUsageParams, options: { enabled?: boolean; refetchInterval?: number } = {}) {
  const { statuses, startAt, endAt, limit = 50, offset = 0 } = params;
  return useQuery({
    queryKey: usageKeys.mine({ statuses, startAt, endAt, limit, offset }),
    queryFn: async ({ signal }) =>
      unwrapList(
        await api.GET("/usage/mine", {
          params: {
            query: {
              Statuses: statuses?.length ? statuses : undefined,
              StartAt: startAt,
              EndAt: endAt,
              Limit: limit,
              Offset: offset,
            },
          },
          signal,
        }),
        "Erro ao buscar as sessões de uso.",
      ),
    enabled: options.enabled ?? true,
    refetchInterval: options.refetchInterval,
    placeholderData: keepPreviousData,
  });
}

type UsageMutationArgs = { usageId: number; body: UsageEntriesBody };

export function useCheckIn() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ usageId, body }: UsageMutationArgs) =>
      assertOk(await api.POST("/usage/{usageId}/check-in", { params: { path: { usageId } }, body })),
    onSuccess: () => {
      notifySuccess("Check-in confirmado!");
      return invalidateUsage(queryClient);
    },
    onError: notifyError,
  });
}

export function useSaveUsageEntries() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ usageId, body }: UsageMutationArgs) =>
      assertOk(await api.PUT("/usage/{usageId}/entries", { params: { path: { usageId } }, body })),
    onSuccess: () => {
      notifySuccess("Relatório salvo.");
      return invalidateUsage(queryClient);
    },
    onError: notifyError,
  });
}

export function useCheckOut() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ usageId, body }: UsageMutationArgs) =>
      assertOk(await api.POST("/usage/{usageId}/check-out", { params: { path: { usageId } }, body })),
    onSuccess: () => {
      notifySuccess("Check-out confirmado!");
      return invalidateUsage(queryClient);
    },
    onError: notifyError,
  });
}

// ---------------------------------------------------------------- por reserva (dono ou admin)

/** Sessões de uma reserva (a de recurso vinculada devolve as da sala). Lista vazia quando ainda não há sessões. */
export function useReserveUsage(kind: ReserveKind, reserveId: number, options: { enabled?: boolean } = {}) {
  return useQuery({
    queryKey: usageKeys.reserve(kind, reserveId),
    queryFn: async ({ signal }) =>
      kind === "space"
        ? unwrapList(
            await api.GET("/usage/reserve/space/{spaceReserveId}", {
              params: { path: { spaceReserveId: reserveId } },
              signal,
            }),
            "Erro ao buscar o relatório de uso.",
          )
        : unwrapList(
            await api.GET("/usage/reserve/resource/{resourceReserveId}", {
              params: { path: { resourceReserveId: reserveId } },
              signal,
            }),
            "Erro ao buscar o relatório de uso.",
          ),
    enabled: options.enabled ?? true,
  });
}

// ---------------------------------------------------------------- admin

export function useAdminUsages(params: AdminUsageParams, options: { enabled?: boolean } = {}) {
  const { startAt, endAt, statuses, spaceIds, accountIds, limit = 30, offset = 0 } = params;
  return useQuery({
    queryKey: usageKeys.admin({ startAt, endAt, statuses, spaceIds, accountIds, limit, offset }),
    queryFn: async ({ signal }) =>
      unwrapList(
        await api.GET("/usage/admin", {
          params: {
            query: {
              StartAt: startAt,
              EndAt: endAt,
              Statuses: statuses?.length ? statuses : undefined,
              SpaceIds: spaceIds?.length ? spaceIds : undefined,
              AccountIds: accountIds?.length ? accountIds : undefined,
              Limit: limit,
              Offset: offset,
            },
          },
          signal,
        }),
        "Erro ao buscar as sessões de uso.",
      ),
    enabled: options.enabled ?? true,
    placeholderData: keepPreviousData,
  });
}

export function useAdminSaveUsageEntries() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ usageId, body }: UsageMutationArgs) =>
      assertOk(await api.PUT("/usage/admin/{usageId}/entries", { params: { path: { usageId } }, body })),
    onSuccess: () => {
      notifySuccess("Relatório atualizado.");
      return invalidateUsage(queryClient);
    },
    onError: notifyError,
  });
}

export function useAdminCheckOut() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ usageId, body }: UsageMutationArgs) =>
      assertOk(await api.POST("/usage/admin/{usageId}/check-out", { params: { path: { usageId } }, body })),
    onSuccess: () => {
      notifySuccess("Check-out encerrado.");
      return invalidateUsage(queryClient);
    },
    onError: notifyError,
  });
}
