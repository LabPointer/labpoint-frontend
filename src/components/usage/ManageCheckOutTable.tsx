import { ClipboardCheck, Clock, FileText, Pencil } from "lucide-react";
import { useMemo } from "react";
import { useFormDialog } from "#/hooks/use-form-dialog";
import { hasCheckIn, USAGE_STATUS, type UsageSession } from "#/lib/queries/usage";
import type { DataColumn } from "@/components/shared/data-table/columns";
import { DataTable } from "@/components/shared/data-table/DataTable";
import type { RowSelection } from "@/components/shared/data-table/use-row-selection";
import { IconCountButton } from "@/components/shared/IconCountButton";
import { InfoDialog } from "@/components/shared/InfoDialog";
import { Button } from "@/components/ui/button";
import { UsageEmailStatus } from "./UsageEmailStatus";
import { UsageStatusBadge } from "./UsageStatusBadge";
import { fmtDate, fmtDateTime, sessionPlace, sessionSchedules, sessionShift, sessionTitle } from "./usage-format";

type CheckOutTableContext = {
  onSchedules: (session: UsageSession) => void;
  onView: (session: UsageSession) => void;
};

export const checkOutColumns: DataColumn<UsageSession, CheckOutTableContext>[] = [
  {
    id: "place",
    label: "Sala / recurso",
    hideable: false,
    cellClassName: "font-bold",
    cell: (session) => (
      <>
        {sessionPlace(session)}
        {!session.spaceName && <span className="block text-xs font-normal text-muted-foreground">Recurso avulso</span>}
      </>
    ),
  },
  {
    id: "user",
    label: "Usuário",
    defaultVisible: true,
    cell: (session) => (
      <div className="flex flex-col">
        <span>{session.account.userName ?? "Sem nome"}</span>
        <span className="text-xs text-muted-foreground">{session.account.registration}</span>
      </div>
    ),
  },
  {
    id: "date",
    label: "Data",
    defaultVisible: true,
    headClassName: "text-center",
    cellClassName: "text-center whitespace-nowrap",
    cell: (session) => fmtDate(session.date),
  },
  {
    id: "shift",
    label: "Turno",
    headClassName: "text-center",
    cellClassName: "text-center",
    cell: sessionShift,
  },
  {
    id: "schedules",
    label: "Horários",
    defaultVisible: true,
    headClassName: "text-center",
    cellClassName: "text-center",
    cell: (session, { onSchedules }) => (
      <IconCountButton
        icon={Clock}
        label="Ver horários"
        count={session.schedules.length}
        onClick={() => onSchedules(session)}
      />
    ),
  },
  {
    id: "status",
    label: "Status",
    defaultVisible: true,
    headClassName: "text-center",
    cellClassName: "text-center",
    cell: (session) => <UsageStatusBadge status={Number(session.status)} />,
  },
  {
    id: "report",
    label: "Relatório",
    defaultVisible: true,
    headClassName: "text-center",
    cellClassName: "text-center",
    cell: (session, { onView }) => {
      const reported = hasCheckIn(Number(session.status));
      return (
        <IconCountButton
          icon={FileText}
          label="Ver relatório de uso"
          disabled={!reported}
          title={reported ? undefined : "Sem check-in: ainda não há relatório"}
          onClick={() => onView(session)}
        />
      );
    },
  },
  {
    id: "checkIn",
    label: "Check-in",
    headClassName: "text-center",
    cellClassName: "text-center text-xs",
    cell: (session) => (session.checkedInAt ? fmtDateTime(session.checkedInAt) : "—"),
  },
  {
    id: "checkOut",
    label: "Check-out",
    headClassName: "text-center",
    cellClassName: "text-center text-xs",
    cell: (session) => (
      <>
        {session.checkedOutAt ? fmtDateTime(session.checkedOutAt) : "—"}
        {session.checkedOutBy && <span className="block text-muted-foreground">pela coordenação</span>}
      </>
    ),
  },
  {
    id: "emails",
    label: "Avisos por e-mail",
    defaultVisible: true,
    cell: (session) => <UsageEmailStatus session={session} />,
  },
];

type ManageCheckOutTableProps = {
  sessions: UsageSession[];
  columns: DataColumn<UsageSession, CheckOutTableContext>[];
  onView: (session: UsageSession) => void;
  onEdit: (session: UsageSession) => void;
  onCheckOut: (session: UsageSession) => void;
  /** Linhas marcadas para exportar os relatórios em PDF. */
  selection?: RowSelection<UsageSession>;
};

export function ManageCheckOutTable({
  sessions,
  columns,
  onView,
  onEdit,
  onCheckOut,
  selection,
}: ManageCheckOutTableProps) {
  const schedulesDialog = useFormDialog<UsageSession>();
  const openSchedules = schedulesDialog.open;
  const context = useMemo<CheckOutTableContext>(
    () => ({ onSchedules: openSchedules, onView }),
    [openSchedules, onView],
  );
  const target = schedulesDialog.target;

  return (
    <>
      {target && (
        <InfoDialog
          open={schedulesDialog.isOpen}
          onClose={schedulesDialog.close}
          title="Horários"
          description={sessionTitle(target)}
        >
          <ul className="flex flex-col gap-2">
            {sessionSchedules(target)
              .split(" · ")
              .map((label) => (
                <li key={label} className="rounded-md border p-2 text-sm">
                  {label}
                </li>
              ))}
          </ul>
        </InfoDialog>
      )}
      <DataTable
        rows={sessions}
        columns={columns}
        context={context}
        getRowKey={(session) => session.id}
        caption="Sessões de uso (reserva x dia x turno)."
        selection={selection}
        rowLabel={sessionTitle}
        actions={(session) => <CheckOutActions session={session} onEdit={onEdit} onCheckOut={onCheckOut} />}
      />
    </>
  );
}

/** Editar o relatório e fechar o check-out, só com ícones (o "ver relatório" fica na coluna Relatório). */
function CheckOutActions({
  session,
  onEdit,
  onCheckOut,
}: {
  session: UsageSession;
  onEdit: (session: UsageSession) => void;
  onCheckOut: (session: UsageSession) => void;
}) {
  const status = Number(session.status);
  const canClose = status === USAGE_STATUS.CHECKED_IN || status === USAGE_STATUS.CHECKOUT_PENDING;
  const reported = hasCheckIn(status);

  return (
    <>
      <Button
        variant="outline"
        size="icon"
        aria-label="Editar relatório"
        title="Editar relatório"
        disabled={!reported}
        onClick={() => onEdit(session)}
      >
        <Pencil className="size-4" />
      </Button>
      <Button
        size="icon"
        aria-label="Fechar check-out"
        title="Fechar check-out"
        disabled={!canClose}
        onClick={() => onCheckOut(session)}
      >
        <ClipboardCheck className="size-4" />
      </Button>
    </>
  );
}
