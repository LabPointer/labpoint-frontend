import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Clock, Pencil, X } from "lucide-react";
import { memo } from "react";
import { useFormDialog } from "#/hooks/use-form-dialog";
import { statusFromNumber } from "#/lib/queries/reserves";
import { type AdminResourceReserve, isActiveReserveStatus } from "#/lib/queries/resource-reserves";
import { scheduleLabel, sortSchedules } from "#/lib/queries/schedules";
import { statusLabel, statusVariantClass } from "#/lib/utils/reservation-utils";
import { InfoDialog } from "@/components/shared/InfoDialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { cn } from "@/lib/utils";

type ManageResourceReserveTableProps = {
  reserves: AdminResourceReserve[];
  onEdit: (reserve: AdminResourceReserve) => void;
  onCancel: (reserve: AdminResourceReserve) => void;
};

const fmtDate = (date: string) => format(parseISO(date), "dd/MM/yyyy", { locale: ptBR });

export function ManageResourceReserveTable({ reserves, onEdit, onCancel }: ManageResourceReserveTableProps) {
  const schedulesDialog = useFormDialog<AdminResourceReserve>();
  const target = schedulesDialog.target;

  return (
    <>
      {target && (
        <InfoDialog
          open={schedulesDialog.isOpen}
          onClose={schedulesDialog.close}
          title={`Horários · ${target.resource.name}`}
          description={`Horários da reserva de ${target.account.username}.`}
        >
          <ul className="flex flex-col gap-2">
            {sortSchedules(target.schedules).map((schedule) => (
              <li key={schedule.id} className="rounded-md border p-2 text-sm">
                {scheduleLabel(schedule)}
              </li>
            ))}
          </ul>
        </InfoDialog>
      )}

      <Table className="w-full border bg-white p-4 shadow-md hover:shadow-lg dark:border-violet-500/10 dark:bg-white/5 dark:shadow-violet-300/15">
        <TableCaption>Lista de reservas de recurso.</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead>Recurso</TableHead>
            <TableHead className="text-center">Quantidade</TableHead>
            <TableHead>Usuário</TableHead>
            <TableHead>Sala</TableHead>
            <TableHead className="text-center">Período</TableHead>
            <TableHead className="text-center">Horários</TableHead>
            <TableHead className="text-center">Status</TableHead>
            <TableHead className="text-right">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {reserves.map((reserve) => (
            <ManageResourceReserveRow
              key={reserve.id}
              reserve={reserve}
              onEdit={onEdit}
              onCancel={onCancel}
              onSchedules={schedulesDialog.open}
            />
          ))}
        </TableBody>
      </Table>
    </>
  );
}

const ManageResourceReserveRow = memo(function ManageResourceReserveRow({
  reserve,
  onEdit,
  onCancel,
  onSchedules,
}: {
  reserve: AdminResourceReserve;
  onEdit: (reserve: AdminResourceReserve) => void;
  onCancel: (reserve: AdminResourceReserve) => void;
  onSchedules: (reserve: AdminResourceReserve) => void;
}) {
  const status = statusFromNumber(reserve.status);

  return (
    <TableRow>
      <TableCell className="font-bold">{reserve.resource.name}</TableCell>
      <TableCell className="text-center tabular-nums">
        {reserve.quantity}
        <span className="text-xs text-muted-foreground"> / {reserve.resource.quantity}</span>
      </TableCell>
      <TableCell>
        <div className="flex flex-col">
          <span>{reserve.account.username}</span>
          <span className="text-xs text-muted-foreground">{reserve.account.registration}</span>
        </div>
      </TableCell>
      <TableCell>
        {reserve.spaceReserve ? reserve.spaceReserve.spaceName : <span className="text-muted-foreground">Avulsa</span>}
      </TableCell>
      <TableCell className="text-center whitespace-nowrap">
        {reserve.dateFrom === reserve.dateTo
          ? fmtDate(reserve.dateFrom)
          : `${fmtDate(reserve.dateFrom)} a ${fmtDate(reserve.dateTo)}`}
      </TableCell>
      <TableCell className="text-center">
        <Button type="button" variant="outline" size="sm" onClick={() => onSchedules(reserve)}>
          <Clock className="size-4" />
          Ver horários ({reserve.schedules.length})
        </Button>
      </TableCell>
      <TableCell className="text-center">
        <Badge
          variant="outline"
          className={cn("rounded-full px-2.5 py-0.5 text-xs font-medium", statusVariantClass(status))}
        >
          {statusLabel(status)}
        </Badge>
      </TableCell>
      <TableCell className="text-right">
        <div className="flex items-center justify-end gap-x-2">
          <Button variant="outline" size="icon" aria-label="Alterar reserva de recurso" onClick={() => onEdit(reserve)}>
            <Pencil className="size-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            aria-label="Cancelar reserva de recurso"
            disabled={!isActiveReserveStatus(reserve.status)}
            className="border-rose-300 text-rose-600 hover:bg-rose-50 hover:text-rose-700 dark:border-rose-900/70 dark:text-rose-400 dark:hover:bg-rose-950/40"
            onClick={() => onCancel(reserve)}
          >
            <X className="size-4" />
          </Button>
        </div>
      </TableCell>
    </TableRow>
  );
});
