import { createFileRoute } from "@tanstack/react-router";
import { format } from "date-fns";
import { useState } from "react";
import { useSpaces } from "#/lib/queries/spaces";
import { SpaceCard } from "@/components/home/SpaceCard";
import { type SpaceProps, SpaceReserveModal } from "@/components/home/SpaceReserveModal";
import { SpaceSearchBar, type SpaceSearchFilters } from "@/components/home/SpaceSearchBar";
import { QueryBoundary } from "@/components/shared/QueryBoundary";
import { ResultsHeader } from "@/components/shared/ResultsHeader";

export const Route = createFileRoute("/_private/home")({
  component: RouteComponent,
});

function RouteComponent() {
  // A barra de pesquisa emite os filtros iniciais na montagem; a query só roda depois disso.
  const [filters, setFilters] = useState<SpaceSearchFilters | null>(null);

  const spaces = useSpaces(
    {
      search: filters?.searchQuery,
      capacity: filters?.minimumCapacity,
      resources: filters?.resources,
      subjects: filters?.subjects,
      schedules: filters?.schedules,
      startAt: filters ? format(filters.startDate, "yyyy-MM-dd") : undefined,
      endAt: filters ? format(filters.endDate, "yyyy-MM-dd") : undefined,
    },
    { enabled: filters !== null },
  );

  const [selectedSpace, setSelectedSpace] = useState<SpaceProps | null>(null);
  const [isReserveOpen, setIsReserveOpen] = useState(false);

  function handleReserveSpace(spaceProps: SpaceProps) {
    setSelectedSpace(spaceProps);
    setIsReserveOpen(true);
  }

  return (
    <>
      <section className="container mb-8">
        <SpaceSearchBar onSearch={setFilters} />
      </section>
      {selectedSpace && <SpaceReserveModal {...selectedSpace} open={isReserveOpen} onOpenChange={setIsReserveOpen} />}
      <section className="container">
        <ResultsHeader title="Laboratórios" count={spaces.data?.length ?? 0} />
        <QueryBoundary
          isPending={spaces.isPending}
          isFetching={spaces.isFetching}
          isError={spaces.isError}
          error={spaces.error}
          isEmpty={spaces.data?.length === 0}
          loadingText="Carregando..."
          emptyText="Nenhum laboratório encontrado."
        >
          <div className="grid w-full grid-cols-[repeat(auto-fit,minmax(288px,1fr))] justify-center gap-6">
            {spaces.data?.map((space) => (
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
                    handleReserveSpace({
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
      </section>
    </>
  );
}
