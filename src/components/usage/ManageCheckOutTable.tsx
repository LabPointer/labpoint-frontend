import { ClipboardCheck, FileText, Pencil } from "lucide-react";
import { hasCheckIn, USAGE_STATUS, type UsageSession } from "#/lib/queries/usage";
import type { DataColumn } from "@/components/shared/data-table/columns";
import { DataTable } from "@/components/shared/data-table/DataTable";
import { Button } from "@/components/ui/button";
import { UsageEmailStatus } from "./UsageEmailStatus";
import { UsageStatusBadge } from "./UsageStatusBadge";
import { fmtDate, fmtDateTime, sessionPlace, sessionSchedules, sessionShift } from "./usage-format";

export const checkOutColumns: DataColumn<UsageSession>[] = [
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
  { id: "schedules", label: "Horários", cellClassName: "text-xs", cell: sessionSchedules },
  {
    id: "status",
    label: "Status",
    defaultVisible: true,
    headClassName: "text-center",
    cellClassName: "text-center",
    cell: (session) => <UsageStatusBadge status={Number(session.status)} />,
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
  columns: DataColumn<UsageSession>[];
  onView: (session: UsageSession) => void;
  onEdit: (session: UsageSession) => void;
  onCheckOut: (session: UsageSession) => void;
};

export function ManageCheckOutTable({ sessions, columns, onView, onEdit, onCheckOut }: ManageCheckOutTableProps) {
  return (
    <DataTable
      rows={sessions}
      columns={columns}
      context={undefined}
      getRowKey={(session) => session.id}
      caption="Sessões de uso (reserva x dia x turno)."
      actions={(session) => (
        <CheckOutActions session={session} onView={onView} onEdit={onEdit} onCheckOut={onCheckOut} />
      )}
    />
  );
}

function CheckOutActions({
  session,
  onView,
  onEdit,
  onCheckOut,
}: {
  session: UsageSession;
  onView: (session: UsageSession) => void;
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
        aria-label="Ver relatório"
        title="Ver relatório"
        disabled={!reported}
        onClick={() => onView(session)}
      >
        <FileText className="size-4" />
      </Button>
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
      <Button size="sm" disabled={!canClose} aria-label="Fechar check-out" onClick={() => onCheckOut(session)}>
        <ClipboardCheck className="size-4" />
        Fechar check-out
      </Button>
    </>
  );
}
