import { Mail, Pencil } from "lucide-react";
import { useMemo } from "react";
import { useFormDialog } from "#/hooks/use-form-dialog";
import { type Account, roleLabel } from "#/lib/queries/accounts";
import { DeleteButton } from "@/components/shared/DeleteButton";
import type { DataColumn } from "@/components/shared/data-table/columns";
import { DataTable } from "@/components/shared/data-table/DataTable";
import { IconCountButton } from "@/components/shared/IconCountButton";
import { InfoDialog } from "@/components/shared/InfoDialog";
import { InfoBadge, StatusBadge } from "@/components/shared/StatusBadge";
import { Button } from "@/components/ui/button";

type UserTableContext = { onEmail: (account: Account) => void };

export const userColumns: DataColumn<Account, UserTableContext>[] = [
  { id: "name", label: "Nome", hideable: false, cellClassName: "font-bold", cell: (account) => account.username },
  {
    id: "registration",
    label: "Matrícula",
    defaultVisible: true,
    cell: (account) => account.registration,
  },
  {
    id: "email",
    label: "E-mail",
    headClassName: "text-center",
    cellClassName: "text-center",
    cell: (account, { onEmail }) => (
      <IconCountButton icon={Mail} label={`Ver e-mail de ${account.username}`} onClick={() => onEmail(account)} />
    ),
  },
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
  columns: DataColumn<Account, UserTableContext>[];
  /** Só aparece a exclusão para contas de cargo inferior ao de quem está vendo (o backend também confere). */
  canDelete: (account: Account) => boolean;
  onEdit: (account: Account) => void;
  onDelete: (account: Account) => void;
};

export function ManageUserTable({ accounts, columns, canDelete, onEdit, onDelete }: ManageUserTableProps) {
  const email = useFormDialog<Account>();
  const openEmail = email.open;
  const context = useMemo<UserTableContext>(() => ({ onEmail: openEmail }), [openEmail]);
  const target = email.target;

  return (
    <>
      {target && (
        <InfoDialog
          open={email.isOpen}
          onClose={email.close}
          title={`E-mail · ${target.username}`}
          description="Endereço de e-mail do usuário."
        >
          <a
            href={`mailto:${target.email}`}
            className="break-all font-medium text-primary underline-offset-4 hover:underline"
          >
            {target.email}
          </a>
        </InfoDialog>
      )}
      <DataTable
        rows={accounts}
        columns={columns}
        context={context}
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
    </>
  );
}
