import { useQuery } from "@tanstack/react-query";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { useApi } from "#/lib/utils/restapi";
import { SpaceCard } from "@/components/home/SpaceCard";
import { type SpaceProps, SpaceReserveModal } from "@/components/home/SpaceReserveModal";
import { SpaceSearchBar, type SpaceSearchFilters } from "@/components/home/SpaceSearchBar";
import { ApiError } from "#/lib/types/error-types";

const api = useApi();

function spaceQuery(props: SpaceSearchFilters) {
  const query = useQuery({
    queryKey: ["query-spaces", props],
    queryFn: async () => {
      const { searchQuery, resources, subjects, minimumCapacity, startDate, endDate, schedules } = props;
      const res = await api.GET("/space", {
        params: {
          query: {
            SearchQuery: searchQuery,
            StartDate: startDate.toISOString(),
            EndDate: endDate.toISOString(),
            Schedules: schedules,
            Resources: resources,
            Subjects: subjects,
            MinimumCapacity: minimumCapacity,
          },
        },
      });
      const { response, data, error } = res;

      if (!response.ok && error) {
        toast.error(`Error ${response.status}: ${error.message}`, {
          duration: 3000,
          position: "bottom-center",
          style: {
            color: "white",
            backgroundColor: "red",
            borderColor: "red",
          },
        });
        throw new ApiError(error.message, response.status);
      }

      return data;
    },
  });

  return query;
}

export const Route = createFileRoute("/_private/home")({
  component: RouteComponent,
});

function RouteComponent() {
  const navigate = useNavigate();

  const [queryFilters, setQueryFilters] = useState<SpaceSearchFilters>({
    searchQuery: "",
    resources: [],
    subjects: [],
    minimumCapacity: 20,
    startDate: new Date(),
    endDate: new Date(),
    schedules: [],
  });

  const {
    data: spaces,
    isLoading: isSpaceLoading,
    isError: isSpaceError,
    error: spaceError,
  } = spaceQuery(queryFilters);

  const [selectedSpace, setSelectedSpace] = useState<SpaceProps | null>(null);
  const [isReserveOpen, setIsReserveOpen] = useState(false);

  function handleSearch(filters: SpaceSearchFilters) {
    setQueryFilters(filters);
  }

  function handleReserveSpace(spaceProps: SpaceProps) {
    setSelectedSpace(spaceProps);
    setIsReserveOpen(true);
  }

  return (
    <>
      <section className="container mb-8">
        <SpaceSearchBar onSearch={(filters) => handleSearch(filters)} />
      </section>
      <section className="container mb-8">
        {selectedSpace && <SpaceReserveModal {...selectedSpace} open={isReserveOpen} onOpenChange={setIsReserveOpen} />}
      </section>
      <section className="container">
        <div className="flex flex-wrap justify-between items-center mb-6">
          <h2 className="text-xl font-bold">Laboratórios</h2>
          <span className="text-sm font-bold">Encontrados: {spaces?.length || 0}</span>
        </div>
        {isSpaceLoading ? (
          <div className="flex justify-center items-center h-64">
            <span className="text-sm font-semibold text-neutral-500 dark:text-neutral-400">Carregando...</span>
          </div>
        ) : isSpaceError ? (
          <div className="flex justify-center items-center h-64">
            <span className="text-sm font-semibold text-neutral-500 dark:text-neutral-400">
              Erro ao carregar os laboratórios.
            </span>
          </div>
        ) : spaces?.length === 0 ? (
          <div className="flex justify-center items-center h-64">
            <span className="text-sm font-semibold text-neutral-500 dark:text-neutral-400">
              Nenhum laboratório encontrado.
            </span>
          </div>
        ) : (
          <div className="w-full grid grid-cols-[repeat(auto-fit,minmax(288px,1fr))] justify-center gap-6">
            {spaces?.map((space) => (
              <div key={space.id} className="w-full flex justify-center p-2">
                <SpaceCard
                  id={Number(space.id)}
                  name={space.name}
                  capacity={Number(space.capacity)}
                  description={space.description}
                  resources={space.resources as { id: number; name: string }[]}
                  subjects={space.subjects as { id: number; name: string }[]}
                  locked={space.locked ?? false}
                  onReserve={() =>
                    handleReserveSpace({
                      id: space.id as number,
                      name: space.name,
                      capacity: space.capacity as number,
                      subjects: space.subjects,
                      locked: space.locked ?? false,
                    })
                  }
                />
              </div>
            ))}
          </div>
        )}
      </section>
    </>
  );
}
