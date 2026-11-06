import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Clock, FileText, Package, Pencil, X } from "lucide-react";
import { memo } from "react";
import { ReservedResourcesList } from "#/components/calendar/ReservedResourcesList";
import { useFormDialog } from "#/hooks/use-form-dialog";
import type { AdminReserve } from "#/lib/queries/admin-reserves";
import { statusFromNumber } from "#/lib/queries/reserves";
import { scheduleLabel, sortSchedules } from "#/lib/queries/schedules";
import { reportCount } from "#/lib/queries/usage";
import { statusLabel, statusVariantClass } from "#/lib/utils/reservation-utils";
import { InfoDialog } from "@/components/shared/InfoDialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { UsageSessionsDialog } from "@/components/usage/UsageSessionsDialog";
import { cn } from "@/lib/utils";

type ManageReserveTableProps = {
  reserves: AdminReserve[];
  onEdit: (reserve: AdminReserve) => void;
  onCancel: (reserve: AdminReserve) => void;
};

const fmtDate = (date: string) => format(parseISO(date), "dd/MM/yyyy", { locale: ptBR });

export function ManageReserveTable({ reserves, onEdit, onCancel }: ManageReserveTableProps) {
  const schedulesDialog = useFormDialog<AdminReserve>();
  const resourcesDialog = useFormDialog<AdminReserve>();
  const reportDialog = useFormDialog<AdminReserve>();
  const target = schedulesDialog.target;
  const reportTarget = reportDialog.target;
  const resourcesTarget = resourcesDialog.target;

  return (
    <>
      {target && (
        <InfoDialog
          open={schedulesDialog.isOpen}
          onClose={schedulesDialog.close}
          title={`Horários · ${target.spaces.name}`}
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

      {resourcesTarget && (
        <InfoDialog
          open={resourcesDialog.isOpen}
          onClose={resourcesDialog.close}
          title={`Recursos · ${resourcesTarget.spaces.name}`}
          description={`Recursos reservados junto com a sala por ${resourcesTarget.account.username}.`}
        >
          {resourcesTarget.resources.length === 0 ? (
            <p className="text-muted-foreground">Nenhum recurso associado a esta reserva.</p>
          ) : (
            <div className="rounded-md border p-2">
              <ReservedResourcesList
                resources={resourcesTarget.resources.map((resource) => ({
                  name: resource.name,
                  quantity: Number(resource.quantity),
                  status: statusFromNumber(resource.status),
                }))}
              />
            </div>
          )}
        </InfoDialog>
      )}

      {reportTarget && (
        <UsageSessionsDialog
          key={reportDialog.session}
          kind="space"
          reserveId={Number(reportTarget.id)}
          title={`Relatório de uso · ${reportTarget.spaces.name}`}
          description={`Check-in, check-out e controle de notebooks da reserva de ${reportTarget.account.username}.`}
          open={reportDialog.isOpen}
          onClose={reportDialog.close}
          editable
        />
      )}

      <Table className="w-full border bg-white p-4 shadow-md hover:shadow-lg dark:border-violet-500/10 dark:bg-white/5 dark:shadow-violet-300/15">
        <TableCaption>Lista de reservas.</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead>Espaço</TableHead>
            <TableHead>Usuário</TableHead>
            <TableHead className="text-center">Período</TableHead>
            <TableHead className="text-center">Horários</TableHead>
            <TableHead className="text-center">Recursos associados</TableHead>
            <TableHead className="text-center">Status</TableHead>
            <TableHead className="text-center">Relatório</TableHead>
            <TableHead className="text-right">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {reserves.map((reserve) => (
            <ManageReserveRow
              key={reserve.id}
              reserve={reserve}
              onEdit={onEdit}
              onCancel={onCancel}
              onSchedules={schedulesDialog.open}
              onResources={resourcesDialog.open}
              onReport={reportDialog.open}
            />
          ))}
        </TableBody>
      </Table>
    </>
  );
}

const ManageReserveRow = memo(function ManageReserveRow({
  reserve,
  onEdit,
  onCancel,
  onSchedules,
  onResources,
  onReport,
}: {
  reserve: AdminReserve;
  onEdit: (reserve: AdminReserve) => void;
  onCancel: (reserve: AdminReserve) => void;
  onSchedules: (reserve: AdminReserve) => void;
  onResources: (reserve: AdminReserve) => void;
  onReport: (reserve: AdminReserve) => void;
}) {
  const status = statusFromNumber(reserve.status);
  const isCanceled = status === "CANCELED";

  return (
    <TableRow>
      <TableCell className="font-bold">{reserve.spaces.name}</TableCell>
      <TableCell>
        <div className="flex flex-col">
          <span>{reserve.account.username}</span>
          <span className="text-xs text-muted-foreground">{reserve.account.registration}</span>
        </div>
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
        <Button type="button" variant="outline" size="sm" onClick={() => onResources(reserve)}>
          <Package className="size-4" />
          Ver recursos ({reserve.resources.length})
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
      <TableCell className="text-center">
        <ReportButton count={reportCount(reserve.usage)} onClick={() => onReport(reserve)} />
      </TableCell>
      <TableCell className="text-right">
        <div className="flex items-center justify-end gap-x-2">
          <Button variant="outline" size="icon" aria-label="Alterar reserva" onClick={() => onEdit(reserve)}>
            <Pencil className="size-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            aria-label="Cancelar reserva"
            disabled={isCanceled}
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

/** "Ver relatório (n)": n = turnos com check-in. Sem nenhum, fica desabilitado. */
export function ReportButton({ count, onClick }: { count: number; onClick: () => void }) {
  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      disabled={count === 0}
      title={count === 0 ? "Sem uso registrado" : undefined}
      onClick={onClick}
    >
      <FileText className="size-4" />
      Ver relatório{count > 0 ? ` (${count})` : ""}
    </Button>
  );
}
