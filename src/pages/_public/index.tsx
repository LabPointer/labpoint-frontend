import type { Spaces } from "@types";
import { useQuery } from "@tanstack/react-query";
import { useCallback, useState } from "react";
import LabSearchbar, {
    type SpaceSearchFilters,
} from "@/components/reserve-searchbar";
import { createFileRoute } from "@tanstack/react-router";
import ClassroomCard from "@/components/space-card";
import useDebounce from "@/hooks/useDebounce";
import { ReserveForm } from "@components/reserve-form";
import { Loader2, AlertCircle, SearchX } from "lucide-react";

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
    if (!contentType.includes("application/json")) {
        const text = await res.text();
        throw new Error(`Resposta não-JSON em ${url}: ${text.slice(0, 120)}`);
    }

    const result = await res.json();

    if (!res.ok || result.status === "error") {
        throw new Error(result.message || `Erro HTTP ${res.status} ao realizar a busca`);
    }

    return result.data as Spaces[];
}

function RouteComponent() {
    //const [queryFilters, setQueryFilters] = useState<LabSearchFilters>();
    const [, setQueryFilters, debouncedQueryFilters] = useDebounce<SpaceSearchFilters>({
        query: "",
        resources: [],
        minCapacity: 20
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
            <ReserveForm 
                open={isReserveOpen} 
                onOpenChange={setIsReserveOpen} 
                spaceName={spaceName} 
                capacity={spaceCapacity} 
                resources={spaceResources.join(", ")} 
            />
            
            <section className="flex items-center justify-center ">
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
                        {spacesQuery.isLoading || spacesQuery.isFetching ? (
                            <div className="col-span-full flex flex-col items-center justify-center py-20 gap-4 text-muted-foreground">
                                <Loader2 className="w-10 h-10 animate-spin text-primary" />
                                <p className="text-sm font-medium">Buscando laboratórios disponíveis...</p>
                            </div>
                        ) : spacesQuery.error ? (
                            <div className="col-span-full flex flex-col items-center justify-center py-12 px-4 gap-3 bg-red-50 border border-red-200 rounded-xl text-red-600 shadow-sm">
                                <AlertCircle className="w-12 h-12 opacity-80 mb-1" />
                                <div className="text-center">
                                    <h3 className="font-semibold text-lg">Erro ao carregar dados</h3>
                                    <p className="text-sm opacity-90">{spacesQuery.error.message}</p>
                                </div>
                            </div>
                        ) : spacesQuery.data && spacesQuery.data.length === 0 ? (
                            <div className="col-span-full flex flex-col items-center justify-center py-16 px-4 gap-3 bg-muted/10 border border-black/10 rounded-xl text-muted-foreground shadow-sm">
                                <SearchX className="w-12 h-12 opacity-40 mb-2" />
                                <div className="text-center">
                                    <h3 className="font-semibold text-foreground text-lg">Nenhum resultado encontrado</h3>
                                    <p className="text-sm">Tente ajustar seus filtros de pesquisa para encontrar mais opções.</p>
                                </div>
                            </div>
                        ) : (
                            spacesQuery.data?.map((space) => (
                                <ClassroomCard
                                    key={space.name}
                                    name={space.name}
                                    capacity={space.capacity}
                                    resources={space.resources}
                                    onReserve={onReserve}
                                />
                            ))
                        )}
                    </div>
                </div>
            </section>
        </>
    );
}
/*



*/