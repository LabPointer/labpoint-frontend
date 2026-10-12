import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type QueryBoundaryProps = {
  isPending: boolean;
  isFetching?: boolean;
  isError: boolean;
  error: unknown;
  isEmpty: boolean;
  loadingText?: string;
  emptyText?: string;
  children: ReactNode;
};

/**
 * Estados de uma listagem (carregando / erro / vazio / conteúdo).
 * `isPending` só é true na primeira carga: nas buscas seguintes a lista anterior continua na tela,
 * levemente esmaecida, em vez de ser desmontada a cada tecla digitada.
 */
export function QueryBoundary({
  isPending,
  isFetching = false,
  isError,
  error,
  isEmpty,
  loadingText = "Carregando...",
  emptyText = "Nenhum resultado encontrado.",
  children,
}: QueryBoundaryProps) {
  if (isPending) {
    return (
      <div className="flex h-32 items-center justify-center">
        <p className="animate-pulse font-bold text-muted-foreground">{loadingText}</p>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex h-32 items-center justify-center">
        <p className="font-bold text-destructive">
          Erro: {error instanceof Error ? error.message : "Erro desconhecido."}
        </p>
      </div>
    );
  }

  if (isEmpty) {
    return (
      <div className="flex h-32 items-center justify-center">
        <p className="font-bold text-muted-foreground">{emptyText}</p>
      </div>
    );
  }

  return (
    <div className={cn("transition-opacity", isFetching && "opacity-60")} aria-busy={isFetching}>
      {children}
    </div>
  );
}
