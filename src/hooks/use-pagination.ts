import { useCallback, useState } from "react";
import { DEFAULT_PAGE_LIMIT } from "#/lib/utils/pagination";

/**
 * Estado de paginação de uma listagem (`page` começa em 0).
 *
 * Recebe os filtros da barra de pesquisa (que incluem o `limit` escolhido) e volta para a primeira página
 * sempre que qualquer filtro, inclusive o `limit`, mudar. `request` já traz o que enviar ao backend:
 * `limit + 1` (o item extra indica se há próxima página) e o `offset` da página atual.
 */
export function usePagination(filters: { limit: number } | null) {
  const limit = filters?.limit ?? DEFAULT_PAGE_LIMIT;
  const resetKey = JSON.stringify(filters);
  const [state, setState] = useState({ resetKey, page: 0 });

  // Ajuste de estado durante o render (padrão do React): evita commitar página e filtros inconsistentes.
  let page = state.page;
  if (state.resetKey !== resetKey) {
    page = 0;
    setState({ resetKey, page: 0 });
  }

  const setPage = useCallback((next: number) => setState({ resetKey, page: Math.max(0, next) }), [resetKey]);

  return { page, limit, setPage, request: { limit: limit + 1, offset: page * limit } };
}
