import { Boxes, CalendarRange, Package } from "lucide-react";
import type { Resource } from "#/lib/queries/resources";
import {
  AvailabilityBadge,
  RESERVE_CARD_CLASS,
  RESERVE_CARD_FOOTER_CLASS,
  ReserveCardButton,
  ReserveCardDescription,
  ReserveCardIcon,
  ReserveCardStat,
} from "@/components/shared/ReserveCardParts";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

type ResourceCardProps = {
  resource: Resource;
  /** `true` quando a busca informou período: mostra as unidades livres nele. */
  showAvailability: boolean;
  onReserve: () => void;
};

export function ResourceCard({ resource, showAvailability, onReserve }: ResourceCardProps) {
  const total = Number(resource.quantity ?? 0);
  const available = resource.available == null ? total : Number(resource.available);
  const hasUnits = available > 0;
  const freePercent = total > 0 ? Math.round((available / total) * 100) : 0;

  return (
    <Card aria-label={resource.name} className={RESERVE_CARD_CLASS}>
      {/* Identificação: ícone, nome, total de unidades e situação */}
      <CardHeader className="flex flex-row items-start gap-3 p-0">
        <ReserveCardIcon>
          <Package aria-hidden="true" />
        </ReserveCardIcon>
        <div className="min-w-0 flex-1">
          <CardTitle className="text-base leading-tight font-bold text-neutral-900 dark:text-neutral-100">
            <span className="line-clamp-2" title={resource.name}>
              {resource.name}
            </span>
          </CardTitle>
          <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-400">Recurso reservável</p>
        </div>
        <AvailabilityBadge available={hasUnits} unavailableLabel="Esgotado" unavailableIcon="slash" />
      </CardHeader>

      <CardContent className="flex flex-1 flex-col gap-4 p-0">
        {/* Unidades: total e livres no período escolhido */}
        <dl className="grid grid-cols-2 gap-2">
          <ReserveCardStat icon={<Boxes />} label="Total" value={total} unit={total === 1 ? "unidade" : "unidades"} />
          {showAvailability ? (
            <ReserveCardStat icon={<CalendarRange />} label="Livres no período" value={available} unit={`de ${total}`}>
              <span
                className="mt-1.5 block h-1 overflow-hidden rounded-full bg-neutral-200 dark:bg-white/10"
                role="presentation"
              >
                <span
                  className={cn("block h-full rounded-full", hasUnits ? "bg-emerald-500" : "bg-rose-500")}
                  style={{ width: `${hasUnits ? Math.max(freePercent, 4) : 100}%` }}
                />
              </span>
            </ReserveCardStat>
          ) : (
            <div className="flex items-center gap-2.5 rounded-lg border border-dashed border-neutral-300 px-3 py-2 text-xs leading-snug text-neutral-500 dark:border-white/10 dark:text-neutral-400">
              <CalendarRange className="size-4 shrink-0 text-violet-600 dark:text-violet-400" aria-hidden="true" />
              <dt className="sr-only">Livres no período</dt>
              <dd>Escolha o período para ver</dd>
            </div>
          )}
        </dl>

        <ReserveCardDescription text={resource.description} />
      </CardContent>

      <CardFooter className={RESERVE_CARD_FOOTER_CLASS}>
        <ReserveCardButton itemName={resource.name} onClick={onReserve} disabled={!hasUnits} />
      </CardFooter>
    </Card>
  );
}
