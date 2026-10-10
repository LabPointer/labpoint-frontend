import { Pencil } from "lucide-react";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "../ui/table";
import { useSuspenseQuery } from "@tanstack/react-query";
import { ApiError } from "#/lib/types/error-types";
import { useApi } from "#/lib/utils/restapi";
import type { ScheduleFilters } from "./ManageScheduleSearchBar";

export type ManageScheduleTableRowProps = {
  props: ScheduleFilters;
  onEdit: (data: { id: number; startAt: string; endAt: string; enabled: boolean; shift: number; }) => void;
};

const api = useApi();

function scheduleQuery(filters: ScheduleFilters) {
  const query = useSuspenseQuery({
    queryKey: ["schedule-data", filters.shift, filters.enabled],
    queryFn: async () => {
      const res = await api.GET("/schedule", {
        params: {
          query: {
            Shift: filters.shift,
            Enabled: filters.enabled,
            limit: 30,
            offset: 0,
          },
        },
      });

      const { response, data, error } = res;

      if (!response.ok && error) {
        throw new ApiError(error.message, response.status, error.logout);
      }

      return data ?? [];
    }
  });

  return query;
}

export function ManageScheduleTableRow({ props, onEdit }: ManageScheduleTableRowProps) {
  const { shift, enabled } = props;

  const { data } = scheduleQuery({ enabled, shift });

  return (
    <>
      <div className="flex flex-wrap justify-between items-center mb-6">
        <h2 className="text-xl font-bold">Horarios</h2>
        <span className="text-sm font-bold">Encontrados: {data.length || 0}</span>
      </div>
      <Table className="w-full bg-white dark:bg-white/5 border dark:border-violet-500/10 shadow-md hover:shadow-lg p-4 dark:shadow-violet-300/15">
        <TableCaption>Lista de horarios</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead className="w-25">Horario</TableHead>
            <TableHead className="text-center">Turno</TableHead>
            <TableHead className="text-center">Status</TableHead>
            <TableHead className="text-right">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((schedule) => (
            <TableRow key={schedule.id}>
              <TableCell className="font-bold w-25">{schedule.startAt.substring(0, 5)} - {schedule.endAt.substring(0, 5)}</TableCell>
              <TableCell className="text-center">
                {schedule.shift === 0 ? (
                  <Badge
                    variant="outline"
                    className="border-emerald-500/30 bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-500/30 rounded-full px-2.5 py-0.5 text-xs font-normal"
                  >
                    Matutino
                  </Badge>
                ) : schedule.shift === 1 ? (
                  <Badge
                    variant="outline"
                    className="border-emerald-500/30 bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-500/30 rounded-full px-2.5 py-0.5 text-xs font-normal"
                  >
                    Vespertino
                  </Badge>
                ) : (
                  <Badge
                    variant="outline"
                    className="border-emerald-500/30 bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-500/30 rounded-full px-2.5 py-0.5 text-xs font-normal"
                  >
                    Noturno
                  </Badge>
                )}
              </TableCell>
              <TableCell className="text-center">
                {schedule.enabled ? (
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
                        id: schedule.id as number,
                        startAt: schedule.startAt,
                        endAt: schedule.endAt,
                        enabled: schedule.enabled,
                        shift: schedule.shift,
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
