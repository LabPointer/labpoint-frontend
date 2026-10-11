import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useFormDialog } from "#/hooks/use-form-dialog";
import {
  type AdminReserve,
  useAdminReserves,
  useCancelAdminReserve,
  useEditAdminReserve,
} from "#/lib/queries/admin-reserves";
import { toApiDate } from "#/lib/queries/reserves";
import { succeeded } from "#/lib/utils/api-result";
import { CancelReserveDialog } from "@/components/history/CancelReserveDialog";
import {
  type ManageReserveEditData,
  ManageReserveEditDialog,
} from "@/components/manage-reserves/ManageReserveEditDialog";
import {
  initialReserveFilters,
  ManageReserveSearchBar,
  type ReserveFilters,
} from "@/components/manage-reserves/ManageReserveSearchBar";
import { ManageReserveTable } from "@/components/manage-reserves/ManageReserveTable";
import { QueryBoundary } from "@/components/shared/QueryBoundary";
import { ResultsHeader } from "@/components/shared/ResultsHeader";

export const Route = createFileRoute("/_private/admin/manage-reserves")({
  component: RouteComponent,
});

function RouteComponent() {
  const [filters, setFilters] = useState<ReserveFilters>(initialReserveFilters);
  const reserves = useAdminReserves({
    search: filters.search,
    startAt: filters.startAt,
    endAt: filters.endAt,
    scheduleIds: filters.scheduleIds,
    accountIds: filters.accountIds,
    status: filters.status,
  });
  const editReserve = useEditAdminReserve();
  const cancelReserve = useCancelAdminReserve();
  const editDialog = useFormDialog<AdminReserve>();
  const cancelDialog = useFormDialog<AdminReserve>();

  async function handleEdit(data: ManageReserveEditData) {
    const reserve = editDialog.target;
    if (!reserve || !data.range.from) return;

    const startAt = toApiDate(data.range.from);
    const endAt = toApiDate(data.range.to ?? data.range.from);
    const scheduleIds = data.schedules.map((schedule) => schedule.id).sort((a, b) => a - b);
    const currentScheduleIds = reserve.schedules.map((schedule) => Number(schedule.id)).sort((a, b) => a - b);

    const datesChanged = startAt !== reserve.dateFrom || endAt !== reserve.dateTo;
    const schedulesChanged = scheduleIds.join(",") !== currentScheduleIds.join(",");
    const statusChanged = data.status !== Number(reserve.status);

    // sem alterações: não há o que enviar (o backend recusa PATCH vazio)
    if (!datesChanged && !schedulesChanged && !statusChanged) {
      editDialog.close();
      return;
    }

    // campos `null` não são alterados pelo backend: enviamos só o que mudou
    const ok = await succeeded(
      editReserve.mutateAsync({
        reserveId: Number(reserve.id),
        body: {
          status: statusChanged ? data.status! : Number(reserve.status),
          startAt: datesChanged ? startAt : null,
          endAt: datesChanged ? endAt : null,
          scheduleIds: schedulesChanged ? scheduleIds : null,
        } as Parameters<typeof editReserve.mutateAsync>[0]["body"],
      }),
    );
    if (ok) editDialog.close();
  }

  async function handleConfirmCancel() {
    const reserve = cancelDialog.target;
    if (!reserve) return;

    if (await succeeded(cancelReserve.mutateAsync(Number(reserve.id)))) cancelDialog.close();
  }

  return (
    <>
      {editDialog.target && (
        <ManageReserveEditDialog
          key={editDialog.session}
          reserve={editDialog.target}
          open={editDialog.isOpen}
          onClose={editDialog.close}
          onSubmit={handleEdit}
        />
      )}
      {cancelDialog.target && (
        <CancelReserveDialog
          open={cancelDialog.isOpen}
          spaceName={cancelDialog.target.spaces.name}
          userName={cancelDialog.target.account.username}
          isPending={cancelReserve.isPending}
          onClose={cancelDialog.close}
          onConfirm={handleConfirmCancel}
        />
      )}

      <section className="container mb-8">
        <ManageReserveSearchBar onSearch={setFilters} />
      </section>

      <section className="container">
        <ResultsHeader title="Reservas" count={reserves.data?.length ?? 0} />
        <QueryBoundary
          isPending={reserves.isPending}
          isFetching={reserves.isFetching}
          isError={reserves.isError}
          error={reserves.error}
          isEmpty={reserves.data?.length === 0}
          loadingText="Carregando reservas..."
          emptyText="Nenhuma reserva encontrada."
        >
          <ManageReserveTable reserves={reserves.data ?? []} onEdit={editDialog.open} onCancel={cancelDialog.open} />
        </QueryBoundary>
      </section>
    </>
  );
}
