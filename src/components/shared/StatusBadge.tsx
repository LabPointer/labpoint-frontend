import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const base = "rounded-full px-2.5 py-0.5 text-xs font-normal";
const positive =
  "border-emerald-500/30 bg-emerald-50 text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-950/40 dark:text-emerald-300";
const negative = "border-red-500/30 bg-red-50 text-red-700 dark:border-red-500/30 dark:bg-red-950/40 dark:text-red-300";

type StatusBadgeProps = {
  active: boolean;
  activeLabel?: string;
  inactiveLabel?: string;
  className?: string;
};

export function StatusBadge({ active, activeLabel = "Ativo", inactiveLabel = "Inativo", className }: StatusBadgeProps) {
  return (
    <Badge variant="outline" className={cn(base, active ? positive : negative, className)}>
      {active ? activeLabel : inactiveLabel}
    </Badge>
  );
}

/** Badge neutro (ex.: cargo) com o mesmo formato do StatusBadge. */
export function InfoBadge({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <Badge
      variant="outline"
      className={cn(
        base,
        "border-violet-500/30 bg-violet-50 text-violet-700 dark:bg-violet-950/40 dark:text-violet-300",
        className,
      )}
    >
      {children}
    </Badge>
  );
}
