import { keepPreviousData, useQuery } from "@tanstack/react-query";
import type { components } from "#/lib/utils/api";
import { unwrapList } from "#/lib/utils/api-result";
import { api } from "#/lib/utils/restapi";

export type Space = components["schemas"]["SpaceResponseDTO"];
export type SpaceParams = {
  search?: string;
  subjects?: number[];
  resources?: number[];
  /** `true` = bloqueado (inativo), `false` = liberado (ativo), `undefined` = todos */
  locked?: boolean;
  /** capacidade mínima */
  capacity?: number;
  /** janela de disponibilidade, formato yyyy-MM-dd */
  startAt?: string;
  endAt?: string;
  schedules?: number[];
  limit?: number;
};

export const spaceKeys = {
  all: ["spaces"] as const,
  list: (params: SpaceParams) => [...spaceKeys.all, "list", params] as const,
};

export function useSpaces(params: SpaceParams = {}, options: { enabled?: boolean } = {}) {
  const { search, subjects, resources, locked, capacity, startAt, endAt, schedules, limit = 30 } = params;

  return useQuery({
    queryKey: spaceKeys.list({
      search: search || undefined,
      subjects,
      resources,
      locked,
      capacity,
      startAt,
      endAt,
      schedules,
      limit,
    }),
    queryFn: async ({ signal }) =>
      unwrapList(
        await api.GET("/space", {
          params: {
            query: {
              SearchQuery: search || undefined,
              Subjects: subjects?.length ? subjects : undefined,
              Resources: resources?.length ? resources : undefined,
              Locked: locked,
              Capacity: capacity,
              StartAt: startAt,
              EndAt: endAt,
              Schedules: schedules?.length ? schedules : undefined,
              Limit: limit,
              Offset: 0,
            },
          },
          signal,
        }),
        "Erro ao buscar espaços.",
      ),
    enabled: options.enabled ?? true,
    placeholderData: keepPreviousData,
  });
}
