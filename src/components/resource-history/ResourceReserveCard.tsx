import { parseISO, startOfToday } from "date-fns";
import { Building2, Package, Unlink } from "lucide-react";
import { memo } from "react";
import { isActiveReserveStatus, type ResourceReserve } from "#/lib/queries/resource-reserves";
import { reportCount } from "#/lib/queries/usage";
import { RESERVE_CARD_CLASS, ReserveCardIcon } from "@/components/shared/ReserveCardParts";
import {
  HistoryCardActions,
  ReservePeriodStat,
  ReservePurpose,
  ReserveSchedules,
  ReserveStatusBadge,
} from "@/components/shared/ReserveHistoryCardParts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type ResourceReserveCardProps = {
  reserve: ResourceReserve;
  onEdit: (reserve: ResourceReserve) => void;
  onCancel: (reserve: ResourceReserve) => void;
  /** Abre o relatório de uso (só aparece depois de algum check-in). */
  onReport?: (reserve: ResourceReserve) => void;
};

/** Ações só para reservas ativas que ainda não terminaram. */
export function canChangeResourceReserve(reserve: ResourceReserve, today = startOfToday()) {
  return isActiveReserveStatus(reserve.status) && parseISO(reserve.dateTo) >= today;
}

export const ResourceReserveCard = memo(function ResourceReserveCard({
  reserve,
  onEdit,
  onCancel,
  onReport,
}: ResourceReserveCardProps) {
  const linkedSpace = reserve.spaceReserve?.spaceName;

  return (
    <Card aria-label={`Reserva de ${reserve.resource.name}`} className={RESERVE_CARD_CLASS}>
      {/* Identificação: recurso, unidades reservadas e situação */}
      <CardHeader className="flex flex-row items-start gap-3 p-0">
        <ReserveCardIcon>
          <Package aria-hidden="true" />
        </ReserveCardIcon>
        <div className="min-w-0 flex-1">
          <CardTitle className="text-base leading-tight font-bold text-neutral-900 dark:text-neutral-100">
            <span className="line-clamp-2" title={reserve.resource.name}>
              {reserve.resource.name}
            </span>
          </CardTitle>
          <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-400">
            <strong className="font-semibold text-neutral-700 tabular-nums dark:text-neutral-200">
              {reserve.quantity}
            </strong>{" "}
            de {reserve.resource.quantity} unidade(s)
          </p>
        </div>
        <ReserveStatusBadge status={reserve.status} />
      </CardHeader>

      <CardContent className="flex flex-1 flex-col gap-4 p-0">
        <ReservePeriodStat dateFrom={reserve.dateFrom} dateTo={reserve.dateTo} />

        {/* Reserva feita junto com uma sala ou sozinha */}
        <p className="flex items-center gap-2 text-xs text-neutral-600 dark:text-neutral-300">
          {linkedSpace ? (
            <>
              <Building2 className="size-4 shrink-0 text-violet-600 dark:text-violet-400" aria-hidden="true" />
              <span className="min-w-0 truncate">
                Junto com a sala <strong className="font-semibold">{linkedSpace}</strong>
              </span>
            </>
          ) : (
            <>
              <Unlink className="size-4 shrink-0 text-violet-600 dark:text-violet-400" aria-hidden="true" />
              Reserva avulsa (sem sala)
            </>
          )}
        </p>

        <ReserveSchedules schedules={reserve.schedules} />
        <ReservePurpose purpose={reserve.purpose} />
      </CardContent>

      <HistoryCardActions
        reports={reportCount(reserve.usage)}
        onReport={onReport ? () => onReport(reserve) : undefined}
        showCTA={canChangeResourceReserve(reserve)}
        onEdit={() => onEdit(reserve)}
        onCancel={() => onCancel(reserve)}
      />
    </Card>
  );
});
