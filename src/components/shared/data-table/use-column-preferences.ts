import { useCallback, useMemo, useSyncExternalStore } from "react";
import type { ColumnPreferences, DataColumn } from "./columns";

const STORAGE_PREFIX = "labpoint:columns:";
/** Avisa as outras instâncias da mesma aba (o evento `storage` só chega nas outras abas). */
const CHANGE_EVENT = "labpoint:columns-change";

function subscribe(onChange: () => void) {
  window.addEventListener("storage", onChange);
  window.addEventListener(CHANGE_EVENT, onChange);
  return () => {
    window.removeEventListener("storage", onChange);
    window.removeEventListener(CHANGE_EVENT, onChange);
  };
}

function readRaw(key: string): string | null {
  try {
    return window.localStorage.getItem(key);
  } catch {
    // Navegação privada ou armazenamento bloqueado: usa o padrão.
    return null;
  }
}

function writeRaw(key: string, value: string | null) {
  try {
    if (value === null) window.localStorage.removeItem(key);
    else window.localStorage.setItem(key, value);
  } catch {
    // Sem armazenamento a escolha vale só até recarregar a página.
  }
  window.dispatchEvent(new Event(CHANGE_EVENT));
}

function defaults<T, C>(columns: DataColumn<T, C>[]): ColumnPreferences {
  return {
    order: columns.map((column) => column.id),
    visible: columns.filter((column) => column.defaultVisible || column.hideable === false).map((column) => column.id),
  };
}

/**
 * Junta o que foi salvo com as colunas atuais: ids que não existem mais são descartados e colunas novas entram
 * na posição padrão, com a visibilidade padrão. Colunas não ocultáveis ficam sempre visíveis.
 */
function resolve<T, C>(columns: DataColumn<T, C>[], raw: string | null): ColumnPreferences {
  const fallback = defaults(columns);
  if (!raw) return fallback;

  let saved: Partial<ColumnPreferences & { known: string[] }>;
  try {
    saved = JSON.parse(raw);
  } catch {
    return fallback;
  }

  const ids = new Set(columns.map((column) => column.id));
  const savedOrder = Array.isArray(saved.order) ? saved.order.filter((id) => ids.has(id)) : [];
  const known = new Set(Array.isArray(saved.known) ? saved.known : savedOrder);
  const order = [...savedOrder];
  columns.forEach((column, index) => {
    if (order.includes(column.id)) return;
    // Coluna nova: entra logo depois da coluna que a antecede no padrão.
    const previous = columns[index - 1]?.id;
    const at = previous ? order.indexOf(previous) + 1 : 0;
    order.splice(at, 0, column.id);
  });

  const savedVisible = new Set(Array.isArray(saved.visible) ? saved.visible : []);
  const visible = columns
    .filter(
      (column) =>
        column.hideable === false ||
        savedVisible.has(column.id) ||
        (!known.has(column.id) && Boolean(column.defaultVisible)),
    )
    .map((column) => column.id);

  return { order, visible };
}

/**
 * Colunas escolhidas pelo usuário para uma tabela, salvas no navegador (`localStorage`) por `tableId`.
 * No servidor e na hidratação usa o padrão; depois aplica o que estiver salvo.
 */
export function useColumnPreferences<T, C>(tableId: string, columns: DataColumn<T, C>[]) {
  const key = STORAGE_PREFIX + tableId;
  const raw = useSyncExternalStore(
    subscribe,
    () => readRaw(key),
    () => null,
  );

  const preferences = useMemo(() => resolve(columns, raw), [columns, raw]);

  const save = useCallback(
    (next: ColumnPreferences) => writeRaw(key, JSON.stringify({ ...next, known: columns.map((column) => column.id) })),
    [key, columns],
  );

  const visibleColumns = useMemo(() => {
    const byId = new Map(columns.map((column) => [column.id, column]));
    const visible = new Set(preferences.visible);
    return preferences.order
      .filter((id) => visible.has(id))
      .map((id) => byId.get(id))
      .filter((column): column is DataColumn<T, C> => column !== undefined);
  }, [columns, preferences]);

  const toggle = useCallback(
    (id: string, show: boolean) => {
      const column = columns.find((item) => item.id === id);
      if (!column || column.hideable === false) return;
      const visible = show
        ? [...new Set([...preferences.visible, id])]
        : preferences.visible.filter((item) => item !== id);
      save({ order: preferences.order, visible });
    },
    [columns, preferences, save],
  );

  const move = useCallback(
    (id: string, offset: -1 | 1) => {
      const order = [...preferences.order];
      const from = order.indexOf(id);
      const to = from + offset;
      if (from < 0 || to < 0 || to >= order.length) return;
      [order[from], order[to]] = [order[to], order[from]];
      save({ order, visible: preferences.visible });
    },
    [preferences, save],
  );

  const reset = useCallback(() => writeRaw(key, null), [key]);

  const isDefault = useMemo(() => {
    const fallback = defaults(columns);
    return (
      fallback.order.join() === preferences.order.join() &&
      [...fallback.visible].sort().join() === [...preferences.visible].sort().join()
    );
  }, [columns, preferences]);

  return { preferences, visibleColumns, toggle, move, reset, isDefault };
}

export type ColumnPreferencesState<T, C> = ReturnType<typeof useColumnPreferences<T, C>>;
