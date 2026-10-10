import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useSpaces } from "#/lib/queries/spaces";
import { ManageSpaceCard } from "@/components/manage-spaces/ManageSpaceCard";
import { ManageSpaceSearchBar, type SpaceFilters } from "@/components/manage-spaces/ManageSpaceSearchBar";
import { QueryBoundary } from "@/components/shared/QueryBoundary";

export const Route = createFileRoute("/_private/admin/manage-spaces")({
  component: RouteComponent,
});

const initialFilters: SpaceFilters = { search: "", subjectIds: [], resourceIds: [], locked: undefined };

function RouteComponent() {
  const [filters, setFilters] = useState<SpaceFilters>(initialFilters);
  const spaces = useSpaces({
    search: filters.search,
    subjects: filters.subjectIds,
    resources: filters.resourceIds,
    locked: filters.locked,
  });

  const summary = useMemo(() => {
    const list = spaces.data ?? [];
    const inactive = list.filter((space) => space.locked).length;
    return { total: list.length, inactive, active: list.length - inactive };
  }, [spaces.data]);

  return (
    <>
      <section className="container mb-8">
        <ManageSpaceSearchBar onSearch={setFilters} />
      </section>

      <section className="container flex flex-col gap-8">
        <h2 className="text-sm font-bold">
          {summary.total} espaço(s) encontrado(s) · {summary.active} ativo(s) · {summary.inactive} inativo(s)
        </h2>
        <QueryBoundary
          isPending={spaces.isPending}
          isFetching={spaces.isFetching}
          isError={spaces.isError}
          error={spaces.error}
          isEmpty={spaces.data?.length === 0}
          loadingText="Carregando espaços..."
          emptyText="Nenhum espaço encontrado."
        >
          <div className="grid w-full grid-cols-[repeat(auto-fit,minmax(256px,1fr))] justify-center gap-6">
            {spaces.data?.map((space) => (
              <ManageSpaceCard key={space.id} space={space} />
            ))}
          </div>
        </QueryBoundary>
      </section>
    </>
  );
}
