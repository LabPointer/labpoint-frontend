import { Pencil } from "lucide-react";
import { memo } from "react";
import { type Account, roleLabel } from "#/lib/queries/accounts";
import { InfoBadge, StatusBadge } from "@/components/shared/StatusBadge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

type ManageUserTableProps = {
  accounts: Account[];
  onEdit: (account: Account) => void;
};

export function ManageUserTable({ accounts, onEdit }: ManageUserTableProps) {
  return (
    <Table className="w-full border bg-white p-4 shadow-md hover:shadow-lg dark:border-violet-500/10 dark:bg-white/5 dark:shadow-violet-300/15">
      <TableCaption>Lista de usuários.</TableCaption>
      <TableHeader>
        <TableRow>
          <TableHead>Nome</TableHead>
          <TableHead>Matrícula</TableHead>
          <TableHead>E-mail</TableHead>
          <TableHead>Matéria</TableHead>
          <TableHead className="text-center">Cargo</TableHead>
          <TableHead className="text-center">Status</TableHead>
          <TableHead className="text-right">Ações</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {accounts.map((account) => (
          <ManageUserRow key={account.id} account={account} onEdit={onEdit} />
        ))}
      </TableBody>
    </Table>
  );
}

const ManageUserRow = memo(function ManageUserRow({
  account,
  onEdit,
}: {
  account: Account;
  onEdit: (account: Account) => void;
}) {
  return (
    <TableRow>
      <TableCell className="font-bold">{account.username}</TableCell>
      <TableCell>{account.registration}</TableCell>
      <TableCell>{account.email}</TableCell>
      <TableCell>{account.subject?.name ?? "—"}</TableCell>
      <TableCell className="text-center">
        <InfoBadge>{roleLabel(account.role)}</InfoBadge>
      </TableCell>
      <TableCell className="text-center">
        <StatusBadge active={account.enabled} />
      </TableCell>
      <TableCell className="text-right">
        <div className="flex items-center justify-end gap-x-2">
          <Button
            variant="outline"
            size="icon"
            aria-label={`Editar ${account.username}`}
            onClick={() => onEdit(account)}
          >
            <Pencil className="size-4" />
          </Button>
        </div>
      </TableCell>
    </TableRow>
  );
});
