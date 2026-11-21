import { Info, Pencil } from "lucide-react";
import { useMemo } from "react";
import { useFormDialog } from "#/hooks/use-form-dialog";
import type { Resource } from "#/lib/queries/resources";
import { DeleteButton } from "@/components/shared/DeleteButton";
import type { DataColumn } from "@/components/shared/data-table/columns";
import { DataTable } from "@/components/shared/data-table/DataTable";
import { IconCountButton } from "@/components/shared/IconCountButton";
import { InfoDialog } from "@/components/shared/InfoDialog";
import { InfoBadge, StatusBadge } from "@/components/shared/StatusBadge";
import { Button } from "@/components/ui/button";

type ResourceTableContext = { onDescription: (resource: Resource) => void };

/** Badge do tipo "Fixo", no mesmo formato do "Reservável" (cor própria para diferenciar). */
const fixedBadgeClass =
  "border-sky-500/30 bg-sky-50 text-sky-700 dark:border-sky-500/30 dark:bg-sky-950/40 dark:text-sky-300";

export const resourceColumns: DataColumn<Resource, ResourceTableContext>[] = [
  {
    id: "name",
    label: "Nome",
    hideable: false,
    cellClassName: "font-bold",
    cell: (resource) => resource.name,
  },
  {
    id: "description",
    label: "Descrição",
    headClassName: "text-center",
    cellClassName: "text-center",
    cell: (resource, { onDescription }) =>
      resource.description ? (
        <IconCountButton icon={Info} label="Ver descrição" onClick={() => onDescription(resource)} />
      ) : (
        <span className="text-muted-foreground">—</span>
      ),
  },
  {
    id: "type",
    label: "Tipo",
    defaultVisible: true,
    headClassName: "text-center",
    cellClassName: "text-center",
    cell: (resource) =>
      resource.reservable ? <InfoBadge>Reservável</InfoBadge> : <InfoBadge className={fixedBadgeClass}>Fixo</InfoBadge>,
  },
  {
    id: "quantity",
    label: "Quantidade",
    headClassName: "text-center",
    cellClassName: "text-center tabular-nums",
    cell: (resource) => (resource.reservable ? resource.quantity : "—"),
  },
  {
    id: "status",
    label: "Status",
    defaultVisible: true,
    headClassName: "text-center",
    cellClassName: "text-center",
    cell: (resource) => <StatusBadge active={resource.enabled} />,
  },
];

type ManageResourceTableProps = {
  resources: Resource[];
  columns: DataColumn<Resource, ResourceTableContext>[];
  onEdit: (resource: Resource) => void;
  onDelete: (resource: Resource) => void;
};

export function ManageResourceTable({ resources, columns, onEdit, onDelete }: ManageResourceTableProps) {
  const description = useFormDialog<Resource>();
  const openDescription = description.open;
  const context = useMemo<ResourceTableContext>(() => ({ onDescription: openDescription }), [openDescription]);
  const target = description.target;

  return (
    <>
      {target && (
        <InfoDialog
          open={description.isOpen}
          onClose={description.close}
          title={`Descrição · ${target.name}`}
          description="Descrição do recurso."
        >
          <p className="whitespace-pre-wrap wrap-break-word">{target.description}</p>
        </InfoDialog>
      )}

      <DataTable
        rows={resources}
        columns={columns}
        context={context}
        getRowKey={(resource) => resource.id}
        caption="Lista de recursos"
        actions={(resource) => (
          <>
            <Button
              variant="outline"
              size="icon"
              aria-label={`Editar ${resource.name}`}
              onClick={() => onEdit(resource)}
            >
              <Pencil className="size-4" />
            </Button>
            <DeleteButton label={`Excluir ${resource.name}`} onClick={() => onDelete(resource)} />
          </>
        )}
      />
    </>
  );
}
