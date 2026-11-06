import { usageStatusClass, usageStatusLabel } from "#/lib/queries/usage";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export function UsageStatusBadge({ status, className }: { status: number | string; className?: string }) {
  return (
    <Badge
      variant="outline"
      className={cn("rounded-full px-2.5 py-0.5 text-xs font-medium", usageStatusClass(status), className)}
    >
      {usageStatusLabel(status)}
    </Badge>
  );
}
