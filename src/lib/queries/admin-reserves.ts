import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { components } from "#/lib/utils/api";
import { assertOk, unwrapList } from "#/lib/utils/api-result";
import { notifyError, notifySuccess } from "#/lib/utils/notify";
import { api } from "#/lib/utils/restapi";
import { RESERVE_STATUS, reserveKeys } from "./reserves";

export type AdminReserve = components["schemas"]["AdminSpaceReserveResponseDTO"];

/**
 * O backend sem o patch ainda devolve `spaces` (plural) em vez de `space`.
 * Normaliza para `space` para a tela funcionar nos dois casos; pode ser removido quando o patch estiver aplicado.
 */
type RawAdminReserve = Omit<AdminReserve, "space"> & { space?: AdminReserve["spaces"]; spaces?: AdminReserve["spaces"] };

const normalizeAdminReserve = ({ spaces, space, ...rest }: RawAdminReserve): AdminReserve => ({
  ...rest,
  spaces: (space ?? spaces) as AdminReserve["spaces"],
});

export type AdminReserveParams = {
  /** busca pelo nome do espaço */
  search?: string;
  /** yyyy-MM-dd (obrigatório no backend) */
  startAt: string;
  /** yyyy-MM-dd (obrigatório no backend) */
  endAt: string;
  scheduleIds?: number[];
  accountIds?: string[];
  status?: number;
};

export const adminReserveKeys = {
  list: (params: AdminReserveParams) => [...reserveKeys.all, "admin", "list", params] as const,
};

export function useAdminReserves(params: AdminReserveParams) {
  const { search, startAt, endAt, scheduleIds, accountIds, status } = params;

  return useQuery({
    queryKey: adminReserveKeys.list({ search: search || undefined, startAt, endAt, scheduleIds, accountIds, status }),
    queryFn: async ({ signal }) =>
      (
        unwrapList(
          await api.GET("/space-reserve/admin", {
            params: {
              query: {
                SearchQuery: search || undefined,
                StartAt: startAt,
                EndAt: endAt,
                ScheduleIds: scheduleIds?.length ? scheduleIds : undefined,
                AccountIds: accountIds?.length ? accountIds : undefined,
                Status: status,
              },
            },
            signal,
          }),
          "Erro ao buscar reservas.",
        ) as RawAdminReserve[]
      ).map(normalizeAdminReserve),
    placeholderData: keepPreviousData,
  });
}

type AdminEditBody = components["schemas"]["AdminSpaceReserveEditRequestDTO"];

/** Campos `null` não são alterados pelo backend. */
export function useEditAdminReserve() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ reserveId, body }: { reserveId: number; body: AdminEditBody }) =>
      assertOk(await api.PATCH("/space-reserve/admin/edit/{reserveId}", { params: { path: { reserveId } }, body })),
    onSuccess: () => {
      notifySuccess("Reserva atualizada com sucesso!");
      return queryClient.invalidateQueries({ queryKey: reserveKeys.all });
    },
    onError: notifyError,
  });
}

/** Não existe endpoint de cancelamento para admin: cancelar é editar o status para "Canceled". */
export function useCancelAdminReserve() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (reserveId: number) =>
      assertOk(
        await api.PATCH("/space-reserve/admin/edit/{reserveId}", {
          params: { path: { reserveId } },
          body: { status: RESERVE_STATUS.CANCELED, startAt: null, endAt: null, scheduleIds: null },
        }),
      ),
    onSuccess: () => {
      notifySuccess("Reserva cancelada com sucesso!");
      return queryClient.invalidateQueries({ queryKey: reserveKeys.all });
    },
    onError: notifyError,
  });
}
