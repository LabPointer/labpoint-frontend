import { useEffect, useMemo, useState } from "react";
import { useDebouncedValue } from "#/hooks/use-debounced-value";
import { ResourceMultiSelect, SubjectMultiSelect } from "@/components/shared/entity-selects";
import { type FilterOption, FilterSelect } from "@/components/shared/FilterSelect";
import type { RemoteOption } from "@/components/shared/RemoteCombobox";
import { SearchPanel, SearchTextField } from "@/components/shared/SearchPanel";

export type SpaceFilters = {
  search: string;
  subjectIds: number[];
  resourceIds: number[];
  /** `true` = bloqueado (inativo), `false` = liberado (ativo), `undefined` = todos */
  locked: boolean | undefined;
};

const statusOptions: FilterOption<boolean | undefined>[] = [
  { label: "Todos os status", value: undefined },
  { label: "Ativo", value: false },
  { label: "Inativo", value: true },
];

type ManageSpaceSearchBarProps = {
  onSearch: (filters: SpaceFilters) => void;
};

export function ManageSpaceSearchBar({ onSearch }: ManageSpaceSearchBarProps) {
  const [search, setSearch] = useState("");
  const [subjects, setSubjects] = useState<RemoteOption[]>([]);
  const [resources, setResources] = useState<RemoteOption[]>([]);
  const [locked, setLocked] = useState<boolean | undefined>(undefined);

  const filters = useMemo<SpaceFilters>(
    () => ({
      search,
      subjectIds: subjects.map((subject) => subject.id),
      resourceIds: resources.map((resource) => resource.id),
      locked,
    }),
    [search, subjects, resources, locked],
  );
  const debouncedFilters = useDebouncedValue(filters, 500);

  useEffect(() => {
    onSearch(debouncedFilters);
  }, [debouncedFilters, onSearch]);

  return (
    <SearchPanel>
      <SearchTextField
        id="space-search"
        placeholder="Buscar por nome ou descrição..."
        value={search}
        onValueChange={setSearch}
      />

      <div className="grid gap-4 md:grid-cols-3">
        <SubjectMultiSelect id="space-subjects" label="Matérias" value={subjects} onValueChange={setSubjects} />
        <ResourceMultiSelect id="space-resources" label="Recursos" value={resources} onValueChange={setResources} />
        <FilterSelect
          id="space-status"
          label="Status"
          options={statusOptions}
          value={locked}
          onValueChange={setLocked}
        />
      </div>
    </SearchPanel>
  );
}
