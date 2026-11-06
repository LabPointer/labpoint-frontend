import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useFormDialog } from "#/hooks/use-form-dialog";
import { usePagination } from "#/hooks/use-pagination";
import { toApiDate } from "#/lib/queries/reserves";
import {
  type AdminResourceReserve,
  useAdminResourceReserves,
  useCancelAdminResourceReserve,
  useEditAdminResourceReserve,
} from "#/lib/queries/resource-reserves";
import { succeeded } from "#/lib/utils/api-result";
import { toPaged } from "#/lib/utils/pagination";
import { CancelReserveDialog } from "@/components/history/CancelReserveDialog";
import {
  type ManageResourceReserveEditData,
  ManageResourceReserveEditDialog,
} from "@/components/manage-resource-reserves/ManageResourceReserveEditDialog";
import {
  ManageResourceReserveSearchBar,
  type ResourceReserveFilters,
} from "@/components/manage-resource-reserves/ManageResourceReserveSearchBar";
import { ManageResourceReserveTable } from "@/components/manage-resource-reserves/ManageResourceReserveTable";
import { PaginationControls } from "@/components/shared/PaginationControls";
import { QueryBoundary } from "@/components/shared/QueryBoundary";
import { ResultsHeader } from "@/components/shared/ResultsHeader";

export const Route = createFileRoute("/_private/admin/manage-resource-reserves")({
  component: RouteComponent,
});

function RouteComponent() {
  // A barra de pesquisa emite os filtros iniciais (mês atual) na montagem; a query só roda depois disso.
  const [filters, setFilters] = useState<ResourceReserveFilters | null>(null);
  const pagination = usePagination(filters);
  const reserves = useAdminResourceReserves(
    {
      search: filters?.search,
      startAt: filters?.startAt ?? "",
      endAt: filters?.endAt ?? "",
      spaceIds: filters?.spaceIds,
      accountIds: filters?.accountIds,
      status: filters?.status,
      ...pagination.request,
    },
    { enabled: filters !== null },
  );
  const { items, hasNext } = toPaged(reserves.data, pagination.limit);

  const editReserve = useEditAdminResourceReserve();
  const cancelReserve = useCancelAdminResourceReserve();
  const editDialog = useFormDialog<AdminResourceReserve>();
  const cancelDialog = useFormDialog<AdminResourceReserve>();

  async function handleEdit(data: ManageResourceReserveEditData) {
    const reserve = editDialog.target;
    if (!reserve || !data.range.from) return;

    const startAt = toApiDate(data.range.from);
    const endAt = toApiDate(data.range.to ?? data.range.from);
    const scheduleIds = data.schedules.map((schedule) => schedule.id).sort((a, b) => a - b);
    const currentScheduleIds = reserve.schedules.map((schedule) => Number(schedule.id)).sort((a, b) => a - b);
    const datesChanged = startAt !== reserve.dateFrom || endAt !== reserve.dateTo;
    const schedulesChanged = scheduleIds.join(",") !== currentScheduleIds.join(",");
    const quantityChanged = data.quantity !== Number(reserve.quantity);
    const statusChanged = data.status !== Number(reserve.status);

    if (!datesChanged && !schedulesChanged && !quantityChanged && !statusChanged) {
      editDialog.close();
      return;
    }

    const ok = await succeeded(
      editReserve.mutateAsync({
        reserveId: Number(reserve.id),
        body: {
          status: statusChanged ? data.status : null,
          startAt: datesChanged ? startAt : null,
          endAt: datesChanged ? endAt : null,
          scheduleIds: schedulesChanged ? scheduleIds : null,
          quantity: quantityChanged ? data.quantity : null,
        },
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
        <ManageResourceReserveEditDialog
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
          spaceName={cancelDialog.target.resource.name}
          userName={cancelDialog.target.account.username}
          note={
            cancelDialog.target.spaceReserve
              ? `A reserva da sala ${cancelDialog.target.spaceReserve.spaceName} continua valendo.`
              : undefined
          }
          isPending={cancelReserve.isPending}
          onClose={cancelDialog.close}
          onConfirm={handleConfirmCancel}
        />
      )}

      <section className="container mb-8">
        <ManageResourceReserveSearchBar onSearch={setFilters} />
      </section>

      <section className="container">
        <ResultsHeader title="Reservas de recurso" count={items.length} />
        <QueryBoundary
          isPending={reserves.isPending}
          isFetching={reserves.isFetching}
          isError={reserves.isError}
          error={reserves.error}
          isEmpty={items.length === 0}
          loadingText="Carregando reservas..."
          emptyText="Nenhuma reserva de recurso encontrada."
        >
          <ManageResourceReserveTable reserves={items} onEdit={editDialog.open} onCancel={cancelDialog.open} />
        </QueryBoundary>
        <PaginationControls
          page={pagination.page}
          hasNext={hasNext}
          isFetching={reserves.isFetching}
          onPageChange={pagination.setPage}
        />
      </section>
    </>
  );
}
