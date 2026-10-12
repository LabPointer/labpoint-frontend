import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { components } from "#/lib/utils/api";
import { assertOk, unwrapList } from "#/lib/utils/api-result";
import { notifyError, notifySuccess } from "#/lib/utils/notify";
import { api } from "#/lib/utils/restapi";

export type Subject = components["schemas"]["SubjectResponseDTO"];
export type SubjectParams = { name?: string; enabled?: boolean; limit?: number };

export const subjectKeys = {
  all: ["subjects"] as const,
  list: (params: SubjectParams) => [...subjectKeys.all, "list", params] as const,
};

export function useSubjects(params: SubjectParams = {}, options: { enabled?: boolean } = {}) {
  const { name, enabled, limit = 30 } = params;

  return useQuery({
    queryKey: subjectKeys.list({ name: name || undefined, enabled, limit }),
    queryFn: async ({ signal }) =>
      unwrapList(
        await api.GET("/subject", {
          params: { query: { Name: name || undefined, Enabled: enabled, Limit: limit, Offset: 0 } },
          signal,
        }),
        "Erro ao buscar matérias.",
      ),
    enabled: options.enabled ?? true,
    placeholderData: keepPreviousData,
  });
}

export function useCreateSubject() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (body: components["schemas"]["SubjectCreateRequestDTO"]) =>
      assertOk(await api.POST("/subject/admin/create", { body })),
    onSuccess: () => {
      notifySuccess("Matéria criada com sucesso!");
      return queryClient.invalidateQueries({ queryKey: subjectKeys.all });
    },
    onError: notifyError,
  });
}

export function useEditSubject() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (body: components["schemas"]["SubjectEditRequestDTO"]) =>
      assertOk(await api.PATCH("/subject/admin/edit", { body })),
    onSuccess: () => {
      notifySuccess("Matéria editada com sucesso!");
      return queryClient.invalidateQueries({ queryKey: subjectKeys.all });
    },
    onError: notifyError,
  });
}
