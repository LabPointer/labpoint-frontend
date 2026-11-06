import { ClipboardCheck, FileText, Pencil } from "lucide-react";
import { memo } from "react";
import { hasCheckIn, USAGE_STATUS, type UsageSession } from "#/lib/queries/usage";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { UsageStatusBadge } from "./UsageStatusBadge";
import { fmtDate, fmtDateTime, sessionPlace, sessionSchedules, sessionShift } from "./usage-format";

type ManageCheckOutTableProps = {
  sessions: UsageSession[];
  onView: (session: UsageSession) => void;
  onEdit: (session: UsageSession) => void;
  onCheckOut: (session: UsageSession) => void;
};

export function ManageCheckOutTable({ sessions, onView, onEdit, onCheckOut }: ManageCheckOutTableProps) {
  return (
    <Table className="w-full border bg-white p-4 shadow-md hover:shadow-lg dark:border-violet-500/10 dark:bg-white/5 dark:shadow-violet-300/15">
      <TableCaption>Sessões de uso (reserva x dia x turno).</TableCaption>
      <TableHeader>
        <TableRow>
          <TableHead>Sala / recurso</TableHead>
          <TableHead>Usuário</TableHead>
          <TableHead className="text-center">Data</TableHead>
          <TableHead className="text-center">Turno</TableHead>
          <TableHead>Horários</TableHead>
          <TableHead className="text-center">Status</TableHead>
          <TableHead className="text-center">Check-in</TableHead>
          <TableHead className="text-center">Check-out</TableHead>
          <TableHead className="text-right">Ações</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {sessions.map((session) => (
          <ManageCheckOutRow
            key={session.id}
            session={session}
            onView={onView}
            onEdit={onEdit}
            onCheckOut={onCheckOut}
          />
        ))}
      </TableBody>
    </Table>
  );
}

const ManageCheckOutRow = memo(function ManageCheckOutRow({
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
    <TableRow>
      <TableCell className="font-bold">
        {sessionPlace(session)}
        {!session.spaceName && <span className="block text-xs font-normal text-muted-foreground">Recurso avulso</span>}
      </TableCell>
      <TableCell>
        <div className="flex flex-col">
          <span>{session.account.userName ?? "Sem nome"}</span>
          <span className="text-xs text-muted-foreground">{session.account.registration}</span>
        </div>
      </TableCell>
      <TableCell className="text-center whitespace-nowrap">{fmtDate(session.date)}</TableCell>
      <TableCell className="text-center">{sessionShift(session)}</TableCell>
      <TableCell className="text-xs">{sessionSchedules(session)}</TableCell>
      <TableCell className="text-center">
        <UsageStatusBadge status={status} />
      </TableCell>
      <TableCell className="text-center text-xs whitespace-nowrap">
        {session.checkedInAt ? fmtDateTime(session.checkedInAt) : "—"}
      </TableCell>
      <TableCell className="text-center text-xs whitespace-nowrap">
        {session.checkedOutAt ? fmtDateTime(session.checkedOutAt) : "—"}
        {session.checkedOutBy && <span className="block text-muted-foreground">pela coordenação</span>}
      </TableCell>
      <TableCell className="text-right">
        <div className="flex items-center justify-end gap-x-2">
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
          <Button size="sm" disabled={!canClose} onClick={() => onCheckOut(session)}>
            <ClipboardCheck className="size-4" />
            Fechar check-out
          </Button>
        </div>
      </TableCell>
    </TableRow>
  );
});
