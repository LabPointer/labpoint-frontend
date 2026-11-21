import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
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
import {
  ManageResourceReserveTable,
  resourceReserveColumns,
} from "@/components/manage-resource-reserves/ManageResourceReserveTable";
import { ColumnChooser } from "@/components/shared/data-table/ColumnChooser";
import { SelectionExportButton } from "@/components/shared/data-table/SelectionExportButton";
import { useColumnPreferences } from "@/components/shared/data-table/use-column-preferences";
import { useRowSelection } from "@/components/shared/data-table/use-row-selection";
import { PaginationControls } from "@/components/shared/PaginationControls";
import { QueryBoundary } from "@/components/shared/QueryBoundary";
import { ResultsHeader } from "@/components/shared/ResultsHeader";
import { exportReservesUsagePdf } from "@/components/usage/export-usage-reports";

export const Route = createFileRoute("/_private/admin/manage-resource-reserves")({
  component: RouteComponent,
});

const reserveKey = (reserve: { id: number | string }) => Number(reserve.id);

const formatDay = (date: string) => date.split("-").reverse().join("/");

function RouteComponent() {
  const selection = useRowSelection<AdminResourceReserve>(reserveKey);
  const clearSelection = selection.clear;
  const [isExporting, setIsExporting] = useState(false);
  const columns = useColumnPreferences("manage-resource-reserves", resourceReserveColumns);
  // A barra de pesquisa emite os filtros iniciais (mês atual) na montagem; a query só roda depois disso.
  const [filters, setFilters] = useState<ResourceReserveFilters | null>(null);
  const pagination = usePagination(filters);

  // Filtros novos = outra lista: a seleção anterior não vale mais.
  useEffect(() => {
    void filters;
    clearSelection();
  }, [filters, clearSelection]);

  async function handleExportSelected() {
    setIsExporting(true);
    await exportReservesUsagePdf(
      "resource",
      selection.rows.map((r) => ({
        id: Number(r.id),
        title: `${r.resource.name} × ${r.quantity}`,
        subtitle: `${r.account.username} (${r.account.registration}) · ${
          r.dateFrom === r.dateTo ? formatDay(r.dateFrom) : `${formatDay(r.dateFrom)} a ${formatDay(r.dateTo)}`
        }`,
      })),
    );
    setIsExporting(false);
  }
  const reserves = useAdminResourceReserves(
    {
      resourceIds: filters?.resourceIds,
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
        <ResultsHeader
          title="Reservas de recurso"
          count={items.length}
          actions={
            <>
              <SelectionExportButton
                count={selection.count}
                isPending={isExporting}
                onExport={handleExportSelected}
                onClear={selection.clear}
              />
              <ColumnChooser columns={resourceReserveColumns} state={columns} />
            </>
          }
        />
        <QueryBoundary
          isPending={reserves.isPending}
          isFetching={reserves.isFetching}
          isError={reserves.isError}
          error={reserves.error}
          isEmpty={items.length === 0}
          loadingText="Carregando reservas..."
          emptyText="Nenhuma reserva de recurso encontrada."
        >
          <ManageResourceReserveTable
            reserves={items}
            columns={columns.visibleColumns}
            selection={selection}
            onEdit={editDialog.open}
            onCancel={cancelDialog.open}
          />
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
