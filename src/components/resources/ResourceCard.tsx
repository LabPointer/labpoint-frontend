import { Package } from "lucide-react";
import type { Resource } from "#/lib/queries/resources";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

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

  return (
    <Card className="min-h-60 w-72 rounded-md border bg-white p-4 shadow-md hover:shadow-lg dark:border-violet-500/10 dark:bg-white/5 dark:shadow-violet-300/15">
      <CardHeader className="flex flex-row items-start justify-between border-0 p-0">
        <div className="min-w-0">
          <CardTitle className="text-lg font-bold">
            <span className="line-clamp-1" title={resource.name}>
              {resource.name}
            </span>
          </CardTitle>
          <CardDescription className="text-sm">{total} unidade(s) no total</CardDescription>
        </div>
        <CardAction>
          <StatusBadge active={hasUnits} activeLabel="Disponível" inactiveLabel="Esgotado" />
        </CardAction>
      </CardHeader>

      <CardContent className="mt-3 flex flex-col gap-3 p-0">
        <div className="flex items-center gap-2.5 text-sm">
          <Package className="size-4 shrink-0 text-violet-600 dark:text-violet-400" />
          {showAvailability ? (
            <span>
              <strong className="font-semibold tabular-nums">
                {available} de {total}
              </strong>{" "}
              livres no período
            </span>
          ) : (
            <span className="text-muted-foreground">Escolha um período para ver a disponibilidade</span>
          )}
        </div>
        <p className="line-clamp-4 rounded-md border p-2 text-xs text-muted-foreground">
          {resource.description || "Sem descrição."}
        </p>
      </CardContent>

      <CardFooter className="mt-auto border-0 bg-transparent">
        <Button
          className="h-10 w-full rounded-xl bg-[#5925dc] font-medium text-white shadow-sm transition-colors hover:bg-[#4b1ec0]"
          onClick={onReserve}
          disabled={!hasUnits}
        >
          Reservar
        </Button>
      </CardFooter>
    </Card>
  );
}
