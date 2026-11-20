import type { ReactNode } from "react";

/**
 * Coluna de uma tabela da coordenação. A ordem do array é a ordem padrão.
 * `actions` (botões da linha) não entra no seletor: fica sempre visível e por último.
 * As definições devem ser estáveis (constante de módulo), pois a preferência salva é resolvida a partir delas.
 */
export type DataColumn<T, C = undefined> = {
  id: string;
  /** Nome mostrado no cabeçalho e no seletor de colunas. */
  label: string;
  /** `context` traz o que a célula precisa da tabela (ex.: abrir um dialog). */
  cell: (row: T, context: C) => ReactNode;
  headClassName?: string;
  cellClassName?: string;
  /** Visível na configuração padrão. Deixe só as colunas principais, para caber no celular. */
  defaultVisible?: boolean;
  /** `false` = não pode ser ocultada (ex.: o nome do item). Ainda pode mudar de posição. */
  hideable?: boolean;
};

export type ColumnPreferences = {
  /** Ordem das colunas (ids). */
  order: string[];
  /** Colunas visíveis (ids). */
  visible: string[];
};
