import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useFormDialog } from "#/hooks/use-form-dialog";
import { usePagination } from "#/hooks/use-pagination";
import {
  type Reserve,
  reserveTab,
  toApiDate,
  useCancelReserve,
  useEditReserve,
  useRangeReserves,
} from "#/lib/queries/reserves";
import { succeeded } from "#/lib/utils/api-result";
import { paginateLocal } from "#/lib/utils/pagination";
import { CancelReserveDialog } from "@/components/history/CancelReserveDialog";
import { HistoryCard } from "@/components/history/HistoryCard";
import {
  activeLinkedResources,
  type HistoryEditFormData,
  HistoryEditModal,
} from "@/components/history/HistoryEditModal";
import { type HistoryFilters, HistorySearchBar, initialHistoryFilters } from "@/components/history/HistorySearchBar";
import { sameResources } from "@/components/reserve/ReserveResourcesField";
import { PaginationControls } from "@/components/shared/PaginationControls";
import { QueryBoundary } from "@/components/shared/QueryBoundary";
import { ResultsHeader } from "@/components/shared/ResultsHeader";
import { UsageSessionsDialog } from "@/components/usage/UsageSessionsDialog";

export const Route = createFileRoute("/_private/space-history")({
  component: RouteComponent,
});

function RouteComponent() {
  const [filters, setFilters] = useState<HistoryFilters>(initialHistoryFilters);
  const pagination = usePagination(filters);
  const reserves = useRangeReserves({
    startAt: filters.startAt,
    endAt: filters.endAt,
    status: filters.status,
    spaceIds: filters.spaceIds,
  });
  // GET /space-reserve não tem Limit/Offset: o backend devolve o período todo e a página é recortada aqui.
  const { items, hasNext } = paginateLocal(reserves.data, pagination);
  const editReserve = useEditReserve();
  const cancelReserve = useCancelReserve();
  const editDialog = useFormDialog<Reserve>();
  const cancelDialog = useFormDialog<Reserve>();
  const reportDialog = useFormDialog<Reserve>();

  async function handleEdit(data: HistoryEditFormData) {
    const reserve = editDialog.target;
    if (!reserve || !data.range.from) return;

    // recursos só vão no PATCH quando o conjunto mudou (null = não mexer nos recursos)
    const resourcesChanged = !sameResources(data.resources, activeLinkedResources(reserve));
    const ok = await succeeded(
      editReserve.mutateAsync({
        reserveId: Number(reserve.id),
        body: {
          startAt: toApiDate(data.range.from),
          endAt: toApiDate(data.range.to ?? data.range.from),
          scheduleIds: data.schedules.map((schedule) => schedule.id),
          resources: resourcesChanged
            ? data.resources.map((resource) => ({ resourceId: resource.id, quantity: resource.quantity }))
            : null,
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
        <HistoryEditModal
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
          spaceName={cancelDialog.target.space.name}
          note={
            cancelDialog.target.resources?.length
              ? "Os recursos reservados junto com esta sala também serão cancelados."
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
          kind="space"
          reserveId={Number(reportDialog.target.id)}
          title={`Relatório de uso · ${reportDialog.target.space.name}`}
          description="O que foi registrado no check-in e no check-out de cada turno."
          open={reportDialog.isOpen}
          onClose={reportDialog.close}
        />
      )}

      <section className="container mb-8">
        <HistorySearchBar onSearch={setFilters} />
      </section>

      <section className="container">
        <ResultsHeader title="Reservas" count={items.length} />
        <QueryBoundary
          isPending={reserves.isPending}
          isFetching={reserves.isFetching}
          isError={reserves.isError}
          error={reserves.error}
          isEmpty={items.length === 0}
          loadingText="Carregando..."
          emptyText="Nenhum histórico encontrado."
        >
          <div className="grid w-full grid-cols-1 gap-4 sm:grid-cols-[repeat(auto-fill,minmax(280px,1fr))] sm:gap-6">
            {items.map((reserve) => (
              <div key={reserve.id} className="flex">
                <HistoryCard
                  reserve={reserve}
                  showCTA={reserveTab(reserve) === "next"}
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
