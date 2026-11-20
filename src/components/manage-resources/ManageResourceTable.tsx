import { Pencil } from "lucide-react";
import type { Resource } from "#/lib/queries/resources";
import { DeleteButton } from "@/components/shared/DeleteButton";
import type { DataColumn } from "@/components/shared/data-table/columns";
import { DataTable } from "@/components/shared/data-table/DataTable";
import { InfoBadge, StatusBadge } from "@/components/shared/StatusBadge";
import { Button } from "@/components/ui/button";

export const resourceColumns: DataColumn<Resource>[] = [
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
    cellClassName: "max-w-80 truncate text-muted-foreground",
    cell: (resource) => <span title={resource.description ?? ""}>{resource.description || "—"}</span>,
  },
  {
    id: "type",
    label: "Tipo",
    defaultVisible: true,
    headClassName: "text-center",
    cellClassName: "text-center",
    cell: (resource) =>
      resource.reservable ? <InfoBadge>Reservável</InfoBadge> : <span className="text-muted-foreground">Fixo</span>,
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
  columns: DataColumn<Resource>[];
  onEdit: (resource: Resource) => void;
  onDelete: (resource: Resource) => void;
};

export function ManageResourceTable({ resources, columns, onEdit, onDelete }: ManageResourceTableProps) {
  return (
    <DataTable
      rows={resources}
      columns={columns}
      context={undefined}
      getRowKey={(resource) => resource.id}
      caption="Lista de recursos"
      actions={(resource) => (
        <>
          <Button variant="outline" size="icon" aria-label={`Editar ${resource.name}`} onClick={() => onEdit(resource)}>
            <Pencil className="size-4" />
          </Button>
          <DeleteButton label={`Excluir ${resource.name}`} onClick={() => onDelete(resource)} />
        </>
      )}
    />
  );
}
