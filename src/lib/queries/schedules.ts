import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { components } from "#/lib/utils/api";
import { assertOk, unwrapList } from "#/lib/utils/api-result";
import { notifyError, notifySuccess } from "#/lib/utils/notify";
import { api } from "#/lib/utils/restapi";

export type Schedule = components["schemas"]["ScheduleResponseDTO"];
export type ScheduleParams = { shift?: number; enabled?: boolean };

export const scheduleKeys = {
  all: ["schedules"] as const,
  list: (params: ScheduleParams) => [...scheduleKeys.all, "list", params] as const,
};

export const shiftLabels: Record<number, string> = { 0: "Manhã", 1: "Tarde", 2: "Noite" };

export function useSchedules(params: ScheduleParams = {}, options: { enabled?: boolean } = {}) {
  const { shift, enabled } = params;

  return useQuery({
    queryKey: scheduleKeys.list({ shift, enabled }),
    queryFn: async ({ signal }) =>
      unwrapList(
        await api.GET("/schedule", { params: { query: { shift, Enabled: enabled } }, signal }),
        "Erro ao buscar horários.",
      ),
    enabled: options.enabled ?? true,
    placeholderData: keepPreviousData,
  });
}

export function useCreateSchedule() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (body: components["schemas"]["ScheduleCreateRequestDTO"]) =>
      assertOk(await api.POST("/schedule/admin/create", { body })),
    onSuccess: () => {
      notifySuccess("Horário criado com sucesso!");
      return queryClient.invalidateQueries({ queryKey: scheduleKeys.all });
    },
    onError: notifyError,
  });
}

export function useEditSchedule() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (body: components["schemas"]["ScheduleEditRequestDTO"]) =>
      assertOk(await api.PATCH("/schedule/admin/edit", { body })),
    onSuccess: () => {
      notifySuccess("Horário editado com sucesso!");
      return queryClient.invalidateQueries({ queryKey: scheduleKeys.all });
    },
    onError: notifyError,
  });
}
