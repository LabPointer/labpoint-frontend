import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";

/** Botão de exclusão permanente das tabelas da coordenação (abre o `DeleteConfirmDialog`). */
export function DeleteButton({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <Button
      variant="outline"
      size="icon"
      aria-label={label}
      title={label}
      className="border-rose-300 text-rose-600 hover:bg-rose-50 hover:text-rose-700 dark:border-rose-900/70 dark:text-rose-400 dark:hover:bg-rose-950/40"
      onClick={onClick}
    >
      <Trash2 className="size-4" />
    </Button>
  );
}
