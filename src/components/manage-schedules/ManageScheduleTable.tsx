import { Pencil } from "lucide-react";
import { type Schedule, shiftLabels } from "#/lib/queries/schedules";
import { DeleteButton } from "@/components/shared/DeleteButton";
import type { DataColumn } from "@/components/shared/data-table/columns";
import { DataTable } from "@/components/shared/data-table/DataTable";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Button } from "@/components/ui/button";

/** Rótulo do horário; também é o texto digitado para confirmar a exclusão. */
export const scheduleTimeLabel = (schedule: Pick<Schedule, "startAt" | "endAt">) =>
  `${schedule.startAt.slice(0, 5)} - ${schedule.endAt.slice(0, 5)}`;

export const scheduleColumns: DataColumn<Schedule>[] = [
  { id: "time", label: "Horário", hideable: false, cellClassName: "font-bold", cell: scheduleTimeLabel },
  {
    id: "shift",
    label: "Turno",
    defaultVisible: true,
    headClassName: "text-center",
    cellClassName: "text-center",
    cell: (schedule) => shiftLabels[schedule.shift] ?? "—",
  },
  {
    id: "status",
    label: "Status",
    defaultVisible: true,
    headClassName: "text-center",
    cellClassName: "text-center",
    cell: (schedule) => <StatusBadge active={schedule.enabled} />,
  },
];

type ManageScheduleTableProps = {
  schedules: Schedule[];
  columns: DataColumn<Schedule>[];
  onEdit: (schedule: Schedule) => void;
  onDelete: (schedule: Schedule) => void;
};

export function ManageScheduleTable({ schedules, columns, onEdit, onDelete }: ManageScheduleTableProps) {
  return (
    <DataTable
      rows={schedules}
      columns={columns}
      context={undefined}
      getRowKey={(schedule) => schedule.id}
      caption="Lista de horários."
      actions={(schedule) => (
        <>
          <Button variant="outline" size="icon" aria-label="Editar horário" onClick={() => onEdit(schedule)}>
            <Pencil className="size-4" />
          </Button>
          <DeleteButton label={`Excluir horário ${scheduleTimeLabel(schedule)}`} onClick={() => onDelete(schedule)} />
        </>
      )}
    />
  );
}
