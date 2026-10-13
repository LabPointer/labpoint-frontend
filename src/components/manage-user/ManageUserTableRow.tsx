import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "../ui/table";
import { useSuspenseQuery } from "@tanstack/react-query";
import { ApiError } from "#/lib/types/error-types";
import { useApi } from "#/lib/utils/restapi";
import type { UserSearchFilters } from "./ManageUserSearchBar";
import { Pencil } from "lucide-react";

export type ManageUserTableRowProps = {
  props: UserSearchFilters;
  onEdit: (data: { id: number; name: string; enabled: boolean }) => void;
};

const roleRecord: Record<number, string> = {
  0: "Usuário",
  1: "Administrador",
  2: "Owner",
}

const api = useApi();

function userQuery({ searchQuery, role, subjectId, status }: UserSearchFilters) {
  const query = useSuspenseQuery({
    queryKey: ["user-data", searchQuery, role, subjectId, status],
    queryFn: async () => {
      const res = await api.GET("/account/admin", {
        params: {
          query: {
            SearchQuery: searchQuery,
            Role: role,
            SubjectId: subjectId,
            Enabled: status,
            Offset: 0,
            Limit: 30,
          },
        },
      });

      const { response, data, error } = res;

      if (!response.ok && error) {
        throw new ApiError(error.message, response.status, error.logout);
      }

      return data ?? [];
    },
  });

  return query;
}

export function ManageUserTableRow({ props, onEdit }: ManageUserTableRowProps) {
  const { searchQuery, role, subjectId, status } = props;

  const { data } = userQuery({ searchQuery, role, subjectId, status });

  return (
    <>
      <div className="flex flex-wrap justify-between items-center mb-6">
        <h2 className="text-xl font-bold">Usuarios</h2>
        <span className="text-sm font-bold">Encontrados: {data.length || 0}</span>
      </div>
      <Table className="w-full bg-white dark:bg-white/5 border dark:border-violet-500/10 shadow-md hover:shadow-lg p-4 dark:shadow-violet-300/15">
        <TableCaption>Lista de usuarios</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead className="w-25">Nome</TableHead>
            <TableHead className="text-center">Matricula</TableHead>
            <TableHead className="text-center">Email</TableHead>
            <TableHead className="text-center">Cargo</TableHead>
            <TableHead className="text-center">Disciplina</TableHead>
            <TableHead className="text-center">Status</TableHead>
            <TableHead className="text-right">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((user) => (
            <TableRow>
              <TableCell className="font-bold w-25">{user.username}</TableCell>
              <TableCell className="text-center">{user.registration}</TableCell>
              <TableCell className="text-center">{user.email}</TableCell>
              <TableCell className="text-center">
                <Badge
                  variant="outline"
                  className="border-emerald-500/30 bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-500/30 rounded-full px-2.5 py-0.5 text-xs font-normal"
                >
                  {roleRecord[user.role]}
                </Badge>
              </TableCell>
              <TableCell className="text-center">
                <Badge
                  variant="outline"
                  className="border-red-500/30 bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-300 dark:border-red-500/30 rounded-full px-2.5 py-0.5 text-xs font-normal"
                >
                  {user.subject?.name ?? "Nenhuma"}
                </Badge>
              </TableCell>
              <TableCell className="text-center">
                {user.enabled ? (
                  <Badge
                    variant="outline"
                    className="border-green-500/30 bg-green-50 text-green-700 dark:bg-green-950/40 dark:text-green-300 dark:border-green-500/30 rounded-full px-2.5 py-0.5 text-xs font-normal"
                  >
                    Ativo
                  </Badge>
                ) : (
                  <Badge
                    variant="outline"
                    className="border-red-500/30 bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-300 dark:border-red-500/30 rounded-full px-2.5 py-0.5 text-xs font-normal"
                  >
                    Inativo
                  </Badge>
                )}
              </TableCell>
              <TableCell className="text-right">
                <div className="flex items-center justify-end gap-x-2">
                  <Button variant={"outline"} size="icon" onClick={() => {}}>
                    <Pencil className="size-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </>
  );
}
