import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useFormDialog } from "#/hooks/use-form-dialog";
import { usePagination } from "#/hooks/use-pagination";
import { toApiDate } from "#/lib/queries/reserves";
import { useCreateResourceReserve } from "#/lib/queries/resource-reserves";
import { type Resource, useResources } from "#/lib/queries/resources";
import { succeeded } from "#/lib/utils/api-result";
import { toPaged } from "#/lib/utils/pagination";
import { ResourceCard } from "@/components/resources/ResourceCard";
import { type ResourceReserveFormData, ResourceReserveModal } from "@/components/resources/ResourceReserveModal";
import { ResourceSearchBar, type ResourceSearchFilters } from "@/components/resources/ResourceSearchBar";
import { PaginationControls } from "@/components/shared/PaginationControls";
import { QueryBoundary } from "@/components/shared/QueryBoundary";
import { ResultsHeader } from "@/components/shared/ResultsHeader";

export const Route = createFileRoute("/_private/resource-reserve")({
  component: RouteComponent,
});

function RouteComponent() {
  // A barra de pesquisa emite os filtros iniciais na montagem; a query só roda depois disso.
  const [filters, setFilters] = useState<ResourceSearchFilters | null>(null);
  const pagination = usePagination(filters);

  const from = filters?.range?.from;
  const resources = useResources(
    {
      search: filters?.search,
      reservable: true,
      enabled: true,
      // com período, o backend calcula as unidades livres e esconde os esgotados
      startAt: from ? toApiDate(from) : undefined,
      endAt: from ? toApiDate(filters?.range?.to ?? from) : undefined,
      scheduleIds: filters?.scheduleIds,
      ...pagination.request,
    },
    { enabled: filters !== null },
  );
  const { items, hasNext } = toPaged(resources.data, pagination.limit);

  const createReserve = useCreateResourceReserve();
  const reserveDialog = useFormDialog<Resource>();

  async function handleReserve(data: ResourceReserveFormData) {
    const resource = reserveDialog.target;
    if (!resource || !data.range.from) return;

    const ok = await succeeded(
      createReserve.mutateAsync({
        resourceId: Number(resource.id),
        body: {
          startAt: toApiDate(data.range.from),
          endAt: toApiDate(data.range.to ?? data.range.from),
          scheduleIds: data.schedules.map((schedule) => schedule.id),
          quantity: data.quantity,
          purpose: data.purpose,
        },
      }),
    );
    if (ok) reserveDialog.close();
  }

  return (
    <>
      <section className="container mb-8">
        <ResourceSearchBar
          onSearch={setFilters}
          rangeHint="Opcional: escolha um período para ver as unidades livres."
        />
      </section>

      {reserveDialog.target && (
        <ResourceReserveModal
          key={reserveDialog.session}
          resource={reserveDialog.target}
          initialRange={filters?.range}
          open={reserveDialog.isOpen}
          onClose={reserveDialog.close}
          onSubmit={handleReserve}
        />
      )}

      <section className="container">
        <ResultsHeader title="Recursos reserváveis" count={items.length} />
        <QueryBoundary
          isPending={resources.isPending}
          isFetching={resources.isFetching}
          isError={resources.isError}
          error={resources.error}
          isEmpty={items.length === 0}
          loadingText="Carregando..."
          emptyText={from ? "Nenhum recurso com unidades livres neste período." : "Nenhum recurso encontrado."}
        >
          <div className="grid w-full grid-cols-1 gap-4 sm:grid-cols-[repeat(auto-fill,minmax(280px,1fr))] sm:gap-6">
            {items.map((resource) => (
              <div key={resource.id} className="flex">
                <ResourceCard
                  resource={resource}
                  showAvailability={Boolean(from)}
                  onReserve={() => reserveDialog.open(resource)}
                />
              </div>
            ))}
          </div>
        </QueryBoundary>
        <PaginationControls
          page={pagination.page}
          hasNext={hasNext}
          isFetching={resources.isFetching}
          onPageChange={pagination.setPage}
        />
      </section>
    </>
  );
}
