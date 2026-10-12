import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { components } from "#/lib/utils/api";
import { assertOk, unwrapList } from "#/lib/utils/api-result";
import { notifyError, notifySuccess } from "#/lib/utils/notify";
import { api } from "#/lib/utils/restapi";

export type Resource = components["schemas"]["ResourceResponseDTO"];
export type ResourceParams = { name?: string; canReserve?: boolean; enabled?: boolean; limit?: number; offset?: number };

export const resourceKeys = {
  all: ["resources"] as const,
  list: (params: ResourceParams) => [...resourceKeys.all, "list", params] as const,
};

export function useResources(params: ResourceParams = {}, options: { enabled?: boolean } = {}) {
  const { name, canReserve, enabled, limit = 30, offset = 0 } = params;

  return useQuery({
    queryKey: resourceKeys.list({ name: name || undefined, canReserve, enabled, limit, offset }),
    queryFn: async ({ signal }) =>
      unwrapList(
        await api.GET("/resource", {
          params: {
            query: { Name: name || undefined, CanReserve: canReserve, Enabled: enabled, Limit: limit, Offset: offset },
          },
          signal,
        }),
        "Erro ao buscar recursos.",
      ),
    enabled: options.enabled ?? true,
    placeholderData: keepPreviousData,
  });
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
