import { Clock, Pencil, X } from "lucide-react";
import { useMemo } from "react";
import { useFormDialog } from "#/hooks/use-form-dialog";
import { statusFromNumber } from "#/lib/queries/reserves";
import { type AdminResourceReserve, isActiveReserveStatus } from "#/lib/queries/resource-reserves";
import { scheduleLabel, sortSchedules } from "#/lib/queries/schedules";
import { reportCount } from "#/lib/queries/usage";
import { PeriodText, ReportButton, ReserveStatusBadge } from "@/components/manage-reserves/ManageReserveTable";
import type { DataColumn } from "@/components/shared/data-table/columns";
import { DataTable } from "@/components/shared/data-table/DataTable";
import type { RowSelection } from "@/components/shared/data-table/use-row-selection";
import { IconCountButton } from "@/components/shared/IconCountButton";
import { InfoDialog } from "@/components/shared/InfoDialog";
import { Button } from "@/components/ui/button";
import { UsageSessionsDialog } from "@/components/usage/UsageSessionsDialog";

type ResourceReserveTableContext = {
  onSchedules: (reserve: AdminResourceReserve) => void;
  onReport: (reserve: AdminResourceReserve) => void;
};

export const resourceReserveColumns: DataColumn<AdminResourceReserve, ResourceReserveTableContext>[] = [
  {
    id: "resource",
    label: "Recurso",
    hideable: false,
    cellClassName: "font-bold",
    cell: (reserve) => reserve.resource.name,
  },
  {
    id: "quantity",
    label: "Quantidade",
    headClassName: "text-center",
    cellClassName: "text-center tabular-nums",
    cell: (reserve) => (
      <>
        {reserve.quantity}
        <span className="text-xs text-muted-foreground"> / {reserve.resource.quantity}</span>
      </>
    ),
  },
  {
    id: "user",
    label: "Usuário",
    defaultVisible: true,
    cell: (reserve) => (
      <div className="flex flex-col">
        <span>{reserve.account.username}</span>
        <span className="text-xs text-muted-foreground">{reserve.account.registration}</span>
      </div>
    ),
  },
  {
    id: "space",
    label: "Sala",
    cell: (reserve) =>
      reserve.spaceReserve ? reserve.spaceReserve.spaceName : <span className="text-muted-foreground">Avulsa</span>,
  },
  {
    id: "period",
    label: "Período",
    defaultVisible: true,
    headClassName: "text-center",
    cellClassName: "text-center",
    cell: (reserve) => <PeriodText from={reserve.dateFrom} to={reserve.dateTo} />,
  },
  {
    id: "schedules",
    label: "Horários",
    headClassName: "text-center",
    cellClassName: "text-center",
    cell: (reserve, { onSchedules }) => (
      <IconCountButton
        icon={Clock}
        label="Ver horários"
        count={reserve.schedules.length}
        onClick={() => onSchedules(reserve)}
      />
    ),
  },
  {
    id: "status",
    label: "Status",
    defaultVisible: true,
    headClassName: "text-center",
    cellClassName: "text-center",
    cell: (reserve) => <ReserveStatusBadge status={statusFromNumber(reserve.status)} />,
  },
  {
    id: "report",
    label: "Relatório",
    defaultVisible: true,
    headClassName: "text-center",
    cellClassName: "text-center",
    cell: (reserve, { onReport }) => (
      <ReportButton count={reportCount(reserve.usage)} onClick={() => onReport(reserve)} />
    ),
  },
];

type ManageResourceReserveTableProps = {
  reserves: AdminResourceReserve[];
  columns: DataColumn<AdminResourceReserve, ResourceReserveTableContext>[];
  onEdit: (reserve: AdminResourceReserve) => void;
  onCancel: (reserve: AdminResourceReserve) => void;
  /** Linhas marcadas para exportar os relatórios de uso em PDF. */
  selection?: RowSelection<AdminResourceReserve>;
};

export function ManageResourceReserveTable({
  reserves,
  columns,
  onEdit,
  onCancel,
  selection,
}: ManageResourceReserveTableProps) {
  const schedulesDialog = useFormDialog<AdminResourceReserve>();
  const reportDialog = useFormDialog<AdminResourceReserve>();
  const target = schedulesDialog.target;
  const reportTarget = reportDialog.target;
  const context = useMemo<ResourceReserveTableContext>(
    () => ({ onSchedules: schedulesDialog.open, onReport: reportDialog.open }),
    [schedulesDialog.open, reportDialog.open],
  );

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

      {reportTarget && (
        <UsageSessionsDialog
          key={reportDialog.session}
          kind="resource"
          reserveId={Number(reportTarget.id)}
          title={`Relatório de uso · ${reportTarget.resource.name}`}
          description={
            reportTarget.spaceReserve
              ? `Recurso vinculado à sala ${reportTarget.spaceReserve.spaceName}: o uso é registrado no check-in da sala.`
              : `Check-in, check-out e controle de notebooks da reserva de ${reportTarget.account.username}.`
          }
          open={reportDialog.isOpen}
          onClose={reportDialog.close}
          editable
        />
      )}

      <DataTable
        rows={reserves}
        columns={columns}
        context={context}
        getRowKey={(reserve) => reserve.id}
        caption="Lista de reservas de recurso."
        selection={selection}
        rowLabel={(reserve) => `${reserve.resource.name}, ${reserve.account.username}`}
        actions={(reserve) => (
          <>
            <Button
              variant="outline"
              size="icon"
              aria-label="Alterar reserva de recurso"
              onClick={() => onEdit(reserve)}
            >
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
          </>
        )}
      />
    </>
  );
}
