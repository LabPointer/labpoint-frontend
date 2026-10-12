import { Filter, SearchIcon } from "lucide-react";
import { useEffect, useState } from "react";
import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
  ComboboxValue,
} from "@/components/ui/combobox";
import { Field, FieldLabel } from "@/components/ui/field";
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/components/ui/input-group";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "../ui/collapsible";
import { useDebounce } from "ahooks";
import { useQuery } from "@tanstack/react-query";
import { ApiError } from "#/lib/types/error-types";
import { useApi } from "#/lib/utils/restapi";

export type UserSearchFilters = {
  searchQuery: string;
  role: number | undefined;
  subjectId: number | undefined;
  status: boolean | undefined;
};

type ManageUserSearchBarProps = {
  onSearch?: (filters: UserSearchFilters) => void;
};

const roleRecord: Record<string, number | undefined> = {
  "Todos os cargos": undefined,
  User: 0,
  Admin: 1,
  Owner: 2,
};

const statusRecord: Record<string, boolean | undefined> = {
  "Todos os status": undefined,
  Ativo: true,
  Inativo: false,
};

const api = useApi();

function subjectQuery(name: string) {
  const debouncedName = useDebounce(name, { wait: 500 });

  const query = useQuery({
    queryKey: ["subject-data", debouncedName],
    queryFn: async () => {
      const res = await api.GET("/subject", {
        params: {
          query: {
            Name: debouncedName.length > 0 ? debouncedName : undefined,
            Offset: 0,
            Limit: 20,
            Enabled: true,
          },
        },
      });

      const { response, data, error } = res;

      if (!response.ok && error) {
        throw new ApiError("Erro ao buscar matérias.", response.status, error?.logout ?? false);
      }

      return data ?? [];
    },
  });

  return query;
}

export function ManageUserSearchBar({ onSearch }: ManageUserSearchBarProps = {}) {
  // Materias
  const [subjectName, setSubjectName] = useState<string>("");
  const {
    data: subjectData,
    isLoading: isSubjectLoading,
    isError: isSubjectError,
    error: subjectError,
  } = subjectQuery(subjectName);

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

  const [searchQuery, setSearchQuery] = useState<string>("");
  const roles = ["Todos os cargos", "Owner", "Admin", "User"];
  const [role, setRole] = useState(roles[0]);
  const statuses = ["Todos os status", "Ativo", "Inativo"];
  const [status, setStatus] = useState(statuses[0]);
  const [selectedSubject, setSelectedSubject] = useState<number | undefined>();
  const availableSubjectIds = Array.from(
    new Set([...(selectedSubject !== undefined ? [selectedSubject] : []), ...subjectList.map((r) => Number(r.id))]),
  );

  const debouncedSearchQuery = useDebounce<UserSearchFilters>(
    {
      searchQuery,
      role: roleRecord[role],
      subjectId: selectedSubject,
      status: statusRecord[status],
    },
    { wait: 500 },
  );

  useEffect(() => {
    if (onSearch) {
      onSearch(debouncedSearchQuery);
    }
  }, [
    debouncedSearchQuery.searchQuery,
    debouncedSearchQuery.role,
    debouncedSearchQuery.subjectId,
    debouncedSearchQuery.status,
  ]);

  return (
    <div className="flex flex-col gap-4 rounded-lg border bg-white p-4 shadow-md hover:shadow-lg dark:border-violet-500/10 dark:bg-white/5 dark:shadow-violet-300/15">
      <Field className="min-w-60 flex-1">
        <FieldLabel htmlFor="space-search">Pesquisar</FieldLabel>
        <InputGroup>
          <InputGroupInput
            id="space-search"
            placeholder="Buscar por nome, matricula ou email..."
            value={searchQuery}
            onInput={(e) => setSearchQuery(e.currentTarget.value)}
          />
          <InputGroupAddon align="inline-start">
            <SearchIcon className="text-muted-foreground" />
          </InputGroupAddon>
        </InputGroup>
      </Field>

      <Collapsible>
        <CollapsibleTrigger
          className={"w-full md:w-fit border dark:border-violet-300/20 hover:dark:border-violet-400/40 rounded-md p-2"}
        >
          <div className="flex items-center gap-x-2">
            <Filter className="size-4" />
            <span className="text-sm font-semibold">Filtros avançados</span>
          </div>
        </CollapsibleTrigger>
        <CollapsibleContent className={"flex flex-col gap-y-4 pt-3"}>
          <Field className="w-full min-w-40">
            <FieldLabel htmlFor="space-role">Cargo</FieldLabel>
            <Combobox items={roles} value={role} onValueChange={(value) => setRole(value ?? roles[0])}>
              <ComboboxInput
                id="space-role"
                aria-label="Filtrar por cargo"
                placeholder="Todos os cargos"
                className="w-full"
                showClear={false}
              />
              <ComboboxContent>
                <ComboboxEmpty>Nenhum cargo encontrado.</ComboboxEmpty>
                <ComboboxList>
                  {(item) => (
                    <ComboboxItem key={item} value={item}>
                      <ComboboxValue>{item}</ComboboxValue>
                    </ComboboxItem>
                  )}
                </ComboboxList>
              </ComboboxContent>
            </Combobox>
          </Field>

          <Field className="w-full min-w-40">
            <FieldLabel htmlFor="space-subject">Disciplina</FieldLabel>
            <Combobox
              items={availableSubjectIds}
              value={selectedSubject ?? null}
              onValueChange={(val: number | null) => {
                setSelectedSubject(val ?? undefined);
                setSubjectName("");
              }}
              inputValue={subjectName}
              onInputValueChange={setSubjectName}
              itemToStringLabel={(id: number) => subjectMap.get(id) ?? String(id)}
              disabled={isSubjectCriticalError}
            >
              <ComboboxInput
                id="space-subject"
                aria-label="Filtrar por disciplina"
                placeholder="Todas as disciplinas"
                className="w-full"
                showClear={true}
              />
              <ComboboxContent>
                <ComboboxEmpty>
                  {isSubjectFirstLoading ? "Carregando disciplinas..." : "Nenhuma matéria encontrada."}
                </ComboboxEmpty>
                <ComboboxList>
                  {(id: number) => (
                    <ComboboxItem key={id} value={id}>
                      <ComboboxValue>{subjectMap.get(id) ?? String(id)}</ComboboxValue>
                    </ComboboxItem>
                  )}
                </ComboboxList>
              </ComboboxContent>
            </Combobox>
          </Field>

          <Field className="w-full min-w-40">
            <FieldLabel htmlFor="space-status">Status</FieldLabel>
            <Combobox items={statuses} value={status} onValueChange={(value) => setStatus(value ?? statuses[0])}>
              <ComboboxInput
                id="space-status"
                aria-label="Filtrar por status"
                placeholder="Todos os status"
                className="w-full"
                showClear={false}
              />
              <ComboboxContent>
                <ComboboxEmpty>Nenhum status encontrado.</ComboboxEmpty>
                <ComboboxList>
                  {(item) => (
                    <ComboboxItem key={item} value={item}>
                      <ComboboxValue>{item}</ComboboxValue>
                    </ComboboxItem>
                  )}
                </ComboboxList>
              </ComboboxContent>
            </Combobox>
          </Field>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
}
