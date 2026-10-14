import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { components } from "#/lib/utils/api";
import { assertOk, unwrapList } from "#/lib/utils/api-result";
import { notifyError, notifySuccess } from "#/lib/utils/notify";
import { api } from "#/lib/utils/restapi";

export type Schedule = components["schemas"]["ScheduleResponseDTO"];
export type ScheduleParams = {
  shift?: number;
  enabled?: boolean;
  /** "HH:mm": horários que começam a partir dessa hora */
  startAt?: string;
  /** "HH:mm": horários que terminam até essa hora */
  endAt?: string;
  limit?: number;
  offset?: number;
};

/**
 * Quantidade de horários carregados pelos comboboxes/seletores (o backend limita a 10 por padrão).
 * Há poucos horários cadastrados, então 50 cobre a lista inteira.
 */
export const SCHEDULE_OPTIONS_LIMIT = 50;

export const scheduleKeys = {
  all: ["schedules"] as const,
  list: (params: ScheduleParams) => [...scheduleKeys.all, "list", params] as const,
};

export const shiftLabels: Record<number, string> = { 0: "Manhã", 1: "Tarde", 2: "Noite" };

/** "07:30:00" → "07:30" */
export const hhmm = (time: string) => time.slice(0, 5);

/** "Manhã - 07:30 às 08:30" */
export function scheduleLabel(schedule: Pick<Schedule, "shift" | "startAt" | "endAt">) {
  return `${shiftLabels[schedule.shift] ?? "—"} - ${hhmm(schedule.startAt)} às ${hhmm(schedule.endAt)}`;
}

/** Ordena por turno e horário de início. */
export function sortSchedules<T extends Pick<Schedule, "shift" | "startAt">>(schedules: T[]): T[] {
  return [...schedules].sort((a, b) => a.shift - b.shift || a.startAt.localeCompare(b.startAt));
}

export function useSchedules(params: ScheduleParams = {}, options: { enabled?: boolean } = {}) {
  const { shift, enabled, startAt, endAt, limit = SCHEDULE_OPTIONS_LIMIT, offset = 0 } = params;

  return useQuery({
    queryKey: scheduleKeys.list({ shift, enabled, startAt, endAt, limit, offset }),
    queryFn: async ({ signal }) =>
      unwrapList(
        await api.GET("/schedule", {
          params: { query: { shift, Enabled: enabled, StartAt: startAt, EndAt: endAt, Limit: limit, Offset: offset } },
          signal,
        }),
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
