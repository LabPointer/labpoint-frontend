import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useFormDialog } from "#/hooks/use-form-dialog";
import { usePagination } from "#/hooks/use-pagination";
import {
  type Schedule,
  useCreateSchedule,
  useDeleteSchedule,
  useEditSchedule,
  useSchedules,
} from "#/lib/queries/schedules";
import { succeeded } from "#/lib/utils/api-result";
import { DEFAULT_PAGE_LIMIT, toPaged } from "#/lib/utils/pagination";
import { ManageScheduleDialog, type ScheduleFormData } from "@/components/manage-schedules/ManageScheduleDialog";
import { ManageScheduleSearchBar, type ScheduleFilters } from "@/components/manage-schedules/ManageScheduleSearchBar";
import {
  ManageScheduleTable,
  scheduleColumns,
  scheduleTimeLabel,
} from "@/components/manage-schedules/ManageScheduleTable";
import { DeleteConfirmDialog } from "@/components/shared/DeleteConfirmDialog";
import { ColumnChooser } from "@/components/shared/data-table/ColumnChooser";
import { useColumnPreferences } from "@/components/shared/data-table/use-column-preferences";
import { PaginationControls } from "@/components/shared/PaginationControls";
import { QueryBoundary } from "@/components/shared/QueryBoundary";
import { ResultsHeader } from "@/components/shared/ResultsHeader";

export const Route = createFileRoute("/_private/admin/manage-schedules")({
  component: RouteComponent,
});

const initialFilters: ScheduleFilters = {
  shift: undefined,
  enabled: undefined,
  startAt: undefined,
  endAt: undefined,
  limit: DEFAULT_PAGE_LIMIT,
};

function RouteComponent() {
  const [filters, setFilters] = useState<ScheduleFilters>(initialFilters);
  const pagination = usePagination(filters);
  const schedules = useSchedules({
    shift: filters.shift,
    enabled: filters.enabled,
    startAt: filters.startAt,
    endAt: filters.endAt,
    ...pagination.request,
  });
  const { items, hasNext } = toPaged(schedules.data, pagination.limit);
  const createSchedule = useCreateSchedule();
  const editSchedule = useEditSchedule();
  const createDialog = useFormDialog();
  const editDialog = useFormDialog<Schedule>();
  const deleteSchedule = useDeleteSchedule();
  const deleteDialog = useFormDialog<Schedule>();
  const columns = useColumnPreferences("manage-schedules", scheduleColumns);

  async function handleDelete() {
    const schedule = deleteDialog.target;
    if (!schedule) return;
    const ok = await succeeded(
      deleteSchedule.mutateAsync({ id: schedule.id, confirmName: scheduleTimeLabel(schedule) }),
    );
    if (ok) deleteDialog.close();
  }

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

      {deleteDialog.target && (
        <DeleteConfirmDialog
          key={deleteDialog.session}
          open={deleteDialog.isOpen}
          entityLabel="horário"
          itemName={scheduleTimeLabel(deleteDialog.target)}
          consequences="Ele sai de todas as reservas e relatórios de uso; reservas que ficarem sem nenhum horário também são excluídas."
          isPending={deleteSchedule.isPending}
          onClose={deleteDialog.close}
          onConfirm={handleDelete}
        />
      )}

      <section className="container mb-8">
        <ManageScheduleSearchBar onSearch={setFilters} onAddNewSchedule={() => createDialog.open()} />
      </section>

      <section className="container">
        <ResultsHeader
          title="Horários"
          count={items.length}
          actions={<ColumnChooser columns={scheduleColumns} state={columns} />}
        />
        <QueryBoundary
          isPending={schedules.isPending}
          isFetching={schedules.isFetching}
          isError={schedules.isError}
          error={schedules.error}
          isEmpty={items.length === 0}
          loadingText="Carregando horários..."
          emptyText="Nenhum horário encontrado."
        >
          <ManageScheduleTable
            schedules={items}
            columns={columns.visibleColumns}
            onEdit={editDialog.open}
            onDelete={deleteDialog.open}
          />
        </QueryBoundary>
        <PaginationControls
          page={pagination.page}
          hasNext={hasNext}
          isFetching={schedules.isFetching}
          onPageChange={pagination.setPage}
        />
      </section>
    </>
  );
}
