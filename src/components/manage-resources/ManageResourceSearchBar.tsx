import { PlusIcon } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useDebouncedValue } from "#/hooks/use-debounced-value";
import { DEFAULT_PAGE_LIMIT } from "#/lib/utils/pagination";
import { type FilterOption, FilterSelect } from "@/components/shared/FilterSelect";
import { PageLimitSelect } from "@/components/shared/PageLimitSelect";
import { SearchPanel, SearchTextField } from "@/components/shared/SearchPanel";
import { Button } from "@/components/ui/button";

export type ResourceFilters = {
  search: string;
  enabled: boolean | undefined;
  /** itens por página */
  limit: number;
};

const statusOptions: FilterOption<boolean | undefined>[] = [
  { label: "Todos os status", value: undefined },
  { label: "Ativo", value: true },
  { label: "Inativo", value: false },
];

type ManageResourceSearchBarProps = {
  onSearch: (filters: ResourceFilters) => void;
  onAddNewResource: () => void;
};

export function ManageResourceSearchBar({ onSearch, onAddNewResource }: ManageResourceSearchBarProps) {
  const [search, setSearch] = useState("");
  const [enabled, setEnabled] = useState<boolean | undefined>(undefined);
  const [limit, setLimit] = useState(DEFAULT_PAGE_LIMIT);

  const filters = useMemo<ResourceFilters>(
    () => ({ search, enabled, limit }),
    [search, enabled, limit],
  );
  const debouncedFilters = useDebouncedValue(filters, 500);

  useEffect(() => {
    onSearch(debouncedFilters);
  }, [debouncedFilters, onSearch]);

  return (
    <SearchPanel>
      <div className="flex flex-wrap items-end gap-4">
        <SearchTextField
          id="resource-search"
          placeholder="Buscar por nome..."
          value={search}
          onValueChange={setSearch}
        />
        <PageLimitSelect id="resource-limit" value={limit} onValueChange={setLimit} className="w-full sm:w-40" />
      </div>
      <FilterSelect
        id="resource-status"
        label="Status"
        options={statusOptions}
        value={enabled}
        onValueChange={setEnabled}
        className="w-full"
      />
      <Button className="w-full shrink-0 lg:w-auto" type="button" onClick={onAddNewResource}>
        <PlusIcon />
        Adicionar recurso
      </Button>
    </SearchPanel>
  );
}
