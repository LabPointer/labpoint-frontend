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
import { type HistoryEditFormData, HistoryEditModal } from "@/components/history/HistoryEditModal";
import { HistorySearchBar, type HistoryFilters, initialHistoryFilters } from "@/components/history/HistorySearchBar";
import { PaginationControls } from "@/components/shared/PaginationControls";
import { QueryBoundary } from "@/components/shared/QueryBoundary";
import { ResultsHeader } from "@/components/shared/ResultsHeader";

export const Route = createFileRoute("/_private/history")({
  component: RouteComponent,
});

function RouteComponent() {
  const [filters, setFilters] = useState<HistoryFilters>(initialHistoryFilters);
  const pagination = usePagination(filters);
  const reserves = useRangeReserves({ startAt: filters.startAt, endAt: filters.endAt, status: filters.status });
  // GET /space-reserve não tem Limit/Offset: o backend devolve o período todo e a página é recortada aqui.
  const { items, hasNext } = paginateLocal(reserves.data, pagination);
  const editReserve = useEditReserve();
  const cancelReserve = useCancelReserve();
  const editDialog = useFormDialog<Reserve>();
  const cancelDialog = useFormDialog<Reserve>();

  async function handleEdit(data: HistoryEditFormData) {
    const reserve = editDialog.target;
    if (!reserve || !data.range.from) return;

    const ok = await succeeded(
      editReserve.mutateAsync({
        reserveId: Number(reserve.id),
        body: {
          startAt: toApiDate(data.range.from),
          endAt: toApiDate(data.range.to ?? data.range.from),
          scheduleIds: data.schedules.map((schedule) => schedule.id),
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
          isPending={cancelReserve.isPending}
          onClose={cancelDialog.close}
          onConfirm={handleConfirmCancel}
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
          <div className="grid w-full grid-cols-[repeat(auto-fit,minmax(288px,1fr))] justify-center gap-6">
            {items.map((reserve) => (
              <div key={reserve.id} className="flex w-full justify-center p-2">
                <HistoryCard
                  reserve={reserve}
                  showCTA={reserveTab(reserve) === "next"}
                  onEdit={editDialog.open}
                  onCancel={cancelDialog.open}
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
