import { useCallback, useMemo, useState } from "react";

/**
 * Linhas marcadas numa tabela (por chave), mantidas entre páginas, com o objeto da linha para ações em lote
 * (ex.: exportar os relatórios selecionados). Chame `clear()` quando os filtros mudarem.
 */
export function useRowSelection<T>(getKey: (row: T) => string | number) {
  const [selected, setSelected] = useState<Map<string | number, T>>(() => new Map());

  const toggle = useCallback(
    (row: T, checked: boolean) =>
      setSelected((current) => {
        const next = new Map(current);
        if (checked) next.set(getKey(row), row);
        else next.delete(getKey(row));
        return next;
      }),
    [getKey],
  );

  /** Marca ou desmarca todas as linhas visíveis (a página atual). */
  const togglePage = useCallback(
    (rows: T[], checked: boolean) =>
      setSelected((current) => {
        const next = new Map(current);
        for (const row of rows) {
          if (checked) next.set(getKey(row), row);
          else next.delete(getKey(row));
        }
        return next;
      }),
    [getKey],
  );

  const clear = useCallback(() => setSelected(new Map()), []);
  const isSelected = useCallback((row: T) => selected.has(getKey(row)), [selected, getKey]);
  const rows = useMemo(() => [...selected.values()], [selected]);

  return { rows, count: selected.size, isSelected, toggle, togglePage, clear };
}

export type RowSelection<T> = ReturnType<typeof useRowSelection<T>>;
