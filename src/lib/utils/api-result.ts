import { ApiError } from "#/lib/types/error-types";
import type { components } from "#/lib/utils/api";

type ApiResponse<T> = { data?: T; error?: unknown; response: Response };

function toApiError(res: ApiResponse<unknown>, fallback: string) {
  const err = res.error as Partial<components["schemas"]["ErroResponseDTO"]> | undefined;
  return new ApiError(err?.message ?? fallback, res.response.status, err?.logout);
}

/** Retorna `data` ou lança `ApiError` (para usar dentro de queryFn / mutationFn). */
export function unwrap<T>(res: ApiResponse<T>, fallback = "Erro desconhecido."): T {
  if (!res.response.ok || res.data === undefined) throw toApiError(res, fallback);
  return res.data;
}

/** Listagens: o backend responde 404 quando não há itens, o que não é uma falha. */
export function unwrapList<T>(res: ApiResponse<T[]>, fallback = "Erro ao carregar dados."): T[] {
  if (res.response.status === 404) return [];
  return unwrap(res, fallback);
}

/** Respostas sem corpo (204): apenas garante que deu certo. */
export function assertOk(res: ApiResponse<unknown>, fallback = "Erro desconhecido.") {
  if (!res.response.ok) throw toApiError(res, fallback);
}

/** Converte uma promise (ex.: `mutateAsync`) em boolean, sem deixar a rejeição vazar para o chamador. */
export const succeeded = (promise: Promise<unknown>) =>
  promise.then(
    () => true,
    () => false,
  );
