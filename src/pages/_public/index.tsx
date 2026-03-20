import type { Spaces } from "@types";
import { useQuery } from "@tanstack/react-query";
import { useCallback, useState } from "react";
import LabSearchbar, {
    type SpaceSearchFilters,
} from "@/components/reserve-searchbar";
import { createFileRoute } from "@tanstack/react-router";
import ClassroomCard from "@/components/space-card";
import useDebounce from "@/hooks/useDebounce";
import ReservePopup from "@/components/reserve-popup";

export const Route = createFileRoute("/_public/")({
    component: RouteComponent,
});

async function getSpaces(filters?: SpaceSearchFilters) {
    const params = new URLSearchParams();
    if (filters) {
        if (filters.query) params.set("name", filters.query);
        if (typeof filters.minCapacity === "number")
            params.set("capacity", String(filters.minCapacity));
        if (filters.resources && filters.resources.length > 0)
            params.set("resources", filters.resources.join(","));
    }
    
    const qs = params.toString();
    const url = qs.length > 0 ? `/api/spaces?${qs}` : "/api/spaces";

    const res = await fetch(url);
    const contentType = res.headers.get("content-type") ?? "";
    if (!res.ok) {
        throw new Error(`HTTP ${res.status} ao buscar ${url}`);
    }
    if (!contentType.includes("application/json")) {
        const text = await res.text();
        throw new Error(`Resposta não-JSON em ${url}: ${text.slice(0, 120)}`);
    }
    return (await res.json()) as Spaces[];
}

function RouteComponent() {
    //const [queryFilters, setQueryFilters] = useState<LabSearchFilters>();
    const [, setQueryFilters, debouncedQueryFilters] = useDebounce<SpaceSearchFilters>({
        query: "",
        resources: [],
        minCapacity: 20,
        maxResults: 0
    }, 300);
    
    const [isReserveOpen, setIsReserveOpen] = useState(false);
    const [spaceName, setSpaceName] = useState("");
    const [spaceCapacity, setSpaceCapacity] = useState(0);
    const [spaceResources, setSpaceResources] = useState<string[]>([]);

    const spacesQuery = useQuery({
        queryKey: ["spaces", debouncedQueryFilters],
        queryFn: () => getSpaces(debouncedQueryFilters),
    });

    const onSearch = useCallback((query: SpaceSearchFilters) => {
        setQueryFilters(query);
    }, [setQueryFilters]);

    const onReserve = useCallback((name: string, capacity: number, resources: string[]) => {
        setIsReserveOpen(true);
        setSpaceName(name);
        setSpaceCapacity(capacity);
        setSpaceResources(resources);
    }, []);

    return (
        <>
            <ReservePopup isOpen={isReserveOpen} onClose={() => setIsReserveOpen(false)} spaceName={spaceName} capacity={spaceCapacity} resources={spaceResources} />
            
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
                            {spacesQuery.data ? spacesQuery.data.length : 0} resultados encontrados
                        </span>
                    </header>

                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        {spacesQuery.isLoading && <div>Loading...</div>}
                        {spacesQuery.error && <div>Error: {spacesQuery.error.message}</div>}
                        {spacesQuery.data && spacesQuery.data.length > 0 &&
                            spacesQuery.data.map((space) => (
                                <ClassroomCard
                                    key={space.name}
                                    name={space.name}
                                    capacity={space.capacity}
                                    resources={space.resources}
                                    onReserve={onReserve}
                                />
                            ))
                        }
                    </div>
                </div>
            </section>
        </>
    );
}
/*



*/