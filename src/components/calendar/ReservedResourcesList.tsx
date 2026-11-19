import type { ReservedResourceSummary } from "#/lib/types/reservation-types";
import { statusLabel, statusVariantClass } from "#/lib/utils/reservation-utils";
import { cn } from "#/lib/utils.ts";

/** Lista de recursos de uma reserva (nome, quantidade e status), usada nos cards do calendário. */
export function ReservedResourcesList({
  resources,
  size = "sm",
}: {
  resources: ReservedResourceSummary[];
  size?: "xs" | "sm";
}) {
  return (
    <ul className="flex flex-col gap-1">
      {resources.map((resource) => (
        <li key={resource.name} className="flex items-center gap-2">
          <span className={cn("min-w-0 flex-1 truncate", size === "xs" ? "text-xs" : "text-sm")}>
            {resource.name}
            <span className="text-muted-foreground"> × {resource.quantity}</span>
          </span>
          <span
            className={cn(
              "shrink-0 rounded border px-1 text-[10px] font-semibold",
              statusVariantClass(resource.status),
            )}
          >
            {statusLabel(resource.status)}
          </span>
        </li>
      ))}
    </ul>
  );
}
