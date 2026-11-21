import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Clock, FileText, Package, Pencil, X } from "lucide-react";
import { useMemo } from "react";
import { ReservedResourcesList } from "#/components/calendar/ReservedResourcesList";
import { useFormDialog } from "#/hooks/use-form-dialog";
import type { AdminReserve } from "#/lib/queries/admin-reserves";
import { statusFromNumber } from "#/lib/queries/reserves";
import { scheduleLabel, sortSchedules } from "#/lib/queries/schedules";
import { reportCount } from "#/lib/queries/usage";
import { statusLabel, statusVariantClass } from "#/lib/utils/reservation-utils";
import type { DataColumn } from "@/components/shared/data-table/columns";
import { DataTable } from "@/components/shared/data-table/DataTable";
import type { RowSelection } from "@/components/shared/data-table/use-row-selection";
import { IconCountButton } from "@/components/shared/IconCountButton";
import { InfoDialog } from "@/components/shared/InfoDialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { UsageSessionsDialog } from "@/components/usage/UsageSessionsDialog";
import { cn } from "@/lib/utils";

type ReserveTableContext = {
  onSchedules: (reserve: AdminReserve) => void;
  onResources: (reserve: AdminReserve) => void;
  onReport: (reserve: AdminReserve) => void;
};

export const reserveColumns: DataColumn<AdminReserve, ReserveTableContext>[] = [
  { id: "space", label: "Espaço", hideable: false, cellClassName: "font-bold", cell: (reserve) => reserve.spaces.name },
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
    id: "resources",
    label: "Recursos associados",
    headClassName: "text-center",
    cellClassName: "text-center",
    cell: (reserve, { onResources }) => (
      <IconCountButton
        icon={Package}
        label="Ver recursos associados"
        count={reserve.resources.length}
        onClick={() => onResources(reserve)}
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

type ManageReserveTableProps = {
  reserves: AdminReserve[];
  columns: DataColumn<AdminReserve, ReserveTableContext>[];
  onEdit: (reserve: AdminReserve) => void;
  onCancel: (reserve: AdminReserve) => void;
  /** Linhas marcadas para exportar os relatórios de uso em PDF. */
  selection?: RowSelection<AdminReserve>;
};

const fmtDate = (date: string) => format(parseISO(date), "dd/MM/yyyy", { locale: ptBR });

export function ManageReserveTable({ reserves, columns, onEdit, onCancel, selection }: ManageReserveTableProps) {
  const schedulesDialog = useFormDialog<AdminReserve>();
  const resourcesDialog = useFormDialog<AdminReserve>();
  const reportDialog = useFormDialog<AdminReserve>();
  const target = schedulesDialog.target;
  const reportTarget = reportDialog.target;
  const resourcesTarget = resourcesDialog.target;
  const context = useMemo<ReserveTableContext>(
    () => ({ onSchedules: schedulesDialog.open, onResources: resourcesDialog.open, onReport: reportDialog.open }),
    [schedulesDialog.open, resourcesDialog.open, reportDialog.open],
  );

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

      <DataTable
        rows={reserves}
        columns={columns}
        context={context}
        getRowKey={(reserve) => reserve.id}
        caption="Lista de reservas."
        selection={selection}
        rowLabel={(reserve) => `${reserve.spaces.name}, ${reserve.account.username}`}
        actions={(reserve) => (
          <>
            <Button variant="outline" size="icon" aria-label="Alterar reserva" onClick={() => onEdit(reserve)}>
              <Pencil className="size-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              aria-label="Cancelar reserva"
              disabled={statusFromNumber(reserve.status) === "CANCELED"}
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

/** Período da reserva; no celular a data final quebra linha em vez de alargar a tabela. */
export function PeriodText({ from, to }: { from: string; to: string }) {
  if (from === to) return <span className="whitespace-nowrap">{fmtDate(from)}</span>;
  return (
    <span className="inline-flex flex-wrap justify-center gap-x-1">
      <span className="whitespace-nowrap">{fmtDate(from)} a</span>
      <span className="whitespace-nowrap">{fmtDate(to)}</span>
    </span>
  );
}

export function ReserveStatusBadge({ status }: { status: ReturnType<typeof statusFromNumber> }) {
  return (
    <Badge
      variant="outline"
      className={cn("rounded-full px-2.5 py-0.5 text-xs font-medium", statusVariantClass(status))}
    >
      {statusLabel(status)}
    </Badge>
  );
}

/** Relatório de uso: ícone + (n), n = turnos com check-in. Sem nenhum, fica desabilitado. */
export function ReportButton({ count, onClick }: { count: number; onClick: () => void }) {
  return (
    <IconCountButton
      icon={FileText}
      label="Ver relatório de uso"
      count={count}
      disabled={count === 0}
      title={count === 0 ? "Sem uso registrado" : undefined}
      onClick={onClick}
    />
  );
}
