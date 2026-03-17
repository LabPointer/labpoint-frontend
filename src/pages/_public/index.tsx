import { type Spaces } from "@types";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useState, useRef } from "react";
import LabSearchbar, {
    type LabSearchFilters,
} from "@/components/reserve-searchbar";
import { createFileRoute } from "@tanstack/react-router";
import ClassroomCard from "@/components/classroom";
import ReservePopup from "@/components/reserve-popup";

export const Route = createFileRoute("/_public/")({
    component: RouteComponent,
});

async function getSpaces() {
    const res = await fetch("/api/spaces");
    const contentType = res.headers.get("content-type") ?? "";
    if (!res.ok) {
        throw new Error(`HTTP ${res.status} ao buscar /api/spaces`);
    }
    if (!contentType.includes("application/json")) {
        const text = await res.text();
        throw new Error(`Resposta não-JSON em /api/spaces: ${text.slice(0, 120)}`);
    }
    return (await res.json()) as Spaces[];
}

function RouteComponent() {
    const { data, isLoading, error, refetch } = useQuery({
        queryKey: ["spaces"],
        queryFn: getSpaces,
    });

    const [queryFilters, setQueryFilters] = useState<LabSearchFilters>();

    function onSearch(data: LabSearchFilters) {
        setQueryFilters(data);
        refetch();
    }
    // Aplica os filtros de busca nos dados retornados pela query
    const filteredSpaces = data
        ? data
              .filter((room) => {
                  const filters = queryFilters;
                  if (!filters) return true;

                  // Filtro de busca por nome/termo
                  const matchesQuery =
                      !filters.query ||
                      room.name.toLowerCase().includes(filters.query.toLowerCase());

                  // Filtro de capacidade mínima
                  const matchesCapacity =
                      typeof filters.minCapacity === "number"
                          ? room.capacity >= filters.minCapacity
                          : true;

                  // Filtro de recursos (todos os recursos selecionados devem estar presentes)
                  const hasContent =
                      !filters.resources || filters.resources.length === 0
                          ? true
                          : filters.resources.every((res) =>
                                room.resources?.includes(res),
                            );

                  return matchesQuery && matchesCapacity && hasContent;
              })
              .slice(
                  0,
                  queryFilters?.maxResults && queryFilters.maxResults > 0
                      ? queryFilters.maxResults
                      : undefined,
              )
        : [];

    return (
        <>
            <section className="mt-[81px] flex items-center justify-center px-4 pb-4 pt-6 md:px-8 md:pb-8">
                <LabSearchbar onSearch={onSearch} />
            </section>

            <section className="min-h-[calc(80vh-81px)] px-4 pb-12 md:px-8">
                <div className="mx-auto flex w-full max-w-5xl flex-col gap-4">
                    <header className="flex flex-col justify-between gap-2 md:flex-row md:items-center">
                        <div className="flex flex-col gap-1">
                            <h2 className="text-lg font-semibold text-neutral-900 md:text-xl">
                                Laboratórios &amp; Salas de Aula Disponíveis
                            </h2>
                            <p className="text-sm text-neutral-500">
                                Navegue pelos espaços que correspondem aos seus
                                critérios de pesquisa.
                            </p>
                        </div>
                        <span className="text-sm font-medium text-neutral-500">
                            {filteredSpaces ? filteredSpaces.length : 0} resultados encontrados
                        </span>
                    </header>

                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        {isLoading && <div>Loading...</div>}
                        {error && <div>Error: {error.message}</div>}
                        {filteredSpaces &&
                            filteredSpaces.map((space) => (
                                <ClassroomCard
                                    key={space.id}
                                    name={space.name}
                                    capacity={space.capacity}
                                    resources={space.resources}
                                />
                            ))}
                    </div>
                </div>
            </section>
        </>
    );
}
