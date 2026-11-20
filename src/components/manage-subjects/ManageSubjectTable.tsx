import { Pencil } from "lucide-react";
import type { Subject } from "#/lib/queries/subjects";
import { DeleteButton } from "@/components/shared/DeleteButton";
import type { DataColumn } from "@/components/shared/data-table/columns";
import { DataTable } from "@/components/shared/data-table/DataTable";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Button } from "@/components/ui/button";

export const subjectColumns: DataColumn<Subject>[] = [
  { id: "name", label: "Nome", hideable: false, cellClassName: "font-bold", cell: (subject) => subject.name },
  {
    id: "status",
    label: "Status",
    defaultVisible: true,
    headClassName: "text-center",
    cellClassName: "text-center",
    cell: (subject) => <StatusBadge active={subject.enabled} />,
  },
];

type ManageSubjectTableProps = {
  subjects: Subject[];
  columns: DataColumn<Subject>[];
  onEdit: (subject: Subject) => void;
  onDelete: (subject: Subject) => void;
};

export function ManageSubjectTable({ subjects, columns, onEdit, onDelete }: ManageSubjectTableProps) {
  return (
    <DataTable
      rows={subjects}
      columns={columns}
      context={undefined}
      getRowKey={(subject) => subject.id}
      caption="Lista de matérias."
      actions={(subject) => (
        <>
          <Button variant="outline" size="icon" aria-label={`Editar ${subject.name}`} onClick={() => onEdit(subject)}>
            <Pencil className="size-4" />
          </Button>
          <DeleteButton label={`Excluir ${subject.name}`} onClick={() => onDelete(subject)} />
        </>
      )}
    />
  );
}
