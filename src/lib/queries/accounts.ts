import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useCallback } from "react";
import type { components } from "#/lib/utils/api";
import { assertOk, unwrapList } from "#/lib/utils/api-result";
import { notifyError, notifySuccess } from "#/lib/utils/notify";
import { api } from "#/lib/utils/restapi";

/**
 * Cargos na ordem do enum do backend (EAccountRole): o índice do array é o valor enviado/recebido.
 * 0 = User, 1 = Admin, 2 = Owner.
 * Atenção: `UserRole.options` (lib/service) está na ordem inversa (Owner, Admin, User) e serve só para a sessão.
 */
export const ROLE_LABELS = ["User", "Admin", "Owner"] as const;

export function roleLabel(role: number | undefined) {
  return role === undefined ? "—" : (ROLE_LABELS[role] ?? "—");
}

export type Account = components["schemas"]["AccountResponseDTO"];

export type AccountParams = {
  search?: string;
  /** índice em ROLE_LABELS; `undefined` = qualquer cargo */
  role?: number;
  /** o endpoint não possui filtro de status: aplicado no cliente */
  enabled?: boolean;
  /** o endpoint não possui filtro de matéria: aplicado no cliente sobre `account.subject` */
  subjectId?: number;
  limit?: number;
};

export const accountKeys = {
  all: ["accounts"] as const,
  list: (params: Pick<AccountParams, "search" | "role" | "limit">) => [...accountKeys.all, "list", params] as const,
};

/** Limite padrão da listagem e o usado quando há filtros aplicados no cliente (status/matéria). */
const DEFAULT_LIMIT = 30;
const CLIENT_FILTER_LIMIT = 100;

export function useAccounts({ search, role, enabled, subjectId, limit }: AccountParams = {}) {
  // status e matéria não existem como parâmetro de /account/admin: filtramos aqui. Como o filtro roda
  // sobre a página retornada, pedimos uma página maior para não esconder resultados.
  const hasClientFilter = enabled !== undefined || subjectId !== undefined;
  const effectiveLimit = limit ?? (hasClientFilter ? CLIENT_FILTER_LIMIT : DEFAULT_LIMIT);

  const select = useCallback(
    (accounts: Account[]) =>
      accounts.filter((account) => {
        if (enabled !== undefined && account.enabled !== enabled) return false;
        if (subjectId !== undefined && Number(account.subject?.id) !== subjectId) return false;
        return true;
      }),
    [enabled, subjectId],
  );

  return useQuery({
    queryKey: accountKeys.list({ search: search || undefined, role, limit: effectiveLimit }),
    queryFn: async ({ signal }) =>
      unwrapList(
        await api.GET("/account/admin", {
          params: { query: { SearchQuery: search || undefined, Role: role, Limit: effectiveLimit } },
          signal,
        }),
        "Erro ao buscar usuários.",
      ),
    select,
    placeholderData: keepPreviousData,
  });
}

export type AccountEditPayload = components["schemas"]["AdminAccountEditRequestDTO"];

export function useEditAccount() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (body: AccountEditPayload) => assertOk(await api.PATCH("/account/admin/edit", { body })),
    onSuccess: () => {
      notifySuccess("Usuário editado com sucesso!");
      return queryClient.invalidateQueries({ queryKey: accountKeys.all });
    },
    onError: notifyError,
  });
}
