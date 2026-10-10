import { useSuspenseQuery } from "@tanstack/react-query";
import { Pencil } from "lucide-react";
import { ApiError } from "#/lib/types/error-types";
import { useApi } from "#/lib/utils/restapi";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "../ui/table";
import type { SubjectFilters } from "./ManageSubjectSearchBar";

export type ManageSubjectTableRowProps = {
  props: SubjectFilters;
  onEdit: (data: { id: number; name: string; enabled: boolean }) => void;
};

const api = useApi();

function subjectQuery(filters: SubjectFilters) {
  const query = useSuspenseQuery({
    queryKey: ["subject-data", filters.search, filters.enabled],
    queryFn: async () => {
      const res = await api.GET("/subject", {
        params: {
          query: {
            Name: filters.search.length > 0 ? filters.search : undefined,
            Enabled: filters.enabled,
            Limit: 30,
            Offset: 0,
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

export function ManageSubjectTableRow({ props, onEdit }: ManageSubjectTableRowProps) {
  const { search, enabled } = props;

  const { data } = subjectQuery({ enabled, search });

  return (
    <>
      <div className="flex flex-wrap justify-between items-center mb-6">
        <h2 className="text-xl font-bold">Materias</h2>
        <span className="text-sm font-bold">Encontrados: {data.length || 0}</span>
      </div>
      <Table className="w-full bg-white dark:bg-white/5 border dark:border-violet-500/10 shadow-md hover:shadow-lg p-4 dark:shadow-violet-300/15">
        <TableCaption>Lista de materias</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead className="w-25">Nome</TableHead>
            <TableHead className="text-center">Status</TableHead>
            <TableHead className="text-right">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((subject) => (
            <TableRow key={subject.id}>
              <TableCell className="font-bold w-25">
                {subject.name}
              </TableCell>
              <TableCell className="text-center">
                {subject.enabled ? (
                  <Badge
                    variant="outline"
                    className="border-emerald-500/30 bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-500/30 rounded-full px-2.5 py-0.5 text-xs font-normal"
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
                  <Button
                    variant={"outline"}
                    size="icon"
                    onClick={() =>
                      onEdit({
                        id: subject.id as number,
                        name: subject.name,
                        enabled: subject.enabled,
                      })
                    }
                  >
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
