import { FlaskConical, Users } from "lucide-react";
import { memo, useMemo } from "react";
import type { Reserve } from "#/lib/queries/reserves";
import { isActiveReserveStatus } from "#/lib/queries/resource-reserves";
import { reportCount } from "#/lib/queries/usage";
import { RESERVE_CARD_CLASS, ReserveCardIcon } from "@/components/shared/ReserveCardParts";
import {
  HistoryCardActions,
  ReservePeriodStat,
  ReservePurpose,
  ReserveSchedules,
  ReserveStatusBadge,
} from "@/components/shared/ReserveHistoryCardParts";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export interface HistoryCardProps {
  reserve: Reserve;
  /** Exibe os botões Alterar/Cancelar (somente reservas futuras). */
  showCTA: boolean;
  onEdit?: (reserve: Reserve) => void;
  onCancel?: (reserve: Reserve) => void;
  /** Abre o relatório de uso (só aparece depois de algum check-in). */
  onReport?: (reserve: Reserve) => void;
}

export const HistoryCard = memo(function HistoryCard({
  reserve,
  showCTA,
  onEdit,
  onCancel,
  onReport,
}: HistoryCardProps) {
  // só os recursos ainda ativos (cancelados/recusados individualmente não aparecem)
  const linkedResources = useMemo(
    () => (reserve.resources ?? []).filter((resource) => isActiveReserveStatus(resource.status)),
    [reserve.resources],
  );

  return (
    <Card aria-label={`Reserva de ${reserve.space.name}`} className={RESERVE_CARD_CLASS}>
      {/* Identificação: sala, capacidade e situação da reserva */}
      <CardHeader className="flex flex-row items-start gap-3 p-0">
        <ReserveCardIcon>
          <FlaskConical aria-hidden="true" />
        </ReserveCardIcon>
        <div className="min-w-0 flex-1">
          <CardTitle className="text-base leading-tight font-bold text-neutral-900 dark:text-neutral-100">
            <span className="line-clamp-2" title={reserve.space.name}>
              {reserve.space.name}
            </span>
          </CardTitle>
          <p className="mt-1 flex items-center gap-1 text-xs text-neutral-500 dark:text-neutral-400">
            <Users className="size-3.5 shrink-0" aria-hidden="true" />
            {reserve.space.capacity} lugares
          </p>
        </div>
        <ReserveStatusBadge status={reserve.status} />
      </CardHeader>

      <CardContent className="flex flex-1 flex-col gap-4 p-0">
        <ReservePeriodStat dateFrom={reserve.dateFrom} dateTo={reserve.dateTo} />
        <ReserveSchedules schedules={reserve.schedules} />

        {linkedResources.length > 0 && (
          <ul className="flex flex-wrap gap-1.5" aria-label="Recursos reservados junto">
            {linkedResources.map((resource) => (
              <li key={resource.reserveId}>
                <Badge
                  variant="outline"
                  className="max-w-48 rounded-md border-violet-500/20 bg-violet-500/5 font-medium text-violet-700 dark:bg-violet-400/10 dark:text-violet-200"
                >
                  <span className="truncate">{resource.name}</span>
                  <span className="tabular-nums opacity-70">× {resource.quantity}</span>
                </Badge>
              </li>
            ))}
          </ul>
        )}

        <ReservePurpose purpose={reserve.purpose} />
      </CardContent>

      <HistoryCardActions
        reports={reportCount(reserve.usage)}
        onReport={onReport ? () => onReport(reserve) : undefined}
        showCTA={showCTA}
        onEdit={() => onEdit?.(reserve)}
        onCancel={() => onCancel?.(reserve)}
      />
    </Card>
  );
});
