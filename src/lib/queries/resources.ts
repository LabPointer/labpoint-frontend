import { keepPreviousData, useMutation, useQueries, useQuery, useQueryClient } from "@tanstack/react-query";
import type { components } from "#/lib/utils/api";
import { assertOk, unwrapList } from "#/lib/utils/api-result";
import { notifyError, notifySuccess } from "#/lib/utils/notify";
import { api } from "#/lib/utils/restapi";

export type Resource = components["schemas"]["ResourceResponseDTO"];

/** Na edição de uma reserva, as unidades dela não contam como ocupadas. */
export type ReserveExclusion = { spaceReserveId?: number; resourceReserveId?: number };

export type ResourceParams = {
  /** busca só no nome (comboboxes antigos) */
  name?: string;
  /** busca em nome e descrição (full-text + trecho parcial) */
  search?: string;
  enabled?: boolean;
  /** `false` = só recursos fixos de espaço; `true` = só reserváveis */
  reservable?: boolean;
  limit?: number;
  offset?: number;
  /** Período (yyyy-MM-dd): com ele, só reserváveis com unidades livres, e `available` vem preenchido. */
  startAt?: string;
  endAt?: string;
  scheduleIds?: number[];
  minQuantity?: number;
  exclude?: ReserveExclusion;
};

export const resourceKeys = {
  all: ["resources"] as const,
  list: (params: ResourceParams) => [...resourceKeys.all, "list", params] as const,
  /** Fica sob a chave de reservas: criar/editar/cancelar qualquer reserva invalida a disponibilidade. */
  availability: (resourceId: number, startAt: string, endAt: string, exclude: ReserveExclusion | undefined) =>
    ["reserves", "resource-availability", resourceId, startAt, endAt, exclude ?? null] as const,
};

export function useResources(params: ResourceParams = {}, options: { enabled?: boolean } = {}) {
  const { name, search, enabled, reservable, limit = 30, offset = 0, startAt, endAt, scheduleIds, minQuantity, exclude } =
    params;
  const hasPeriod = Boolean(startAt && endAt);

  return useQuery({
    queryKey: resourceKeys.list({
      name: name || undefined,
      search: search || undefined,
      enabled,
      reservable,
      limit,
      offset,
      startAt: hasPeriod ? startAt : undefined,
      endAt: hasPeriod ? endAt : undefined,
      scheduleIds: hasPeriod && scheduleIds?.length ? scheduleIds : undefined,
      minQuantity: hasPeriod ? minQuantity : undefined,
      exclude: hasPeriod ? exclude : undefined,
    }),
    queryFn: async ({ signal }) =>
      unwrapList(
        await api.GET("/resource", {
          params: {
            query: {
              Name: name || undefined,
              SearchQuery: search || undefined,
              Enabled: enabled,
              Reservable: reservable,
              Limit: limit,
              Offset: offset,
              StartAt: hasPeriod ? startAt : undefined,
              EndAt: hasPeriod ? endAt : undefined,
              ScheduleIds: hasPeriod && scheduleIds?.length ? scheduleIds : undefined,
              MinQuantity: hasPeriod ? minQuantity : undefined,
              ExcludeSpaceReserveId: hasPeriod ? exclude?.spaceReserveId : undefined,
              ExcludeResourceReserveId: hasPeriod ? exclude?.resourceReserveId : undefined,
            },
          },
          signal,
        }),
        "Erro ao buscar recursos.",
      ),
    enabled: options.enabled ?? true,
    placeholderData: keepPreviousData,
  });
}

/** Unidades livres por horário (`scheduleId` → menor quantidade livre no período). */
export type ScheduleAvailability = Map<number, number>;

async function fetchAvailability(
  resourceId: number,
  startAt: string,
  endAt: string,
  exclude: ReserveExclusion | undefined,
  signal: AbortSignal,
): Promise<ScheduleAvailability> {
  const rows = unwrapList(
    await api.GET("/resource-reserve/availability/{resourceId}", {
      params: {
        path: { resourceId },
        query: {
          StartAt: startAt,
          EndAt: endAt,
          ExcludeSpaceReserveId: exclude?.spaceReserveId,
          ExcludeResourceReserveId: exclude?.resourceReserveId,
        },
      },
      signal,
    }),
    "Erro ao buscar a disponibilidade do recurso.",
  );
  return new Map(rows.map((row) => [Number(row.scheduleId), Number(row.available)]));
}

/**
 * Disponibilidade por horário de vários recursos no período (`to` ausente = um único dia).
 * Devolve um mapa `resourceId → (scheduleId → unidades livres)`; recursos ainda carregando ficam de fora.
 */
export function useResourcesAvailability(
  resourceIds: number[],
  range: { from?: Date; to?: Date } | undefined,
  exclude?: ReserveExclusion,
) {
  const from = range?.from;
  const startAt = from ? toIsoDate(from) : "";
  const endAt = from ? toIsoDate(range?.to ?? from) : "";

  return useQueries({
    queries: resourceIds.map((resourceId) => ({
      queryKey: resourceKeys.availability(resourceId, startAt, endAt, exclude),
      queryFn: ({ signal }: { signal: AbortSignal }) => fetchAvailability(resourceId, startAt, endAt, exclude, signal),
      enabled: Boolean(from),
    })),
    // `combine` só roda de novo quando algum resultado muda, então o Map é estável entre renders.
    combine: (results) => {
      const byResource = new Map<number, ScheduleAvailability>();
      results.forEach((result, index) => {
        if (result.data) byResource.set(resourceIds[index], result.data);
      });
      return {
        byResource,
        isFetching: results.some((result) => result.isFetching),
        isError: results.some((result) => result.isError),
      };
    },
  });
}

/** yyyy-MM-dd no fuso local (mesmo formato de `toApiDate`, sem importar reserves.ts e criar ciclo). */
function toIsoDate(date: Date) {
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${date.getFullYear()}-${month}-${day}`;
}

export function useCreateResource() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (body: components["schemas"]["ResourceCreateRequestDTO"]) =>
      assertOk(await api.POST("/resource/admin/create", { body })),
    onSuccess: () => {
      notifySuccess("Recurso criado com sucesso!");
      return queryClient.invalidateQueries({ queryKey: resourceKeys.all });
    },
    onError: notifyError,
  });
}

export function useEditResource() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (body: components["schemas"]["ResourceEditRequestDTO"]) =>
      assertOk(await api.PATCH("/resource/admin/edit", { body })),
    onSuccess: () => {
      notifySuccess("Recurso editado com sucesso!");
      return queryClient.invalidateQueries({ queryKey: resourceKeys.all });
    },
    onError: notifyError,
  });
}
