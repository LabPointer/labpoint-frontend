import { Calendar, Clock, MapPin, Package, UserRound } from "lucide-react";
import type { ReactNode } from "react";
import { USAGE_STATUS, type UsageSession } from "#/lib/queries/usage";
import { UsageStatusBadge } from "./UsageStatusBadge";
import { fmtDate, fmtDateTime, fmtTime, sessionPlace, sessionSchedules, sessionShift } from "./usage-format";

type UsageSessionSummaryProps = {
  session: UsageSession;
  /** Mostra o dono da reserva (páginas da coordenação). */
  showAccount?: boolean;
  /** Mostra prazos de check-in/check-out. */
  showWindows?: boolean;
};

function Row({ icon, label, children }: { icon: ReactNode; label: string; children: ReactNode }) {
  return (
    <div className="flex items-start gap-2 text-sm">
      <span className="mt-0.5 text-violet-500 dark:text-violet-400">{icon}</span>
      <span className="min-w-20 font-semibold">{label}</span>
      <span className="text-foreground/90">{children}</span>
    </div>
  );
}

/** Cabeçalho da folha "Controle de uso diário": professor, data, turno, laboratório e horários. */
export function UsageSessionSummary({ session, showAccount = false, showWindows = false }: UsageSessionSummaryProps) {
  const status = Number(session.status);
  const iconClass = "size-4";

  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center justify-between gap-2">
        <p className="text-base font-bold">{sessionPlace(session)}</p>
        <UsageStatusBadge status={session.status} />
      </div>

      {showAccount && (
        <Row icon={<UserRound className={iconClass} />} label="Professor(a)">
          {session.account.userName ?? "Sem nome"}{" "}
          <span className="text-xs text-muted-foreground">({session.account.registration})</span>
        </Row>
      )}
      <Row icon={<Calendar className={iconClass} />} label="Data">
        {fmtDate(session.date)} · {sessionShift(session)}
      </Row>
      <Row icon={<Clock className={iconClass} />} label="Horários">
        {sessionSchedules(session)}
      </Row>
      {session.spaceName && (
        <Row icon={<MapPin className={iconClass} />} label="Laboratório">
          {session.spaceName}
        </Row>
      )}
      {session.resources.length > 0 && (
        <Row icon={<Package className={iconClass} />} label="Recursos">
          {session.resources.map((resource) => `${resource.name} × ${resource.quantity}`).join(", ")}
        </Row>
      )}

      {showWindows && status === USAGE_STATUS.SCHEDULED && (
        <p className="text-xs text-muted-foreground">
          Check-in de {fmtTime(session.checkInOpensAt)} até {fmtTime(session.checkInClosesAt)}.
        </p>
      )}
      {showWindows && status === USAGE_STATUS.CHECKED_IN && (
        <p className="text-xs text-muted-foreground">
          Check-out de {fmtTime(session.checkOutOpensAt)} até {fmtTime(session.checkOutClosesAt)}.
        </p>
      )}

      {(session.checkedInAt || session.checkedOutAt) && (
        <p className="text-xs text-muted-foreground">
          {session.checkedInAt && <>Check-in às {fmtDateTime(session.checkedInAt)}</>}
          {session.checkedOutAt && (
            <>
              {" · "}Check-out às {fmtDateTime(session.checkedOutAt)}
              {session.checkedOutBy && <> por {session.checkedOutBy.userName ?? "coordenação"} (coordenação)</>}
            </>
          )}
        </p>
      )}
    </div>
  );
}
