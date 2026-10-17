import { Info, Pencil } from "lucide-react";
import { memo } from "react";
import { useFormDialog } from "#/hooks/use-form-dialog";
import type { Space } from "#/lib/queries/spaces";
import { InfoDialog } from "@/components/shared/InfoDialog";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

type InfoKind = "description" | "subjects" | "resources";
type InfoTarget = { space: Space; kind: InfoKind };

type ManageSpaceTableProps = {
  spaces: Space[];
  onEdit: (space: Space) => void;
};

const infoTitles: Record<InfoKind, string> = {
  description: "Descrição",
  subjects: "Matérias",
  resources: "Recursos",
};

export function ManageSpaceTable({ spaces, onEdit }: ManageSpaceTableProps) {
  const info = useFormDialog<InfoTarget>();
  const target = info.target;

  return (
    <>
      {target && (
        <InfoDialog
          open={info.isOpen}
          onClose={info.close}
          title={`${infoTitles[target.kind]} · ${target.space.name}`}
          description={`${infoTitles[target.kind]} do espaço.`}
        >
          <SpaceInfoContent target={target} />
        </InfoDialog>
      )}

      <Table className="w-full border bg-white p-4 shadow-md hover:shadow-lg dark:border-violet-500/10 dark:bg-white/5 dark:shadow-violet-300/15">
        <TableCaption>Lista de espaços.</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead>Nome</TableHead>
            <TableHead className="text-center">Capacidade</TableHead>
            <TableHead className="text-center">Descrição</TableHead>
            <TableHead className="text-center">Matérias</TableHead>
            <TableHead className="text-center">Recursos</TableHead>
            <TableHead className="text-center">Status</TableHead>
            <TableHead className="text-right">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {spaces.map((space) => (
            <ManageSpaceRow
              key={space.id}
              space={space}
              onEdit={onEdit}
              onInfo={(kind) => info.open({ space, kind })}
            />
          ))}
        </TableBody>
      </Table>
    </>
  );
}

function SpaceInfoContent({ target }: { target: InfoTarget }) {
  const { space, kind } = target;

  if (kind === "description") {
    return <p className="whitespace-pre-wrap wrap-break-word">{space.description || "Sem descrição."}</p>;
  }

  const items = kind === "subjects" ? space.subjects : space.resources;
  if (items.length === 0) {
    return (
      <p className="text-muted-foreground">{kind === "subjects" ? "Sem matérias vinculadas." : "Sem recursos."}</p>
    );
  }

  return (
    <ul className="flex flex-wrap gap-2">
      {items.map((item) => (
        <li key={item.id}>
          <Badge variant="outline" className="rounded-full px-2.5 py-0.5 text-xs font-normal">
            {item.name}
          </Badge>
        </li>
      ))}
    </ul>
  );
}

function InfoButton({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <Button type="button" variant="outline" size="sm" onClick={onClick}>
      <Info className="size-4" />
      <span className="text-sm font-medium">{label}</span>
    </Button>
  );
}

const ManageSpaceRow = memo(function ManageSpaceRow({
  space,
  onEdit,
  onInfo,
}: {
  space: Space;
  onEdit: (space: Space) => void;
  onInfo: (kind: InfoKind) => void;
}) {
  return (
    <TableRow>
      <TableCell className="font-bold">{space.name}</TableCell>
      <TableCell className="text-center">{space.capacity}</TableCell>
      <TableCell className="text-center">
        {space.description ? <InfoButton label="Ver mais info" onClick={() => onInfo("description")} /> : "—"}
      </TableCell>
      <TableCell className="text-center">
        {space.subjects.length > 0 ? (
          <InfoButton label={`Ver mais info (${space.subjects.length})`} onClick={() => onInfo("subjects")} />
        ) : (
          "—"
        )}
      </TableCell>
      <TableCell className="text-center">
        {space.resources.length > 0 ? (
          <InfoButton label={`Ver mais info (${space.resources.length})`} onClick={() => onInfo("resources")} />
        ) : (
          "—"
        )}
      </TableCell>
      <TableCell className="text-center">
        <StatusBadge active={!space.locked} />
      </TableCell>
      <TableCell className="text-right">
        <div className="flex items-center justify-end gap-x-2">
          <Button variant="outline" size="icon" aria-label={`Editar ${space.name}`} onClick={() => onEdit(space)}>
            <Pencil className="size-4" />
          </Button>
        </div>
      </TableCell>
    </TableRow>
  );
});
