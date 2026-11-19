import { PlusIcon } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useDebouncedValue } from "#/hooks/use-debounced-value";
import { DEFAULT_PAGE_LIMIT } from "#/lib/utils/pagination";
import { type FilterOption, FilterSelect } from "@/components/shared/FilterSelect";
import { PageLimitSelect } from "@/components/shared/PageLimitSelect";
import { SearchPanel, SearchTextField } from "@/components/shared/SearchPanel";
import { Button } from "@/components/ui/button";

export type ResourceFilters = {
  /** nome ou descrição */
  search: string;
  enabled: boolean | undefined;
  reservable: boolean | undefined;
  /** itens por página */
  limit: number;
};

const statusOptions: FilterOption<boolean | undefined>[] = [
  { label: "Todos os status", value: undefined },
  { label: "Ativo", value: true },
  { label: "Inativo", value: false },
];

const typeOptions: FilterOption<boolean | undefined>[] = [
  { label: "Todos os tipos", value: undefined },
  { label: "Reservável", value: true },
  { label: "Fixo de espaço", value: false },
];

type ManageResourceSearchBarProps = {
  onSearch: (filters: ResourceFilters) => void;
  onAddNewResource: () => void;
};

export function ManageResourceSearchBar({ onSearch, onAddNewResource }: ManageResourceSearchBarProps) {
  const [search, setSearch] = useState("");
  const [enabled, setEnabled] = useState<boolean | undefined>(undefined);
  const [reservable, setReservable] = useState<boolean | undefined>(undefined);
  const [limit, setLimit] = useState(DEFAULT_PAGE_LIMIT);

  const filters = useMemo<ResourceFilters>(
    () => ({ search, enabled, reservable, limit }),
    [search, enabled, reservable, limit],
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
          placeholder="Buscar por nome ou descrição..."
          value={search}
          onValueChange={setSearch}
        />
        <PageLimitSelect id="resource-limit" value={limit} onValueChange={setLimit} className="w-full sm:w-40" />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <FilterSelect
          id="resource-status"
          label="Status"
          options={statusOptions}
          value={enabled}
          onValueChange={setEnabled}
          className="w-full"
        />
        <FilterSelect
          id="resource-type"
          label="Tipo"
          options={typeOptions}
          value={reservable}
          onValueChange={setReservable}
          className="w-full"
        />
      </div>
      <Button className="w-full shrink-0 lg:w-auto" type="button" onClick={onAddNewResource}>
        <PlusIcon />
        Adicionar recurso
      </Button>
    </SearchPanel>
  );
}
