import { Boxes, Pencil, Users } from "lucide-react";
import { memo } from "react";
import type { Space } from "#/lib/queries/spaces";
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

type ManageSpaceCardProps = {
  space: Space;
  /** Sem `onEdit` o botão não é exibido. */
  onEdit?: (space: Space) => void;
};

export const ManageSpaceCard = memo(function ManageSpaceCard({ space, onEdit }: ManageSpaceCardProps) {
  const subjects = space.subjects.map((subject) => subject.name).join(", ");
  const resources = space.resources.map((resource) => resource.name).join(", ");

  return (
    <Card className="min-h-72 rounded-md border bg-white p-4 shadow-md hover:shadow-lg dark:border-violet-500/10 dark:bg-white/5 dark:shadow-violet-300/15">
      <CardHeader className="flex flex-row items-start justify-between border-0 p-0">
        <div>
          <CardTitle className="text-lg font-bold text-neutral-900 dark:text-neutral-100">{space.name}</CardTitle>
          <CardDescription className="text-sm text-neutral-500 dark:text-neutral-400">
            {subjects || "Sem matérias vinculadas"}
          </CardDescription>
        </div>
        <CardAction>
          <StatusBadge active={!space.locked} activeLabel="Ativo" inactiveLabel="Inativo" />
        </CardAction>
      </CardHeader>

      <CardContent className="mt-3 flex flex-col gap-y-2.5 p-0">
        {space.description && <p className="text-sm text-neutral-600 dark:text-neutral-400">{space.description}</p>}
        <div className="flex items-center gap-2.5 text-sm text-neutral-700 dark:text-neutral-300">
          <Users className="size-4 shrink-0 text-violet-600 dark:text-violet-400" />
          <span>
            Capacidade:{" "}
            <strong className="font-semibold text-neutral-900 dark:text-neutral-100">{space.capacity} lugares</strong>
          </span>
        </div>
        <div className="flex items-center gap-2.5 text-sm text-neutral-700 dark:text-neutral-300">
          <Boxes className="size-4 shrink-0 text-violet-600 dark:text-violet-400" />
          <span>{resources || "Sem recursos"}</span>
        </div>
      </CardContent>

      {onEdit && (
        <CardFooter className="mt-auto flex gap-3 border-0 bg-transparent">
          <Button className="h-10 flex-1 gap-2 rounded-xl" onClick={() => onEdit(space)}>
            <Pencil className="size-4" />
            Editar
          </Button>
        </CardFooter>
      )}
    </Card>
  );
});
