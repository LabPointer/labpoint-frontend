import {
  createFileRoute,
  useNavigate,
  useRouteContext,
  useRouter,
} from "@tanstack/react-router";
import { SpaceCard } from "#/components/home/SpaceCard";
import {
  SpaceSearchBar,
  type SpaceSearchFilters,
} from "#/components/home/SpaceSearchBar";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useApi } from "#/lib/restapi";
import { toast } from "sonner";

export const Route = createFileRoute("/_private/home")({
  component: RouteComponent,
});

function RouteComponent() {
  const api = useApi();
  const router = useRouter();
  const navigate = useNavigate();

  const [queryFilters, setQueryFilters] = useState<SpaceSearchFilters>({
    searchQuery: "",
    resources: [],
    subjects: [],
    minimumCapacity: 20,
  });

  const {
    data: spaces,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["query-spaces", queryFilters],
    queryFn: async () => {
      const { searchQuery, resources, subjects, minimumCapacity } = queryFilters;
      const res = await api.GET("/spaces", {
        params: {
          query: {
            name: searchQuery,
            capacity: minimumCapacity,
            resources,
            subjects,
            locked: false,
          },
        },
      });
      if (res.response.status === 403) {
        await api.POST("/auth/sign-out");
        toast.error(
          "Sua sessão expirou, por favor faça login novamente.",
          {
            duration: 3000,
            onAutoClose: () => {
              navigate({ to: "/" });
            },
            position: "bottom-center",
            style: {
              color: "white",
              backgroundColor: "red",
              borderColor: "red",
            },
          },
        );
        return;
      }
      if (!res.data && res.response.status === 404) {
        return { spaces: [] };
      }
      if (!res.data && res.response.status !== 404) {
        throw new Error("Erro ao buscar laboratórios.");
      }
      return res.data;
    },
  });

  function handleSearch(filters: SpaceSearchFilters) {
    setQueryFilters(filters);
  }

  return (
    <>
      <section className="container mb-8">
        <SpaceSearchBar onSearch={(filters) => handleSearch(filters)} />
      </section>
      <section className="container">
        <div className="flex flex-wrap justify-between items-center mb-6">
          <h2 className="text-xl font-bold">Laboratórios</h2>
          <span className="text-sm font-bold">
            Encontrados: {spaces?.spaces.length || 0}
          </span>
        </div>
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <span className="text-sm font-semibold text-neutral-500 dark:text-neutral-400">
              Carregando...
            </span>
          </div>
        ) : isError ? (
          <div className="flex justify-center items-center h-64">
            <span className="text-sm font-semibold text-neutral-500 dark:text-neutral-400">
              Erro ao carregar os laboratórios.
            </span>
          </div>
        ) : spaces?.spaces.length === 0 ? (
          <div className="flex justify-center items-center h-64">
            <span className="text-sm font-semibold text-neutral-500 dark:text-neutral-400">
              Nenhum laboratório encontrado.
            </span>
          </div>
        ) : (
          <div className="w-full grid grid-cols-[repeat(auto-fit,minmax(288px,1fr))] justify-center gap-6">
            {spaces?.spaces.map((space) => (
              <div key={space.id} className="w-full flex justify-center p-2">
                <SpaceCard
                  id={space.id}
                  name={space.name}
                  capacity={space.capacity}
                  description={space.description}
                  resources={space.resources}
                  subjects={space.subjects}
                  locked={space.locked ?? false}
                />
              </div>
            ))}
          </div>
        )}
      </section>
    </>
  );
}
