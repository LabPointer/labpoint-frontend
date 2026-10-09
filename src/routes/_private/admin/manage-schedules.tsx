import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import {
  type ManageCreateScheduleData,
  ManageCreateScheduleDialog,
} from "#/components/manage-schedules/ManageCreateScheduleDialog";
import ScheduleSearchBar, { type ScheduleFilters } from "#/components/manage-schedules/ScheduleSearchBar";
import { ApiError } from "#/lib/types/error-types";
import { useApi } from "#/lib/utils/restapi";
import {
  ManageEditScheduleDialog,
  type ManageEditScheduleData,
} from "#/components/manage-schedules/ManageEditScheduleDialog";
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "#/components/ui/table";
import { Badge } from "#/components/ui/badge";
import { Button } from "#/components/ui/button";
import { Pencil } from "lucide-react";

const api = useApi();

function scheduleQuery(shift: number | undefined, enabled: boolean | undefined) {
  const query = useQuery({
    queryKey: ["schedule-data", shift, enabled],
    queryFn: async () => {
      const res = await api.GET("/schedule", {
        params: {
          query: {
            Enabled: enabled,
            shift: shift,
          },
        },
      });

      const { response, data, error } = res;

      if (!response.ok && error) {
        throw new ApiError(error.message, response.status, error.logout);
      }

      if (!data) {
        throw new ApiError("Nenhum agendamento encontrado.", response.status, error?.logout ?? false);
      }

      return data;
    },
  });

  return query;
}

export const Route = createFileRoute("/_private/admin/manage-schedules")({
  component: RouteComponent,
});

function RouteComponent() {
  const [isCreateScheduleDialogOpen, setIsCreateScheduleDialogOpen] = useState(false);
  const [isEditScheduleDialogOpen, setIsEditScheduleDialogOpen] = useState(false);

  const [editScheduleData, setEditScheduleData] = useState<ManageEditScheduleData>();

  const [searchFilters, setSearchFilters] = useState<ScheduleFilters>({ shift: undefined, enabled: undefined });
  const {
    data: scheduleData,
    isLoading: isScheduleLoading,
    isError: isScheduleError,
    error: scheduleError,
    isFetching,
    refetch,
  } = scheduleQuery(searchFilters.shift, searchFilters.enabled);

  async function handleCreate(data: ManageCreateScheduleData) {
    const res = await api.POST("/schedule/admin/create", {
      body: {
        enabled: data.enabled,
        startAt: data.startAt,
        endAt: data.endAt,
        shift: data.shift,
      },
    });

    const { response, error } = res;

    if (!response.ok && error) {
      toast.error(`Erro ${response.status}: ${error.message}`, {
        duration: 3000,
        position: "bottom-center",
        style: {
          color: "white",
          backgroundColor: "red",
          borderColor: "red",
        },
      });
    }

    toast.success("Horario criado com sucesso!", {
      duration: 3000,
      position: "bottom-center",
      style: {
        color: "white",
        backgroundColor: "green",
        borderColor: "green",
      },
    });

    setIsCreateScheduleDialogOpen(false);
    await refetch();
  }

  async function handleEdit(data: ManageEditScheduleData) {
    const res = await api.PATCH("/schedule/admin/edit", {
      body: {
        id: data.id,
        enabled: data.enabled ?? null,
        startAt: data.startAt ?? null,
        endAt: data.endAt ?? null,
        shift: data.shift ?? null,
      },
    });

    const { response, error } = res;

    if (!response.ok && error) {
      toast.error(`Erro ${response.status}: ${error.message}`, {
        duration: 3000,
        position: "bottom-center",
        style: {
          color: "white",
          backgroundColor: "red",
          borderColor: "red",
        },
      });
    }

    toast.success("Horario editado com sucesso!", {
      duration: 3000,
      position: "bottom-center",
      style: {
        color: "white",
        backgroundColor: "green",
        borderColor: "green",
      },
    });

    setIsEditScheduleDialogOpen(false);
    await refetch();
  }

  return (
    <>
      <ManageCreateScheduleDialog
        isOpen={isCreateScheduleDialogOpen}
        onClose={() => setIsCreateScheduleDialogOpen(false)}
        onSubmit={handleCreate}
      />

      <ManageEditScheduleDialog
        isOpen={isEditScheduleDialogOpen}
        onClose={() => setIsEditScheduleDialogOpen(false)}
        onSubmit={handleEdit}
        data={editScheduleData ?? { id: 0, startAt: "", endAt: "", shift: 0, enabled: true }}
      />

      <section className="container mb-8">
        <ScheduleSearchBar
          onSearch={setSearchFilters}
          onAddNewSchedule={() => {
            setIsCreateScheduleDialogOpen(true);
          }}
        />
      </section>

      <section className="container">
        <div className="flex flex-wrap justify-between items-center mb-6">
          <h2 className="text-xl font-bold">Horários</h2>
          <span className="text-sm font-bold">Encontrados: {scheduleData?.length || 0}</span>
        </div>
        {isScheduleLoading || isFetching ? (
          <div className="flex justify-center items-center h-32">
            <p className="text-muted-foreground font-bold animate-pulse">Carregando horários...</p>
          </div>
        ) : isScheduleError ? (
          <div className="flex justify-center items-center h-32">
            <p className="text-destructive font-bold">
              Erro: {scheduleError instanceof ApiError ? scheduleError.message : "Erro desconhecido"}
            </p>
          </div>
        ) : (
          <Table className="w-full bg-white dark:bg-white/5 border dark:border-violet-500/10 shadow-md hover:shadow-lg p-4 dark:shadow-violet-300/15">
            <TableCaption>Lista de horários.</TableCaption>
            <TableHeader>
              <TableRow>
                <TableHead className="w-25">Horario</TableHead>
                <TableHead className="text-center">Turno</TableHead>
                <TableHead className="text-center">Status</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {scheduleData?.map((schedule) => (
                <TableRow>
                  <TableCell className="font-bold w-25">{schedule.startAt} - {schedule.endAt}</TableCell>
                  <TableCell className="text-center">
                    {schedule.shift === 0 ? "Manhã" : schedule.shift === 1 ? "Tarde" : "Noite"}
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
                        onClick={() => {
                          setEditScheduleData({
                            id: schedule.id as number,
                            startAt: schedule.startAt,
                            endAt: schedule.endAt,
                            shift: schedule.shift,
                            enabled: schedule.enabled,
                          });
                          setIsEditScheduleDialogOpen(true);
                        }}
                      >
                        <Pencil className="size-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </section>
    </>
  );
}
