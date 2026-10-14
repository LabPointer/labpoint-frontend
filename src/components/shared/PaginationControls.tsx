import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

type PaginationControlsProps = {
  /** página atual, começando em 0 */
  page: number;
  hasNext: boolean;
  onPageChange: (page: number) => void;
  /** enquanto carrega, a navegação fica desabilitada (evita pular para uma página que talvez não exista) */
  isFetching?: boolean;
};

/** Anterior / próxima. Some quando só existe uma página. */
export function PaginationControls({ page, hasNext, onPageChange, isFetching = false }: PaginationControlsProps) {
  if (page === 0 && !hasNext) return null;

  return (
    <nav aria-label="Paginação" className="mt-6 flex items-center justify-center gap-4">
      <Button
        type="button"
        variant="outline"
        disabled={page === 0 || isFetching}
        onClick={() => onPageChange(page - 1)}
      >
        <ChevronLeftIcon data-icon="inline-start" />
        Anterior
      </Button>
      <span className="text-sm font-bold" aria-current="page">
        Página {page + 1}
      </span>
      <Button type="button" variant="outline" disabled={!hasNext || isFetching} onClick={() => onPageChange(page + 1)}>
        Próxima
        <ChevronRightIcon data-icon="inline-end" />
      </Button>
    </nav>
  );
}
