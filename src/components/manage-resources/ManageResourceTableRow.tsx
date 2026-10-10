import { Pencil } from "lucide-react";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "../ui/table";
import { useSuspenseQuery } from "@tanstack/react-query";
import { ApiError } from "#/lib/types/error-types";
import { useApi } from "#/lib/utils/restapi";
import type { ResourceFilters } from "./ManageResourceSearchBar";

export type ManageResourceTableRowProps = {
  props: ResourceFilters;
  onEdit: (data: { id: number; name: string; canReserve: boolean; enabled: boolean }) => void;
};

const api = useApi();

function resourceQuery({ search, canReserve, enabled }: ResourceFilters) {
  const query = useSuspenseQuery({
    queryKey: ["resource-data", search, canReserve, enabled],
    queryFn: async () => {
        console.log("Fetching resources with filters:", { search, canReserve, enabled });
      const res = await api.GET("/resource", {
        params: {
          query: {
            Name: search,
            CanReserve: canReserve,
            Enabled: enabled,
            limit: 30,
            offset: 0,
          },
        },
      });

      const { response, data, error } = res;

      if (!response.ok && error) {
        throw new ApiError(error.message, response.status, error.logout);
      }

      if (!data) {
        throw new ApiError("Nenhum recurso encontrado", 404, false);
      }

      return data;
    },
  });

  return query;
}

export function ManageResourceTableRow({ props, onEdit }: ManageResourceTableRowProps) {
  const { search, canReserve, enabled } = props;

  const { data } = resourceQuery({ search, canReserve, enabled });

  return (
    <>
      <div className="flex flex-wrap justify-between items-center mb-6">
        <h2 className="text-xl font-bold">Recursos</h2>
        <span className="text-sm font-bold">Encontrados: {data.length || 0}</span>
      </div>
      <Table className="w-full bg-white dark:bg-white/5 border dark:border-violet-500/10 shadow-md hover:shadow-lg p-4 dark:shadow-violet-300/15">
        <TableCaption>Lista de recursos</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead className="w-25">Nome</TableHead>
            <TableHead className="text-center">Reservavel</TableHead>
            <TableHead className="text-center">Status</TableHead>
            <TableHead className="text-right">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((resource) => (
            <TableRow>
              <TableCell className="font-bold w-25">{resource.name}</TableCell>
              <TableCell className="text-center">
                {resource.canReserve ? (
                  <Badge
                    variant="outline"
                    className="border-emerald-500/30 bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-500/30 rounded-full px-2.5 py-0.5 text-xs font-normal"
                  >
                    Sim
                  </Badge>
                ) : (
                  <Badge
                    variant="outline"
                    className="border-red-500/30 bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-300 dark:border-red-500/30 rounded-full px-2.5 py-0.5 text-xs font-normal"
                  >
                    Não
                  </Badge>
                )}
              </TableCell>
              <TableCell className="text-center">
                {resource.enabled ? (
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
                        id: resource.id as number,
                        name: resource.name,
                        canReserve: resource.canReserve,
                        enabled: resource.enabled,
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
