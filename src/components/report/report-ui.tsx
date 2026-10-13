import type { CSSProperties, ReactNode } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

/**
 * - loading: buscando o relatório (esqueleto pulsando)
 * - preview: mês sem reservas contabilizadas (esqueleto estático, borda tracejada e aviso de prévia)
 * - data: relatório real
 */
export type ReportMode = "loading" | "preview" | "data";

/** Mesmo visual dos cards do resto do site (histórico, tabelas), com borda tracejada no modo prévia. */
export const reportCardClass = (mode: ReportMode) =>
  cn(
    "rounded-md border bg-white p-4 shadow-md hover:shadow-lg dark:border-violet-500/10 dark:bg-white/5 dark:shadow-violet-300/15",
    mode === "preview" && "border-dashed border-violet-300 dark:border-violet-400/30",
  );

/** Bloco cinza que ocupa o lugar de um valor. Só pulsa enquanto carrega; na prévia fica parado. */
export function ReportSkeleton({
  mode,
  className,
  style,
}: {
  mode: ReportMode;
  className?: string;
  style?: CSSProperties;
}) {
  return <Skeleton className={cn(mode !== "loading" && "animate-none", className)} style={style} />;
}

/** Quadradinho violeta com ícone, igual ao logo da barra lateral. */
export function SectionIcon({ children }: { children: ReactNode }) {
  return (
    <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-violet-100 text-violet-700 dark:bg-violet-400/15 dark:text-violet-300">
      {children}
    </div>
  );
}

/** Barra de porcentagem (0 a 100). */
export function PercentBar({ value, colorClass, label }: { value: number; colorClass: string; label: string }) {
  const width = Math.max(0, Math.min(100, value));

  return (
    <div
      role="progressbar"
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={width}
      className="h-2.5 w-full overflow-hidden rounded-full bg-muted"
    >
      <div
        className={cn("h-full rounded-full transition-[width] duration-500", colorClass)}
        style={{ width: `${width}%` }}
      />
    </div>
  );
}
