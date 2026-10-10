import { Pencil } from "lucide-react";
import { memo } from "react";
import type { Subject } from "#/lib/queries/subjects";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

type ManageSubjectTableProps = {
  subjects: Subject[];
  onEdit: (subject: Subject) => void;
};

export function ManageSubjectTable({ subjects, onEdit }: ManageSubjectTableProps) {
  return (
    <Table className="w-full border bg-white p-4 shadow-md hover:shadow-lg dark:border-violet-500/10 dark:bg-white/5 dark:shadow-violet-300/15">
      <TableCaption>Lista de matérias.</TableCaption>
      <TableHeader>
        <TableRow>
          <TableHead className="w-25">Nome</TableHead>
          <TableHead className="text-center">Status</TableHead>
          <TableHead className="text-right">Ações</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {subjects.map((subject) => (
          <ManageSubjectRow key={subject.id} subject={subject} onEdit={onEdit} />
        ))}
      </TableBody>
    </Table>
  );
}

const ManageSubjectRow = memo(function ManageSubjectRow({
  subject,
  onEdit,
}: {
  subject: Subject;
  onEdit: (subject: Subject) => void;
}) {
  return (
    <TableRow>
      <TableCell className="w-25 font-bold">{subject.name}</TableCell>
      <TableCell className="text-center">
        <StatusBadge active={subject.enabled} />
      </TableCell>
      <TableCell className="text-right">
        <div className="flex items-center justify-end gap-x-2">
          <Button variant="outline" size="icon" aria-label={`Editar ${subject.name}`} onClick={() => onEdit(subject)}>
            <Pencil className="size-4" />
          </Button>
        </div>
      </TableCell>
    </TableRow>
  );
});
