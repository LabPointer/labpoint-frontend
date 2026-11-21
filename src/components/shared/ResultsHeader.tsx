import type { ReactNode } from "react";

type ResultsHeaderProps = {
  title: string;
  count: number;
  /** Controles ao lado da contagem (ex.: seletor de colunas). */
  actions?: ReactNode;
};

export function ResultsHeader({ title, count, actions }: ResultsHeaderProps) {
  return (
    <div className="mb-6 flex flex-wrap items-center justify-between gap-2">
      <h2 className="text-xl font-bold">{title}</h2>
      <div className="flex items-center gap-3">
        <span className="text-sm font-bold">Exibindo: {count}</span>
        {actions}
      </div>
    </div>
  );
}
