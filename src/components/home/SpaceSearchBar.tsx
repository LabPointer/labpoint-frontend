import { useQuery } from "@tanstack/react-query";
import { useDebounce } from "ahooks";
import {
  CalendarIcon,
  ChevronDownIcon,
  Filter,
  FilterIcon,
  SearchIcon,
} from "lucide-react";
import React, { useEffect, useState } from "react";
import { useApi } from "#/lib/restapi";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Input } from "@/components/ui/input";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Field, FieldLabel } from "../ui/field";

const minCapacity = [20, 50, 100, 150] as const;

export type SpaceSearchFilters = {
  searchQuery: string;
  resources: number[];
  subjects: number[];
  minimumCapacity: (typeof minCapacity)[number];
};

type SpaceSearchBarProps = {
  onSearch?: (filters: SpaceSearchFilters) => void;
};

export function SpaceSearchBar({ onSearch }: SpaceSearchBarProps) {
  const api = useApi();
  const {
    data: globalData,
    isError,
    isLoading,
  } = useQuery({
    queryKey: ["global-data"],
    queryFn: async () => {
      const [resourcesRes, subjectsRes] = await Promise.all([
        api.GET("/resources/cache"),
        api.GET("/subjects/cache"),
      ]);

      const resourcesMap = new Map<number, string>();
      resourcesMap.set(-1, "Todos os recursos");
      resourcesRes.data?.map((item) => resourcesMap.set(item.id, item.name));

      const subjectsMap = new Map<number, string>();
      subjectsMap.set(-1, "Todas as disciplinas");
      subjectsRes.data?.map((item) => subjectsMap.set(item.id, item.name));

      return {
        resources: resourcesMap,
        subjects: subjectsMap,
      };
    },
  });

  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedResource, setSelectedResource] = useState<string>("-1");
  const [selectedSubject, setSelectedSubject] = useState<string>("-1");
  const [minimumCapacity, setMinimumCapacity] =
    useState<(typeof minCapacity)[number]>(20);

  const currentFilters: SpaceSearchFilters = {
    searchQuery,
    resources:
      selectedResource && Number(selectedResource) >= 0
        ? [Number(selectedResource)]
        : [],
    subjects:
      selectedSubject && Number(selectedSubject) >= 0
        ? [Number(selectedSubject)]
        : [],
    minimumCapacity,
  };

  const debouncedFilters = useDebounce(currentFilters, { wait: 1000 });

  useEffect(() => {
    if (onSearch) {
      onSearch(debouncedFilters);
    }
  }, [debouncedFilters]);

  return (
    <div className="bg-white dark:bg-white/5 rounded-md border dark:border-violet-500/10 shadow-md hover:shadow-lg p-4 dark:shadow-violet-300/15">
      <div className="flex flex-col gap-4">
        <Field className="w-full">
          <FieldLabel
            className="text-sm font-semibold text-neutral-800 dark:text-neutral-200"
            htmlFor="search-spaces"
          >
            Pesquisar
          </FieldLabel>
          <InputGroup className="h-10">
            <InputGroupInput
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              id="search-spaces"
              placeholder="Buscar por nome ou departamento..."
              className="text-sm"
            />
            <InputGroupAddon align="inline-start">
              <SearchIcon className="size-4 text-muted-foreground" />
            </InputGroupAddon>
          </InputGroup>
        </Field>

        <Field className="w-full">
          <FieldLabel
            className="text-sm font-semibold text-neutral-800 dark:text-neutral-200"
            htmlFor="capacity-select"
          >
            Capacidade minima
          </FieldLabel>
          <Select
            defaultValue={"20"}
            value={String(minimumCapacity)}
            onValueChange={(value) => {
              setMinimumCapacity(Number(value) as typeof minimumCapacity);
            }}
          >
            <SelectTrigger id="capacity-select" className="w-full h-10">
              <SelectValue placeholder="50 lugares..." />
            </SelectTrigger>
            <SelectContent>
              {minCapacity.map((val) => (
                <SelectItem key={`${val} lugares`} value={`${val}`}>
                  {val} lugares
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>
        {/*Filtros avançados*/}
        <Collapsible>
          <CollapsibleTrigger
            className={
              "w-full md:w-fit border dark:border-violet-300/20 hover:dark:border-violet-400/40 rounded-md p-2"
            }
          >
            <div className="flex items-center gap-x-2">
              <Filter className="size-4" />
              <span className="text-sm font-semibold">Filtros avançados</span>
            </div>
          </CollapsibleTrigger>
          <CollapsibleContent className={"flex flex-col gap-y-4 pt-3"}>
            <Field className="w-full">
              <FieldLabel
                className="text-sm font-semibold text-neutral-800 dark:text-neutral-200"
                htmlFor="equipment-select"
              >
                Equipamentos
              </FieldLabel>
              <Select
                defaultValue={"Todos os recursos"}
                value={selectedResource}
                onValueChange={(value) => setSelectedResource(value || "")}
                disabled={isLoading || isError}
              >
                <SelectTrigger id="equipment-select" className="w-full h-10">
                  <SelectValue
                    placeholder={
                      isLoading
                        ? "Carregando equipamentos..."
                        : isError
                          ? "Erro ao carregar equipamentos"
                          : "Todos equipamentos"
                    }
                  >
                    {(val: string | null) => {
                      if (!val) return null;
                      return globalData?.resources?.get(Number(val)) ?? val;
                    }}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {globalData?.resources &&
                    Array.from(globalData.resources.entries()).map(
                      ([id, name]) => (
                        <SelectItem key={id} value={String(id)}>
                          {name}
                        </SelectItem>
                      ),
                    )}
                </SelectContent>
              </Select>
            </Field>

            <Field className="w-full">
              <FieldLabel
                className="text-sm font-semibold text-neutral-800 dark:text-neutral-200"
                htmlFor="equipment-select"
              >
                Disciplinas
              </FieldLabel>
              <Select
                defaultValue={"Todas as disciplinas"}
                value={selectedSubject}
                onValueChange={(value) => setSelectedSubject(value || "")}
                disabled={isLoading || isError}
              >
                <SelectTrigger id="equipment-select" className="w-full h-10">
                  <SelectValue
                    placeholder={
                      isLoading
                        ? "Carregando disciplinas..."
                        : isError
                          ? "Erro ao carregar disciplinas"
                          : "Todas as disciplinas"
                    }
                  >
                    {(val: string | null) => {
                      if (!val) return null;
                      return globalData?.subjects?.get(Number(val)) ?? val;
                    }}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {globalData?.subjects &&
                    Array.from(globalData.subjects.entries()).map(
                      ([id, name]) => (
                        <SelectItem key={id} value={String(id)}>
                          {name}
                        </SelectItem>
                      ),
                    )}
                </SelectContent>
              </Select>
            </Field>
          </CollapsibleContent>
        </Collapsible>
      </div>
    </div>
  );
}
