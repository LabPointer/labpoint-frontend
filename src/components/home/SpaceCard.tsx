import { BookOpen, FlaskConical, Package, Users } from "lucide-react";
import {
  AvailabilityBadge,
  RESERVE_CARD_CLASS,
  RESERVE_CARD_FOOTER_CLASS,
  ReserveCardButton,
  ReserveCardDescription,
  ReserveCardIcon,
  ReserveCardStat,
} from "@/components/shared/ReserveCardParts";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

export type ListData = {
  id: number;
  name: string;
};

export type SpaceCardProps = {
  id: number;
  name: string;
  capacity: number;
  description: string | undefined;
  subjects?: ListData[] | undefined;
  resources?: ListData[] | undefined;
  locked: boolean;
  onReserve: () => void;
};

/** Recursos mostrados como chips; o resto vira "+N". */
const MAX_VISIBLE_RESOURCES = 4;

export function SpaceCard(props: SpaceCardProps) {
  const { name, capacity, description, resources = [], subjects = [], locked, onReserve } = props;
  const visibleResources = resources.slice(0, MAX_VISIBLE_RESOURCES);
  const hiddenResources = resources.slice(MAX_VISIBLE_RESOURCES);
  const subjectNames = subjects.map((subject) => subject.name).join(", ");

  return (
    <Card aria-label={name} className={RESERVE_CARD_CLASS}>
      {/* Identificação: ícone, nome, matérias e situação */}
      <CardHeader className="flex flex-row items-start gap-3 p-0">
        <ReserveCardIcon>
          <FlaskConical aria-hidden="true" />
        </ReserveCardIcon>
        <div className="min-w-0 flex-1">
          <CardTitle className="text-base leading-tight font-bold text-neutral-900 dark:text-neutral-100">
            <span className="line-clamp-2" title={name}>
              {name}
            </span>
          </CardTitle>
          <p
            className="mt-1 flex items-center gap-1 text-xs text-neutral-500 dark:text-neutral-400"
            title={subjectNames || undefined}
          >
            <BookOpen className="size-3.5 shrink-0" aria-hidden="true" />
            <span className="line-clamp-1">{subjectNames || "Sem matérias vinculadas"}</span>
          </p>
        </div>
        <AvailabilityBadge available={!locked} unavailableLabel="Bloqueado" />
      </CardHeader>

      <CardContent className="flex flex-1 flex-col gap-4 p-0">
        {/* Números que decidem a escolha da sala */}
        <dl className="grid grid-cols-2 gap-2">
          <ReserveCardStat icon={<Users />} label="Capacidade" value={capacity} unit="lugares" />
          <ReserveCardStat
            icon={<Package />}
            label="Recursos"
            value={resources.length}
            unit={resources.length === 1 ? "item" : "itens"}
          />
        </dl>

        <ReserveCardDescription text={description} />

        {resources.length > 0 && (
          <ul className="mt-auto flex flex-wrap gap-1.5" aria-label="Recursos da sala">
            {visibleResources.map((resource) => (
              <li key={resource.id}>
                <Badge
                  variant="outline"
                  className="max-w-40 rounded-md border-violet-500/20 bg-violet-500/5 font-medium text-violet-700 dark:bg-violet-400/10 dark:text-violet-200"
                >
                  <span className="truncate">{resource.name}</span>
                </Badge>
              </li>
            ))}
            {hiddenResources.length > 0 && (
              <li>
                <Badge
                  variant="outline"
                  className="rounded-md text-neutral-500 dark:text-neutral-400"
                  title={hiddenResources.map((resource) => resource.name).join(", ")}
                >
                  +{hiddenResources.length}
                </Badge>
              </li>
            )}
          </ul>
        )}
      </CardContent>

      <CardFooter className={RESERVE_CARD_FOOTER_CLASS}>
        <ReserveCardButton itemName={name} onClick={onReserve} />
      </CardFooter>
    </Card>
  );
}
