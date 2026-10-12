import { PlusIcon } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useDebouncedValue } from "#/hooks/use-debounced-value";
import { DEFAULT_PAGE_LIMIT } from "#/lib/utils/pagination";
import { ResourceMultiSelect, SubjectMultiSelect } from "@/components/shared/entity-selects";
import { type FilterOption, FilterSelect } from "@/components/shared/FilterSelect";
import { PageLimitSelect } from "@/components/shared/PageLimitSelect";
import type { RemoteOption } from "@/components/shared/RemoteCombobox";
import { SearchPanel, SearchTextField } from "@/components/shared/SearchPanel";
import { Button } from "@/components/ui/button";

export type SpaceFilters = {
  search: string;
  subjectIds: number[];
  resourceIds: number[];
  /** `true` = bloqueado (inativo), `false` = liberado (ativo), `undefined` = todos */
  locked: boolean | undefined;
  /** itens por página */
  limit: number;
};

const statusOptions: FilterOption<boolean | undefined>[] = [
  { label: "Todos os status", value: undefined },
  { label: "Ativo", value: false },
  { label: "Inativo", value: true },
];

type ManageSpaceSearchBarProps = {
  onSearch: (filters: SpaceFilters) => void;
  onAddNewSpace: () => void;
};

export function ManageSpaceSearchBar({ onSearch, onAddNewSpace }: ManageSpaceSearchBarProps) {
  const [search, setSearch] = useState("");
  const [subjects, setSubjects] = useState<RemoteOption[]>([]);
  const [resources, setResources] = useState<RemoteOption[]>([]);
  const [locked, setLocked] = useState<boolean | undefined>(undefined);
  const [limit, setLimit] = useState(DEFAULT_PAGE_LIMIT);

  const filters = useMemo<SpaceFilters>(
    () => ({
      search,
      subjectIds: subjects.map((subject) => subject.id),
      resourceIds: resources.map((resource) => resource.id),
      locked,
      limit,
    }),
    [search, subjects, resources, locked, limit],
  );
  const debouncedFilters = useDebouncedValue(filters, 500);

  useEffect(() => {
    onSearch(debouncedFilters);
  }, [debouncedFilters, onSearch]);

  return (
    <SearchPanel>
      <div className="flex flex-wrap items-end gap-4">
        <SearchTextField
          id="space-search"
          placeholder="Buscar por nome ou descrição..."
          value={search}
          onValueChange={setSearch}
        />
        <PageLimitSelect id="space-limit" value={limit} onValueChange={setLimit} className="w-full sm:w-40" />
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <SubjectMultiSelect id="space-subjects" label="Matérias" value={subjects} onValueChange={setSubjects} />
        <ResourceMultiSelect
          id="space-resources"
          label="Recursos"
          canReserve={false}
          value={resources}
          onValueChange={setResources}
        />
        <FilterSelect
          id="space-status"
          label="Status"
          options={statusOptions}
          value={locked}
          onValueChange={setLocked}
        />
      </div>

      <Button className="w-full shrink-0 lg:w-auto" type="button" onClick={onAddNewSpace}>
        <PlusIcon />
        Adicionar espaço
      </Button>
    </SearchPanel>
  );
}
