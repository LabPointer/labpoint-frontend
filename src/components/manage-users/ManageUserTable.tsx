import { Pencil } from "lucide-react";
import { type Account, roleLabel } from "#/lib/queries/accounts";
import { DeleteButton } from "@/components/shared/DeleteButton";
import type { DataColumn } from "@/components/shared/data-table/columns";
import { DataTable } from "@/components/shared/data-table/DataTable";
import { InfoBadge, StatusBadge } from "@/components/shared/StatusBadge";
import { Button } from "@/components/ui/button";

export const userColumns: DataColumn<Account>[] = [
  { id: "name", label: "Nome", hideable: false, cellClassName: "font-bold", cell: (account) => account.username },
  {
    id: "registration",
    label: "Matrícula",
    defaultVisible: true,
    cell: (account) => account.registration,
  },
  { id: "email", label: "E-mail", cellClassName: "break-all", cell: (account) => account.email },
  { id: "subject", label: "Matéria", cell: (account) => account.subject?.name ?? "—" },
  {
    id: "role",
    label: "Cargo",
    headClassName: "text-center",
    cellClassName: "text-center",
    cell: (account) => <InfoBadge>{roleLabel(account.role)}</InfoBadge>,
  },
  {
    id: "status",
    label: "Status",
    defaultVisible: true,
    headClassName: "text-center",
    cellClassName: "text-center",
    cell: (account) => <StatusBadge active={account.enabled} />,
  },
];

type ManageUserTableProps = {
  accounts: Account[];
  columns: DataColumn<Account>[];
  /** Só aparece a exclusão para contas de cargo inferior ao de quem está vendo (o backend também confere). */
  canDelete: (account: Account) => boolean;
  onEdit: (account: Account) => void;
  onDelete: (account: Account) => void;
};

export function ManageUserTable({ accounts, columns, canDelete, onEdit, onDelete }: ManageUserTableProps) {
  return (
    <DataTable
      rows={accounts}
      columns={columns}
      context={undefined}
      getRowKey={(account) => account.id}
      caption="Lista de usuários."
      actions={(account) => (
        <>
          <Button
            variant="outline"
            size="icon"
            aria-label={`Editar ${account.username}`}
            onClick={() => onEdit(account)}
          >
            <Pencil className="size-4" />
          </Button>
          {canDelete(account) && (
            <DeleteButton label={`Excluir ${account.username}`} onClick={() => onDelete(account)} />
          )}
        </>
      )}
    />
  );
}
