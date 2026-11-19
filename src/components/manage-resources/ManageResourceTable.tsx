import { Pencil } from "lucide-react";
import { memo } from "react";
import type { Resource } from "#/lib/queries/resources";
import { InfoBadge, StatusBadge } from "@/components/shared/StatusBadge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

type ManageResourceTableProps = {
  resources: Resource[];
  onEdit: (resource: Resource) => void;
};

export function ManageResourceTable({ resources, onEdit }: ManageResourceTableProps) {
  return (
    <Table className="w-full border bg-white p-4 shadow-md hover:shadow-lg dark:border-violet-500/10 dark:bg-white/5 dark:shadow-violet-300/15">
      <TableCaption>Lista de recursos</TableCaption>
      <TableHeader>
        <TableRow>
          <TableHead>Nome</TableHead>
          <TableHead className="hidden md:table-cell">Descrição</TableHead>
          <TableHead className="text-center">Tipo</TableHead>
          <TableHead className="text-center">Quantidade</TableHead>
          <TableHead className="text-center">Status</TableHead>
          <TableHead className="text-right">Ações</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {resources.map((resource) => (
          <ManageResourceRow key={resource.id} resource={resource} onEdit={onEdit} />
        ))}
      </TableBody>
    </Table>
  );
}

const ManageResourceRow = memo(function ManageResourceRow({
  resource,
  onEdit,
}: {
  resource: Resource;
  onEdit: (resource: Resource) => void;
}) {
  return (
    <TableRow>
      <TableCell className="font-bold">{resource.name}</TableCell>
      <TableCell className="hidden max-w-80 truncate text-muted-foreground md:table-cell" title={resource.description ?? ""}>
        {resource.description || "—"}
      </TableCell>
      <TableCell className="text-center">
        {resource.reservable ? <InfoBadge>Reservável</InfoBadge> : <span className="text-muted-foreground">Fixo</span>}
      </TableCell>
      <TableCell className="text-center tabular-nums">{resource.reservable ? resource.quantity : "—"}</TableCell>
      <TableCell className="text-center">
        <StatusBadge active={resource.enabled} />
      </TableCell>
      <TableCell className="text-right">
        <div className="flex items-center justify-end gap-x-2">
          <Button variant="outline" size="icon" aria-label={`Editar ${resource.name}`} onClick={() => onEdit(resource)}>
            <Pencil className="size-4" />
          </Button>
        </div>
      </TableCell>
    </TableRow>
  );
});
