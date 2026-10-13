import { FilterIcon } from "lucide-react";
import type { ReservationStatus } from "#/lib/types/reservation-types";
import { RESERVE_STATUS_LIST, statusLabel, statusToColor } from "#/lib/utils/reservation-utils";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

type StatusFilterButtonProps = {
  /** Status visíveis no calendário. */
  value: ReservationStatus[];
  onChange: (value: ReservationStatus[]) => void;
};

/** Botão que abre a lista de status da reserva para filtrar os eventos do calendário. */
export function StatusFilterButton({ value, onChange }: StatusFilterButtonProps) {
  const filtered = value.length !== RESERVE_STATUS_LIST.length;

  function toggle(status: ReservationStatus, checked: boolean) {
    // mantém a ordem canônica dos status
    onChange(RESERVE_STATUS_LIST.filter((item) => (item === status ? checked : value.includes(item))));
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button type="button" variant={filtered ? "default" : "outline"} size="sm" aria-label="Filtrar por status">
            <FilterIcon data-icon="inline-start" />
            Status{filtered ? ` (${value.length}/${RESERVE_STATUS_LIST.length})` : ""}
          </Button>
        }
      />
      <DropdownMenuContent align="end" className="w-52">
        {RESERVE_STATUS_LIST.map((status) => (
          <DropdownMenuCheckboxItem
            key={status}
            checked={value.includes(status)}
            onCheckedChange={(checked) => toggle(status, checked)}
          >
            <span className="size-2.5 rounded-full" style={{ backgroundColor: statusToColor(status) }} />
            {statusLabel(status)}
          </DropdownMenuCheckboxItem>
        ))}
        <DropdownMenuSeparator />
        <DropdownMenuItem disabled={!filtered} onClick={() => onChange([...RESERVE_STATUS_LIST])}>
          Mostrar todos
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
