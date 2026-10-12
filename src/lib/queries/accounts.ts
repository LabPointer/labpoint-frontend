import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
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

/** Posição de um cargo na hierarquia (User < Admin < Owner). */
export const ROLE_RANK = { User: 0, Admin: 1, Owner: 2 } as const;

/** Maior cargo entre os da sessão (`["Admin"]`, `["Owner"]`...). Sem cargo = User. */
export function highestRole(roles: readonly string[] | undefined): number {
  return Math.max(
    ROLE_RANK.User,
    ...(roles ?? []).map((role) => ROLE_RANK[role as keyof typeof ROLE_RANK] ?? ROLE_RANK.User),
  );
}

export function roleLabel(role: number | undefined) {
  return role === undefined ? "—" : (ROLE_LABELS[role] ?? "—");
}

export type Account = components["schemas"]["AccountResponseDTO"];

export type AccountParams = {
  search?: string;
  /** índice em ROLE_LABELS; `undefined` = qualquer cargo */
  role?: number;
  /** `undefined` = qualquer status */
  enabled?: boolean;
  /** `undefined` = qualquer matéria */
  subjectId?: number;
  limit?: number;
};

export const accountKeys = {
  all: ["accounts"] as const,
  list: (params: AccountParams) => [...accountKeys.all, "list", params] as const,
};

const DEFAULT_LIMIT = 30;

/** Todos os filtros (busca, cargo, status e matéria) são aplicados no servidor. */
export function useAccounts({ search, role, enabled, subjectId, limit = DEFAULT_LIMIT }: AccountParams = {}) {
  return useQuery({
    queryKey: accountKeys.list({ search: search || undefined, role, enabled, subjectId, limit }),
    queryFn: async ({ signal }) =>
      unwrapList(
        await api.GET("/account/admin", {
          params: {
            query: {
              SearchQuery: search || undefined,
              Role: role,
              Enabled: enabled,
              SubjectId: subjectId,
              Limit: limit,
            },
          },
          signal,
        }),
        "Erro ao buscar usuários.",
      ),
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
