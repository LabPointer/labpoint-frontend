import { FileDown, X } from "lucide-react";
import { Button } from "@/components/ui/button";

type SelectionExportButtonProps = {
  count: number;
  isPending?: boolean;
  onExport: () => void;
  onClear: () => void;
};

/** Ação contextual da barra da tabela: aparece só com linhas marcadas (exportar os relatórios em PDF). */
export function SelectionExportButton({ count, isPending = false, onExport, onClear }: SelectionExportButtonProps) {
  if (count === 0) return null;
  return (
    <div className="flex items-center gap-1">
      <Button type="button" size="sm" disabled={isPending} onClick={onExport}>
        <FileDown className="size-4" />
        {isPending ? "Gerando PDF..." : `Exportar PDF (${count})`}
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="icon-sm"
        aria-label="Limpar seleção"
        title="Limpar seleção"
        disabled={isPending}
        onClick={onClear}
      >
        <X className="size-4" />
      </Button>
    </div>
  );
}
