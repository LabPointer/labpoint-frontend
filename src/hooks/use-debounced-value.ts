import { useDebounce } from "ahooks";
import { useMemo } from "react";

/**
 * Debounce de um valor (primitivo, array ou objeto simples).
 *
 * O valor é estabilizado por conteúdo: se o chamador monta um objeto novo a cada render
 * (`{ search, status }`), o `useDebounce` do ahooks (que compara por referência) disparava
 * um novo ciclo setState → render → novo objeto a cada `wait` ms, para sempre.
 */
export function useDebouncedValue<T>(value: T, wait = 500): T {
  const key = JSON.stringify(value);
  const stable = useMemo(() => value, [key]);
  return useDebounce(stable, { wait });
}
