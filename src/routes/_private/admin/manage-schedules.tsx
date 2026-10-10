import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useFormDialog } from "#/hooks/use-form-dialog";
import { type Schedule, useCreateSchedule, useEditSchedule, useSchedules } from "#/lib/queries/schedules";
import { succeeded } from "#/lib/utils/api-result";
import { ManageScheduleDialog, type ScheduleFormData } from "@/components/manage-schedules/ManageScheduleDialog";
import { ManageScheduleSearchBar, type ScheduleFilters } from "@/components/manage-schedules/ManageScheduleSearchBar";
import { ManageScheduleTable } from "@/components/manage-schedules/ManageScheduleTable";
import { QueryBoundary } from "@/components/shared/QueryBoundary";
import { ResultsHeader } from "@/components/shared/ResultsHeader";

export const Route = createFileRoute("/_private/admin/manage-schedules")({
  component: RouteComponent,
});

const initialFilters: ScheduleFilters = { shift: undefined, enabled: undefined };

function RouteComponent() {
  const [filters, setFilters] = useState<ScheduleFilters>(initialFilters);
  const schedules = useSchedules(filters);
  const createSchedule = useCreateSchedule();
  const editSchedule = useEditSchedule();
  const createDialog = useFormDialog();
  const editDialog = useFormDialog<Schedule>();

  async function handleCreate(data: ScheduleFormData) {
    if (await succeeded(createSchedule.mutateAsync(data))) createDialog.close();
  }

  async function handleEdit(data: ScheduleFormData) {
    const schedule = editDialog.target;
    if (!schedule) return;

    if (await succeeded(editSchedule.mutateAsync({ id: schedule.id, ...data }))) editDialog.close();
  }

  return (
    <>
      {createDialog.mounted && (
        <ManageScheduleDialog
          key={createDialog.session}
          mode="create"
          open={createDialog.isOpen}
          onClose={createDialog.close}
          onSubmit={handleCreate}
        />
      )}
      {editDialog.target && (
        <ManageScheduleDialog
          key={editDialog.session}
          mode="edit"
          schedule={editDialog.target}
          open={editDialog.isOpen}
          onClose={editDialog.close}
          onSubmit={handleEdit}
        />
      )}

      <section className="container mb-8">
        <ManageScheduleSearchBar onSearch={setFilters} onAddNewSchedule={() => createDialog.open()} />
      </section>

      <section className="container">
        <ResultsHeader title="Horários" count={schedules.data?.length ?? 0} />
        <QueryBoundary
          isPending={schedules.isPending}
          isFetching={schedules.isFetching}
          isError={schedules.isError}
          error={schedules.error}
          isEmpty={schedules.data?.length === 0}
          loadingText="Carregando horários..."
          emptyText="Nenhum horário encontrado."
        >
          <ManageScheduleTable schedules={schedules.data ?? []} onEdit={editDialog.open} />
        </QueryBoundary>
      </section>
    </>
  );
}
