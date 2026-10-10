import { useQueryClient } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { Suspense, useState } from "react";
import { toast } from "sonner";
import {
  type ManageCreateScheduleData,
  ManageCreateScheduleDialog,
} from "#/components/manage-schedules/ManageCreateScheduleDialog";
import ScheduleSearchBar, { type ScheduleFilters } from "#/components/manage-schedules/ManageScheduleSearchBar";
import { useApi } from "#/lib/utils/restapi";
import {
  ManageEditScheduleDialog,
  type ManageEditScheduleData,
} from "#/components/manage-schedules/ManageEditScheduleDialog";
import { ErrorBoundary, getErrorMessage } from "react-error-boundary";
import { ManageScheduleTableRow } from "#/components/manage-schedules/ManageScheduleTableRow";

const api = useApi();

export const Route = createFileRoute("/_private/admin/manage-schedules")({
  component: RouteComponent,
});

function RouteComponent() {
  const queryClient = useQueryClient();
  const [isCreateScheduleDialogOpen, setIsCreateScheduleDialogOpen] = useState(false);
  const [isEditScheduleDialogOpen, setIsEditScheduleDialogOpen] = useState(false);

  const [editScheduleData, setEditScheduleData] = useState<ManageEditScheduleData>();

  const [searchFilters, setSearchFilters] = useState<ScheduleFilters>({ shift: undefined, enabled: undefined });

  async function handleCreateSubmit(data: ManageCreateScheduleData) {
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
    queryClient.invalidateQueries({ queryKey: ["schedule-data"] });
  }

  async function handleEditSubmit(data: ManageEditScheduleData) {
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
    queryClient.invalidateQueries({ queryKey: ["schedule-data"] });
  }

  return (
    <>
      <ManageCreateScheduleDialog
        isOpen={isCreateScheduleDialogOpen}
        onClose={() => setIsCreateScheduleDialogOpen(false)}
        onSubmit={handleCreateSubmit}
      />

      <ManageEditScheduleDialog
        isOpen={isEditScheduleDialogOpen}
        onClose={() => setIsEditScheduleDialogOpen(false)}
        onSubmit={handleEditSubmit}
        data={editScheduleData ?? { id: 0, startAt: "", endAt: "", shift: 0, enabled: true }}
      />

      <section className="container mb-8">
        <ScheduleSearchBar
          onSearch={(filters) => {
            setSearchFilters(filters);
            queryClient.invalidateQueries({ queryKey: ["schedule-data"] });
          }}
          onAddNewSchedule={() => {
            setIsCreateScheduleDialogOpen(true);
          }}
        />
      </section>

      <section className="container">
        <ErrorBoundary
          resetKeys={[searchFilters]}
          fallbackRender={({ error }) => (
            <div className="flex flex-col items-center justify-center gap-2">
              <p className="text-center font-bold text-red-600 dark:text-red-400">Erro: {getErrorMessage(error)}</p>
            </div>
          )}
        >
          <Suspense fallback={<div className="text-center font-bold animate-pulse">Carregando horarios...</div>}>
            <ManageScheduleTableRow
              props={searchFilters}
              onEdit={(data) => {
                setEditScheduleData({
                  id: data.id,
                  startAt: data.startAt,
                  endAt: data.endAt,
                  shift: data.shift,
                  enabled: data.enabled,
                });

                setIsEditScheduleDialogOpen(true);
              }}
            />
          </Suspense>
        </ErrorBoundary>
      </section>
    </>
  );
}
