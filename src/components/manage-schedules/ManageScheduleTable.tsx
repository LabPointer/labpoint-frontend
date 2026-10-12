import { Pencil } from "lucide-react";
import { memo } from "react";
import { type Schedule, shiftLabels } from "#/lib/queries/schedules";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

type ManageScheduleTableProps = {
  schedules: Schedule[];
  onEdit: (schedule: Schedule) => void;
};

export function ManageScheduleTable({ schedules, onEdit }: ManageScheduleTableProps) {
  return (
    <Table className="w-full border bg-white p-4 shadow-md hover:shadow-lg dark:border-violet-500/10 dark:bg-white/5 dark:shadow-violet-300/15">
      <TableCaption>Lista de horários.</TableCaption>
      <TableHeader>
        <TableRow>
          <TableHead className="w-25">Horário</TableHead>
          <TableHead className="text-center">Turno</TableHead>
          <TableHead className="text-center">Status</TableHead>
          <TableHead className="text-right">Ações</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {schedules.map((schedule) => (
          <ManageScheduleRow key={schedule.id} schedule={schedule} onEdit={onEdit} />
        ))}
      </TableBody>
    </Table>
  );
}

const ManageScheduleRow = memo(function ManageScheduleRow({
  schedule,
  onEdit,
}: {
  schedule: Schedule;
  onEdit: (schedule: Schedule) => void;
}) {
  return (
    <TableRow>
      <TableCell className="w-25 font-bold">
        {schedule.startAt.slice(0, 5)} - {schedule.endAt.slice(0, 5)}
      </TableCell>
      <TableCell className="text-center">{shiftLabels[schedule.shift] ?? "—"}</TableCell>
      <TableCell className="text-center">
        <StatusBadge active={schedule.enabled} />
      </TableCell>
      <TableCell className="text-right">
        <div className="flex items-center justify-end gap-x-2">
          <Button variant="outline" size="icon" aria-label="Editar horário" onClick={() => onEdit(schedule)}>
            <Pencil className="size-4" />
          </Button>
        </div>
      </TableCell>
    </TableRow>
  );
});
