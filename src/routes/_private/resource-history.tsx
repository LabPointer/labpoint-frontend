import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useFormDialog } from "#/hooks/use-form-dialog";
import { usePagination } from "#/hooks/use-pagination";
import { toApiDate } from "#/lib/queries/reserves";
import {
  type ResourceReserve,
  useCancelResourceReserve,
  useEditResourceReserve,
  useMyResourceReserves,
} from "#/lib/queries/resource-reserves";
import { succeeded } from "#/lib/utils/api-result";
import { toPaged } from "#/lib/utils/pagination";
import { CancelReserveDialog } from "@/components/history/CancelReserveDialog";
import { ResourceReserveCard } from "@/components/resource-history/ResourceReserveCard";
import {
  type ResourceReserveEditFormData,
  ResourceReserveEditModal,
} from "@/components/resource-history/ResourceReserveEditModal";
import { ResourceSearchBar, type ResourceSearchFilters } from "@/components/resources/ResourceSearchBar";
import { PaginationControls } from "@/components/shared/PaginationControls";
import { QueryBoundary } from "@/components/shared/QueryBoundary";
import { ResultsHeader } from "@/components/shared/ResultsHeader";
import { UsageSessionsDialog } from "@/components/usage/UsageSessionsDialog";

export const Route = createFileRoute("/_private/resource-history")({
  component: RouteComponent,
});

function RouteComponent() {
  const [filters, setFilters] = useState<ResourceSearchFilters | null>(null);
  const pagination = usePagination(filters);

  const from = filters?.range?.from;
  const reserves = useMyResourceReserves(
    {
      search: filters?.search,
      startAt: from ? toApiDate(from) : undefined,
      endAt: from ? toApiDate(filters?.range?.to ?? from) : undefined,
      scheduleIds: filters?.scheduleIds,
      resourceIds: filters?.resourceIds,
      ...pagination.request,
    },
    { enabled: filters !== null },
  );
  const { items, hasNext } = toPaged(reserves.data, pagination.limit);

  const editReserve = useEditResourceReserve();
  const cancelReserve = useCancelResourceReserve();
  const editDialog = useFormDialog<ResourceReserve>();
  const cancelDialog = useFormDialog<ResourceReserve>();
  const reportDialog = useFormDialog<ResourceReserve>();

  async function handleEdit(data: ResourceReserveEditFormData) {
    const reserve = editDialog.target;
    if (!reserve || !data.range.from) return;

    const startAt = toApiDate(data.range.from);
    const endAt = toApiDate(data.range.to ?? data.range.from);
    const scheduleIds = data.schedules.map((schedule) => schedule.id).sort((a, b) => a - b);
    const currentScheduleIds = reserve.schedules.map((schedule) => Number(schedule.id)).sort((a, b) => a - b);
    const datesChanged = startAt !== reserve.dateFrom || endAt !== reserve.dateTo;
    const schedulesChanged = scheduleIds.join(",") !== currentScheduleIds.join(",");
    const quantityChanged = data.quantity !== Number(reserve.quantity);

    if (!datesChanged && !schedulesChanged && !quantityChanged) {
      editDialog.close();
      return;
    }

    const ok = await succeeded(
      editReserve.mutateAsync({
        reserveId: Number(reserve.id),
        body: {
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
        <ResourceReserveEditModal
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

      {reportDialog.target && (
        <UsageSessionsDialog
          key={reportDialog.session}
          kind="resource"
          reserveId={Number(reportDialog.target.id)}
          title={`Relatório de uso · ${reportDialog.target.resource.name}`}
          description={
            reportDialog.target.spaceReserve
              ? `Registrado no check-in da sala ${reportDialog.target.spaceReserve.spaceName}.`
              : "O que foi registrado no check-in e no check-out de cada turno."
          }
          open={reportDialog.isOpen}
          onClose={reportDialog.close}
        />
      )}

      <section className="container mb-8">
        <ResourceSearchBar
          onSearch={setFilters}
          minDate={null}
          maxDays={null}
          rangeHint="Opcional: mostra as reservas que tocam o período escolhido."
          showResourceFilter
        />
      </section>

      <section className="container">
        <ResultsHeader title="Reservas de recurso" count={items.length} />
        <QueryBoundary
          isPending={reserves.isPending}
          isFetching={reserves.isFetching}
          isError={reserves.isError}
          error={reserves.error}
          isEmpty={items.length === 0}
          loadingText="Carregando..."
          emptyText="Nenhuma reserva de recurso encontrada."
        >
          <div className="grid w-full grid-cols-1 gap-4 sm:grid-cols-[repeat(auto-fill,minmax(280px,1fr))] sm:gap-6">
            {items.map((reserve) => (
              <div key={reserve.id} className="flex">
                <ResourceReserveCard
                  reserve={reserve}
                  onEdit={editDialog.open}
                  onCancel={cancelDialog.open}
                  onReport={reportDialog.open}
                />
              </div>
            ))}
          </div>
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
