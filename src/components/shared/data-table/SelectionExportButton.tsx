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
      <Button
        type="button"
        size="sm"
        disabled={isPending}
        onClick={onExport}
        aria-label={isPending ? "Gerando PDF" : `Exportar PDF (${count})`}
        title={`Exportar PDF (${count})`}
      >
        {/* No celular fica só o ícone e a contagem, para a barra caber sem rolar para os lados. */}
        <FileDown className="size-4" />
        <span className="hidden sm:inline">{isPending ? "Gerando PDF..." : "Exportar PDF"}</span>
        <span className="tabular-nums">({count})</span>
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
