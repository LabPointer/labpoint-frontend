import { createFileRoute } from "@tanstack/react-router";
import { format } from "date-fns";
import { useState } from "react";
import { useFormDialog } from "#/hooks/use-form-dialog";
import { usePagination } from "#/hooks/use-pagination";
import { toApiDate, useCreateReserve } from "#/lib/queries/reserves";
import { useSpaces } from "#/lib/queries/spaces";
import { succeeded } from "#/lib/utils/api-result";
import { toPaged } from "#/lib/utils/pagination";
import { SpaceCard } from "@/components/home/SpaceCard";
import { type SpaceProps, type SpaceReserveFormData, SpaceReserveModal } from "@/components/home/SpaceReserveModal";
import { SpaceSearchBar, type SpaceSearchFilters } from "@/components/home/SpaceSearchBar";
import { PaginationControls } from "@/components/shared/PaginationControls";
import { QueryBoundary } from "@/components/shared/QueryBoundary";
import { ResultsHeader } from "@/components/shared/ResultsHeader";

export const Route = createFileRoute("/_private/home")({
  component: RouteComponent,
});

function RouteComponent() {
  // A barra de pesquisa emite os filtros iniciais na montagem; a query só roda depois disso.
  const [filters, setFilters] = useState<SpaceSearchFilters | null>(null);
  const pagination = usePagination(filters);

  // O backend valida Capacity em 10..200 (fora disso responde 400): só enviamos quando válida.
  const capacity = filters && filters.minimumCapacity >= 10 ? Math.min(filters.minimumCapacity, 200) : undefined;
  // Disponibilidade é calculada por horário: sem horários escolhidos, não enviamos o período
  // (senão o backend esconde qualquer espaço que tenha alguma reserva na janela).
  const checkAvailability = Boolean(filters && filters.schedules.length > 0);

  const spaces = useSpaces(
    {
      search: filters?.searchQuery,
      capacity,
      resources: filters?.resources,
      subjects: filters?.subjects,
      schedules: checkAvailability ? filters?.schedules : undefined,
      startAt: checkAvailability && filters ? format(filters.startDate, "yyyy-MM-dd") : undefined,
      endAt: checkAvailability && filters ? format(filters.endDate, "yyyy-MM-dd") : undefined,
      ...pagination.request,
    },
    { enabled: filters !== null },
  );
  const { items, hasNext } = toPaged(spaces.data, pagination.limit);

  const createReserve = useCreateReserve();
  const reserveDialog = useFormDialog<SpaceProps>();
  const reservingSpace = reserveDialog.target;

  async function handleReserve(data: SpaceReserveFormData) {
    if (!reservingSpace || !data.range.from) return;

    const ok = await succeeded(
      createReserve.mutateAsync({
        spaceId: reservingSpace.id,
        body: {
          startAt: toApiDate(data.range.from),
          // sem fim selecionado = reserva de um único dia
          endAt: toApiDate(data.range.to ?? data.range.from),
          scheduleIds: data.schedules.map((schedule) => schedule.id),
          purpose: data.purpose,
          lock: data.lock,
        },
      }),
    );
    if (ok) reserveDialog.close();
  }

  return (
    <>
      <section className="container mb-8">
        <SpaceSearchBar onSearch={setFilters} />
      </section>
      {reservingSpace && (
        <SpaceReserveModal
          key={reserveDialog.session}
          space={reservingSpace}
          open={reserveDialog.isOpen}
          onClose={reserveDialog.close}
          onSubmit={handleReserve}
        />
      )}
      <section className="container">
        <ResultsHeader title="Laboratórios" count={items.length} />
        <QueryBoundary
          isPending={spaces.isPending}
          isFetching={spaces.isFetching}
          isError={spaces.isError}
          error={spaces.error}
          isEmpty={items.length === 0}
          loadingText="Carregando..."
          emptyText="Nenhum laboratório encontrado."
        >
          <div className="grid w-full grid-cols-[repeat(auto-fit,minmax(288px,1fr))] justify-center gap-6">
            {items.map((space) => (
              <div key={space.id} className="flex w-full justify-center p-2">
                <SpaceCard
                  id={Number(space.id)}
                  name={space.name}
                  capacity={Number(space.capacity)}
                  description={space.description}
                  resources={space.resources.map((item) => ({ id: Number(item.id), name: item.name }))}
                  subjects={space.subjects.map((item) => ({ id: Number(item.id), name: item.name }))}
                  locked={space.locked}
                  onReserve={() =>
                    reserveDialog.open({
                      id: Number(space.id),
                      name: space.name,
                      capacity: Number(space.capacity),
                      subjects: space.subjects.map((item) => ({ id: Number(item.id), name: item.name })),
                      locked: space.locked,
                    })
                  }
                />
              </div>
            ))}
          </div>
        </QueryBoundary>
        <PaginationControls
          page={pagination.page}
          hasNext={hasNext}
          isFetching={spaces.isFetching}
          onPageChange={pagination.setPage}
        />
      </section>
    </>
  );
}
