import {
  Box,
  Computer,
  FileText,
  FilterIcon,
  MapPin,
  Projector,
  Tv,
  Users,
} from "lucide-react";
import { Badge } from "#/components/ui/badge";
import { Button } from "#/components/ui/button";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "#/components/ui/card";
import { Field, FieldContent, FieldLabel } from "#/components/ui/field";

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
};

export function SpaceCard(props: SpaceCardProps) {
  const { name, capacity, description, resources, subjects, locked } = props;

  return (
    <Card className="min-w-72 max-w-72 min-h-72 bg-white dark:bg-white/5 rounded-md border dark:border-violet-500/10 shadow-md hover:shadow-lg p-4 dark:shadow-violet-300/15">
      <CardHeader className="border-0 p-0 flex flex-row items-start justify-between">
        <div>
          <CardTitle className="text-lg font-bold text-neutral-900 dark:text-neutral-100">
            <span className="line-clamp-1" title={name}>
              {name}
            </span>
          </CardTitle>
          <CardDescription className="text-sm text-neutral-500 dark:text-neutral-400 line-clamp-1">
            {subjects?.length ? subjects.map((s) => s.name).join(", ") : "---"}
          </CardDescription>
        </div>
        <CardAction>
          <Badge
            variant="outline"
            className="border-emerald-500/30 bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-500/30 rounded-full px-2.5 py-0.5 text-xs font-normal"
          >
            {locked ? "Bloqueado" : "Disponível"}
          </Badge>
        </CardAction>
      </CardHeader>

      <CardContent className="flex flex-col gap-y-2.5 p-0 mt-3">
        <div className="flex items-center gap-2.5 text-sm text-neutral-700 dark:text-neutral-300">
          <Users className="size-4 shrink-0 text-violet-600 dark:text-violet-400" />
          <span>
            Capacidade:{" "}
            <strong className="font-semibold text-neutral-900 dark:text-neutral-100">
              {capacity} lugares
            </strong>
          </span>
        </div>
        {description && (
          <Field>
            <FieldLabel>
              <Box className="size-4 shrink-0 text-violet-600 dark:text-violet-400" />
              <span>Descrição</span>
            </FieldLabel>
            <FieldContent>
              <div className="flex items-start border rounded-md p-2">
                  <span className="font-medium line-clamp-4 text-wrap truncate">
                    • {description}
                  </span>
                </div>
            </FieldContent>
          </Field>
        )}
        <Field>
          <FieldLabel>
            <Box className="size-4 shrink-0 text-violet-600 dark:text-violet-400" />
            <span>Recursos</span>
          </FieldLabel>
          <FieldContent>
            {resources && resources.length > 0 ? (
              <div className="flex flex-col items-start border rounded-md p-2">
                {resources.map((val, index) => {
                  if (index < 3) {
                    return (
                      <span className="flex gap-x-1">
                        •
                        <strong className="font-medium text-neutral-900 dark:text-neutral-100">
                          {val.name}
                        </strong>
                      </span>
                    );
                  } else if (index === 3) {
                    return <span className="">...</span>;
                  }
                  return null;
                })}
              </div>
            ) : null}
          </FieldContent>
        </Field>
      </CardContent>

      <CardFooter className="bg-transparent border-0 mt-auto">
        <Button className="w-full h-10 rounded-xl bg-[#5925dc] hover:bg-[#4b1ec0] text-white font-medium shadow-sm transition-colors">
          Reservar
        </Button>
      </CardFooter>
    </Card>
  );
}
