import { useQuery } from "@tanstack/react-query";
import { useDebounce } from "ahooks";
import { addDays, addYears, endOfYear, format, startOfToday, startOfTomorrow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { CalendarIcon, Filter, SearchIcon, Users } from "lucide-react";
import { useEffect, useState } from "react";
import type { DateRange } from "react-day-picker";
import { ApiError } from "#/lib/types/error-types";
import { useApi } from "#/lib/utils/restapi";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/components/ui/input-group";
import { Button } from "../ui/button";
import { Calendar } from "../ui/calendar";
import {
  Combobox,
  ComboboxChip,
  ComboboxChips,
  ComboboxChipsInput,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxItem,
  ComboboxList,
  ComboboxValue,
} from "../ui/combobox";
import { Field, FieldLabel } from "../ui/field";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";

//capacity constraints
const min = 10;
const max = 300;
const steps = 10;

export type ResourceItem = {
  name: string;
  description: string;
};

export type SpaceSearchFilters = {
  searchQuery: string;
  minimumCapacity: number;
  resources: number[];
  subjects: number[];
};

type SpaceSearchBarProps = {
  onSearch: (filters: SpaceSearchFilters) => void;
};

const api = useApi();

function resourceQuery(name: string, enabled: boolean = true) {
  const debouncedName = useDebounce(name, { wait: 500 });

  const query = useQuery({
    queryKey: ["resource-data", debouncedName],
    queryFn: async () => {
      const res = await api.GET("/resource", {
        params: {
          query: {
            SearchQuery: debouncedName,
            Limit: 20,
            CanReserve: false,
            Enabled: true,
          },
        },
      });

      const { response, data, error } = res;

      if (!response.ok && error) {
        throw new ApiError(error.message || "Erro desconhecido", response.status, error.logout);
      }

      if (!data) {
        throw new ApiError("Erro ao buscar recursos.", response.status, error?.logout ?? false);
      }

      return data;
    },
    enabled,
  });

  return query;
}

function subjectQuery(name: string, enabled: boolean) {
  const debouncedName = useDebounce(name, { wait: 500 });

  const query = useQuery({
    queryKey: ["subject-data", debouncedName],
    queryFn: async () => {
      const res = await api.GET("/subject", {
        params: {
          query: {
            Name: debouncedName,
            Limit: 20,
            IsActive: true,
          },
        },
      });

      const { response, data, error } = res;

      if (!response.ok && error) {
        throw new ApiError("Erro ao buscar recursos.", response.status, error?.logout ?? false);
      }

      if (!data) {
        throw new ApiError("Erro ao buscar recursos.", response.status, error?.logout ?? false);
      }

      return data;
    },
    enabled,
  });

  return query;
}

function scheduleQuery(startFrom: string, endAt: string, enabled: boolean) {
  const debouncedStart = useDebounce(startFrom, { wait: 500 });
  const debouncedEnd = useDebounce(endAt, { wait: 500 });

  const query = useQuery({
    queryKey: ["schedule-data", debouncedStart, debouncedEnd],
    queryFn: async () => {
      const res = await api.GET("/subject");

      const { response, data, error } = res;

      if (!response.ok && error) {
        throw new ApiError("Erro ao buscar recursos.", response.status, error?.logout ?? false);
      }

      if (!data) {
        throw new ApiError("Erro ao buscar recursos.", response.status, error?.logout ?? false);
      }

      return data;
    },
    enabled,
  });

  return query;
}

export function SpaceSearchBar({ onSearch }: SpaceSearchBarProps) {
  // Recursos
  const [resourceName, setResourceName] = useState<string>("");
  const {
    data: resourceData,
    isLoading: isResourceLoading,
    isError: isResourceError,
    error: resourceError,
  } = resourceQuery(resourceName, true);

  const [resourceMap, setResourceMap] = useState<Map<number, ResourceItem>>(new Map());

  useEffect(() => {
    if (resourceData) {
      setResourceMap((prev) => {
        const next = new Map(prev);
        Object.values(resourceData).forEach((item) => {
          next.set(Number(item.id), { name: item.name, description: item.description });
        });
        return next;
      });
    }
  }, [resourceData]);

  const isResourceFirstLoading = isResourceLoading && !resourceData;
  const isResourceCriticalError = isResourceError && (resourceError as ApiError).logout;
  const resourceList = Object.values(resourceData ?? {});

  // Subjects
  const [subjectName, setSubjectName] = useState<string>("");
  const {
    data: subjectData,
    isLoading: isSubjectLoading,
    isError: isSubjectError,
    error: subjectError,
  } = subjectQuery(subjectName, true);

  const isSubjectFirstLoading = isSubjectLoading && !subjectData;
  const isSubjectCriticalError = isSubjectError && (subjectError as ApiError).logout;
  const subjectList = Object.values(subjectData ?? {});

  const [subjectMap, setSubjectMap] = useState<Map<number, string>>(new Map());

  useEffect(() => {
    if (subjectData) {
      setSubjectMap((prev) => {
        const next = new Map(prev);
        Object.values(subjectData).forEach((item) => {
          next.set(Number(item.id), item.name);
        });
        return next;
      });
    }
  }, [subjectData]);

  // Calendario
  const tomorrow = startOfTomorrow();
  const maxDate = endOfYear(addYears(new Date(), 1));

  // Pesquisa
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [minimumCapacity, setMinimumCapacity] = useState(20);
  const [selectedResource, setSelectedResource] = useState<number[]>([]);
  const availableResourceIds = Array.from(new Set([...selectedResource, ...resourceList.map((r) => Number(r.id))]));
  const [selectedSubject, setSelectedSubject] = useState<number[]>([]);
  const availableSubjectIds = Array.from(new Set([...selectedSubject, ...subjectList.map((r) => Number(r.id))]));
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: tomorrow,
    to: addDays(tomorrow, 30),
  });

  const currentFilters: SpaceSearchFilters = {
    searchQuery,
    resources: selectedResource,
    subjects: selectedSubject,
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
          <FieldLabel className="text-sm font-semibold text-neutral-800 dark:text-neutral-200" htmlFor="search-spaces">
            Pesquisar
          </FieldLabel>
          <InputGroup className="h-10">
            <InputGroupInput
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              id="search-spaces"
              placeholder="Buscar por nome ou descrição..."
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
          <InputGroup className="h-10">
            <InputGroupInput
              value={minimumCapacity}
              onChange={(e) => setMinimumCapacity(Number(e.target.value))}
              id="search-spaces"
              className="text-sm"
              type="number"
              min={min}
              max={max}
              step={steps}
            />
            <InputGroupAddon align="inline-start">
              <Users className="size-4 text-muted-foreground" />
            </InputGroupAddon>
          </InputGroup>
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
            {/* Recursos */}
            <Field className="w-full">
              <FieldLabel
                className="text-sm font-semibold text-neutral-800 dark:text-neutral-200"
                htmlFor="equipment-select"
              >
                Equipamentos
              </FieldLabel>
              <Combobox
                multiple
                autoHighlight
                items={availableResourceIds}
                value={selectedResource}
                onValueChange={(values: number[]) => {
                  setSelectedResource(values);
                  setResourceName("");
                }}
                inputValue={resourceName}
                onInputValueChange={setResourceName}
                itemToStringLabel={(id: number) =>
                  resourceMap.get(id) ? `${resourceMap.get(id)?.name} ${resourceMap.get(id)?.description}` : String(id)
                }
                disabled={isResourceCriticalError}
              >
                <ComboboxChips className="w-full">
                  <ComboboxValue>
                    {selectedResource.map((id) => (
                      <ComboboxChip key={id}>{resourceMap.get(id)?.name ?? "Sem nome"}</ComboboxChip>
                    ))}
                  </ComboboxValue>
                  <ComboboxChipsInput
                    placeholder={
                      isResourceCriticalError
                        ? "Erro ao carregar equipamentos"
                        : isResourceFirstLoading
                          ? "Carregando equipamentos..."
                          : selectedResource.length > 0
                            ? ""
                            : "Selecione equipamentos..."
                    }
                    disabled={isResourceCriticalError}
                  />
                </ComboboxChips>
                <ComboboxContent>
                  <ComboboxEmpty>
                    {isResourceFirstLoading ? "Carregando..." : "Nenhum equipamento encontrado."}
                  </ComboboxEmpty>
                  <ComboboxList className={"w-full"}>
                    {(id: number) => (
                      <ComboboxItem key={id} value={id}>
                        {resourceMap.get(id)?.name ?? id}
                      </ComboboxItem>
                    )}
                  </ComboboxList>
                </ComboboxContent>
              </Combobox>
            </Field>

            {/* Disciplinas */}
            <Field className="w-full">
              <FieldLabel
                className="text-sm font-semibold text-neutral-800 dark:text-neutral-200"
                htmlFor="equipment-select"
              >
                Disciplinas
              </FieldLabel>
              <Combobox
                multiple
                autoHighlight
                items={availableSubjectIds}
                value={selectedSubject}
                onValueChange={(values: number[]) => {
                  setSelectedSubject(values);
                  setSubjectName("");
                }}
                inputValue={subjectName}
                onInputValueChange={setSubjectName}
                itemToStringLabel={(id: number) => subjectMap.get(id) ?? String(id)}
                disabled={isSubjectCriticalError}
              >
                <ComboboxChips className="w-full">
                  <ComboboxValue>
                    {selectedSubject.map((id) => (
                      <ComboboxChip key={id}>{subjectMap.get(id) ?? "Sem nome"}</ComboboxChip>
                    ))}
                  </ComboboxValue>
                  <ComboboxChipsInput
                    placeholder={
                      isSubjectCriticalError
                        ? "Erro ao carregar disciplinas"
                        : isSubjectFirstLoading
                          ? "Carregando disciplinas..."
                          : selectedSubject.length > 0
                            ? ""
                            : "Selecione disciplinas..."
                    }
                    disabled={isSubjectCriticalError}
                  />
                </ComboboxChips>
                <ComboboxContent>
                  <ComboboxEmpty>
                    {isSubjectFirstLoading ? "Carregando..." : "Nenhuma disciplina encontrada."}
                  </ComboboxEmpty>
                  <ComboboxList>
                    {(id: number) => (
                      <ComboboxItem key={id} value={id}>
                        {subjectMap.get(id) ?? id}
                      </ComboboxItem>
                    )}
                  </ComboboxList>
                </ComboboxContent>
              </Combobox>
            </Field>

            {/* Data de inicio e termino */}
            <Field className="w-full">
              <FieldLabel
                htmlFor="date-picker-range"
                className="text-sm font-semibold text-neutral-800 dark:text-neutral-200"
              >
                Período
              </FieldLabel>
              <Popover>
                <PopoverTrigger
                  render={
                    <Button variant="outline" id="date-picker-range" className="justify-start px-2.5 font-normal">
                      <CalendarIcon data-icon="inline-start" />
                      {dateRange?.from ? (
                        dateRange.to ? (
                          <>
                            {format(dateRange.from, "dd 'de' MMM, yyyy", { locale: ptBR })} -{" "}
                            {format(dateRange.to, "dd 'de' MMM, yyyy", { locale: ptBR })}
                          </>
                        ) : (
                          format(dateRange.from, "dd 'de' MMM, yyyy", { locale: ptBR })
                        )
                      ) : (
                        <span>Selecione uma data</span>
                      )}
                    </Button>
                  }
                />
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="range"
                    locale={ptBR}
                    defaultMonth={dateRange?.from}
                    selected={dateRange}
                    onSelect={setDateRange}
                    numberOfMonths={2}
                    disabled={[{ before: tomorrow }, { after: maxDate }]}
                    startMonth={startOfToday()}
                    endMonth={maxDate}
                    className="rounded-lg border"
                  />
                </PopoverContent>
              </Popover>
            </Field>
          </CollapsibleContent>
        </Collapsible>
      </div>
    </div>
  );
}
