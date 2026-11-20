import { Info, Pencil } from "lucide-react";
import { useMemo } from "react";
import { useFormDialog } from "#/hooks/use-form-dialog";
import type { Space } from "#/lib/queries/spaces";
import { DeleteButton } from "@/components/shared/DeleteButton";
import type { DataColumn } from "@/components/shared/data-table/columns";
import { DataTable } from "@/components/shared/data-table/DataTable";
import { InfoDialog } from "@/components/shared/InfoDialog";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

type InfoKind = "description" | "subjects" | "resources";
type InfoTarget = { space: Space; kind: InfoKind };

type SpaceTableContext = { onInfo: (space: Space, kind: InfoKind) => void };

export const spaceColumns: DataColumn<Space, SpaceTableContext>[] = [
  { id: "name", label: "Nome", hideable: false, cellClassName: "font-bold", cell: (space) => space.name },
  {
    id: "capacity",
    label: "Capacidade",
    defaultVisible: true,
    headClassName: "text-center",
    cellClassName: "text-center",
    cell: (space) => space.capacity,
  },
  {
    id: "description",
    label: "Descrição",
    headClassName: "text-center",
    cellClassName: "text-center",
    cell: (space, { onInfo }) =>
      space.description ? <InfoButton label="Ver mais info" onClick={() => onInfo(space, "description")} /> : "—",
  },
  {
    id: "subjects",
    label: "Matérias",
    headClassName: "text-center",
    cellClassName: "text-center",
    cell: (space, { onInfo }) =>
      space.subjects.length > 0 ? (
        <InfoButton label={`Ver mais info (${space.subjects.length})`} onClick={() => onInfo(space, "subjects")} />
      ) : (
        "—"
      ),
  },
  {
    id: "resources",
    label: "Recursos",
    headClassName: "text-center",
    cellClassName: "text-center",
    cell: (space, { onInfo }) =>
      space.resources.length > 0 ? (
        <InfoButton label={`Ver mais info (${space.resources.length})`} onClick={() => onInfo(space, "resources")} />
      ) : (
        "—"
      ),
  },
  {
    id: "status",
    label: "Status",
    defaultVisible: true,
    headClassName: "text-center",
    cellClassName: "text-center",
    cell: (space) => <StatusBadge active={!space.locked} />,
  },
];

type ManageSpaceTableProps = {
  spaces: Space[];
  columns: DataColumn<Space, SpaceTableContext>[];
  onEdit: (space: Space) => void;
  onDelete: (space: Space) => void;
};

const infoTitles: Record<InfoKind, string> = {
  description: "Descrição",
  subjects: "Matérias",
  resources: "Recursos",
};

export function ManageSpaceTable({ spaces, columns, onEdit, onDelete }: ManageSpaceTableProps) {
  const info = useFormDialog<InfoTarget>();
  const target = info.target;
  const openInfo = info.open;
  const context = useMemo<SpaceTableContext>(
    () => ({ onInfo: (space, kind) => openInfo({ space, kind }) }),
    [openInfo],
  );

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

      <DataTable
        rows={spaces}
        columns={columns}
        context={context}
        getRowKey={(space) => space.id}
        caption="Lista de espaços."
        actions={(space) => (
          <>
            <Button variant="outline" size="icon" aria-label={`Editar ${space.name}`} onClick={() => onEdit(space)}>
              <Pencil className="size-4" />
            </Button>
            <DeleteButton label={`Excluir ${space.name}`} onClick={() => onDelete(space)} />
          </>
        )}
      />
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
