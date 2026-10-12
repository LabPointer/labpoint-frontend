/** Itens por página: mínimo 10, máximo 50, de 10 em 10. */
export const MIN_PAGE_LIMIT = 10;
export const MAX_PAGE_LIMIT = 50;
export const PAGE_LIMIT_STEP = 10;
export const DEFAULT_PAGE_LIMIT = MIN_PAGE_LIMIT;

export const PAGE_LIMIT_OPTIONS: readonly number[] = Array.from(
  { length: (MAX_PAGE_LIMIT - MIN_PAGE_LIMIT) / PAGE_LIMIT_STEP + 1 },
  (_, index) => MIN_PAGE_LIMIT + index * PAGE_LIMIT_STEP,
);

export type Paged<T> = { items: T[]; hasNext: boolean };

/**
 * A requisição pede `limit + 1` itens: o item extra não é exibido, serve só para saber se existe próxima página.
 * Aqui ele é descartado e vira `hasNext`.
 */
export function toPaged<T>(rows: readonly T[] | undefined, limit: number): Paged<T> {
  const list = rows ?? [];
  return { items: list.slice(0, limit), hasNext: list.length > limit };
}

/**
 * Para endpoints que (ainda) não têm Limit/Offset no backend: recebe a lista completa e pagina no cliente,
 * com a mesma regra do `limit + 1`.
 */
export function paginateLocal<T>(rows: readonly T[] | undefined, { page, limit }: { page: number; limit: number }) {
  const start = page * limit;
  return toPaged(rows?.slice(start, start + limit + 1), limit);
}
