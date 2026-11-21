import { ArrowDown, ArrowUp, Columns3, RotateCcw } from "lucide-react";
import { useId } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import type { DataColumn } from "./columns";
import type { ColumnPreferencesState } from "./use-column-preferences";

type ColumnChooserProps<T, C> = {
  columns: DataColumn<T, C>[];
  state: ColumnPreferencesState<T, C>;
};

/** Botão "Colunas": mostra/oculta e reordena as colunas da tabela. A escolha fica salva no navegador. */
export function ColumnChooser<T, C>({ columns, state }: ColumnChooserProps<T, C>) {
  const { preferences, toggle, move, reset, isDefault } = state;
  const byId = new Map(columns.map((column) => [column.id, column]));
  const visible = new Set(preferences.visible);
  const ordered = preferences.order.map((id) => byId.get(id)).filter((c): c is DataColumn<T, C> => c !== undefined);
  const hiddenCount = columns.length - preferences.visible.length;

  return (
    <Popover>
      <PopoverTrigger render={<Button type="button" variant="outline" size="sm" />}>
        <Columns3 className="size-4" />
        Colunas
        {hiddenCount > 0 && <span className="text-xs text-muted-foreground">({preferences.visible.length})</span>}
      </PopoverTrigger>
      {/* Fundo translúcido com desfoque, como os dialogs de formulário. */}
      <PopoverContent
        align="end"
        className="w-[min(18rem,calc(100vw-2rem))] border bg-white/70 shadow-md backdrop-blur-xl dark:border-violet-500/10 dark:bg-black/70 dark:shadow-violet-300/15"
      >
        <div className="flex flex-col gap-0.5">
          <p className="font-medium">Colunas da tabela</p>
          <p className="text-xs text-muted-foreground">Marque para exibir e use as setas para mudar a ordem.</p>
        </div>

        <ul className="flex max-h-[50dvh] flex-col gap-1 overflow-y-auto">
          {ordered.map((column, index) => (
            <ColumnItem
              key={column.id}
              column={column}
              checked={visible.has(column.id)}
              isFirst={index === 0}
              isLast={index === ordered.length - 1}
              onToggle={(show) => toggle(column.id, show)}
              onMove={(offset) => move(column.id, offset)}
            />
          ))}
        </ul>

        <Button type="button" variant="ghost" size="sm" disabled={isDefault} onClick={reset} className="self-start">
          <RotateCcw className="size-4" />
          Restaurar padrão
        </Button>
      </PopoverContent>
    </Popover>
  );
}

function ColumnItem<T, C>({
  column,
  checked,
  isFirst,
  isLast,
  onToggle,
  onMove,
}: {
  column: DataColumn<T, C>;
  checked: boolean;
  isFirst: boolean;
  isLast: boolean;
  onToggle: (show: boolean) => void;
  onMove: (offset: -1 | 1) => void;
}) {
  const id = useId();
  const locked = column.hideable === false;

  return (
    <li className="flex items-center gap-2 rounded-md px-1 py-0.5 hover:bg-muted/60">
      <Checkbox id={id} checked={checked} disabled={locked} onCheckedChange={(value) => onToggle(value === true)} />
      <label htmlFor={id} className="min-w-0 flex-1 truncate py-1.5 text-sm">
        {column.label}
        {locked && <span className="text-xs text-muted-foreground"> (fixa)</span>}
      </label>
      <Button
        type="button"
        variant="ghost"
        size="icon-sm"
        aria-label={`Mover ${column.label} para cima`}
        disabled={isFirst}
        onClick={() => onMove(-1)}
      >
        <ArrowUp className="size-4" />
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="icon-sm"
        aria-label={`Mover ${column.label} para baixo`}
        disabled={isLast}
        onClick={() => onMove(1)}
      >
        <ArrowDown className="size-4" />
      </Button>
    </li>
  );
}
