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
  /** página do backend (`Page`); `undefined` = padrão do backend. Este endpoint não tem Offset. */
  page?: number;
};

export const accountKeys = {
  all: ["accounts"] as const,
  list: (params: AccountParams) => [...accountKeys.all, "list", params] as const,
};

const DEFAULT_LIMIT = 30;

/** Todos os filtros (busca, cargo, status e matéria) são aplicados no servidor. */
export function useAccounts(
  { search, role, enabled, subjectId, limit = DEFAULT_LIMIT, page }: AccountParams = {},
  options: { enabled?: boolean } = {},
) {
  return useQuery({
    queryKey: accountKeys.list({ search: search || undefined, role, enabled, subjectId, limit, page }),
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
              Page: page,
            },
          },
          signal,
        }),
        "Erro ao buscar usuários.",
      ),
    enabled: options.enabled ?? true,
    placeholderData: keepPreviousData,
  });
}

/** Primeira página no `Page` do backend. Ajuste para 0 se o backend for 0-based. */
const FIRST_API_PAGE = 1;

/**
 * Listagem paginada de usuários.
 *
 * `/account/admin` pagina por `Page` (sem Offset), então o truque do "item extra" não funciona aqui: com `Limit + 1`
 * as páginas deixariam de se alinhar. Em vez disso, quando a página atual vem cheia, consultamos a seguinte
 * (mesmo `Limit`) para saber se ela tem itens; o resultado fica em cache e a navegação para ela é instantânea.
 */
export function useAccountsPage(
  params: Omit<AccountParams, "limit" | "page">,
  { page, limit }: { page: number; limit: number },
) {
  const apiPage = page + FIRST_API_PAGE;
  const current = useAccounts({ ...params, limit, page: apiPage });
  const isFull = current.data?.length === limit;
  const next = useAccounts({ ...params, limit, page: apiPage + 1 }, { enabled: isFull });

  return {
    items: current.data ?? [],
    // `isPlaceholderData`: ignora o resultado da sondagem anterior enquanto a nova não chega
    hasNext: isFull && !next.isPlaceholderData && (next.data?.length ?? 0) > 0,
    isPending: current.isPending,
    isFetching: current.isFetching,
    isError: current.isError,
    error: current.error,
  };
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
