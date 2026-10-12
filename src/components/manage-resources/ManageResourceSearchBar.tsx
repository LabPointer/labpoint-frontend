import { PlusIcon } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useDebouncedValue } from "#/hooks/use-debounced-value";
import { type FilterOption, FilterSelect } from "@/components/shared/FilterSelect";
import { SearchPanel, SearchTextField } from "@/components/shared/SearchPanel";
import { Button } from "@/components/ui/button";

export type ResourceFilters = {
  search: string;
  canReserve: boolean | undefined;
  enabled: boolean | undefined;
};

const canReserveOptions: FilterOption<boolean | undefined>[] = [
  { label: "Todos", value: undefined },
  { label: "Sim", value: true },
  { label: "Não", value: false },
];

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
  const [canReserve, setCanReserve] = useState<boolean | undefined>(undefined);
  const [enabled, setEnabled] = useState<boolean | undefined>(undefined);

  const filters = useMemo<ResourceFilters>(() => ({ search, canReserve, enabled }), [search, canReserve, enabled]);
  const debouncedFilters = useDebouncedValue(filters, 500);

  useEffect(() => {
    onSearch(debouncedFilters);
  }, [debouncedFilters, onSearch]);

  return (
    <SearchPanel>
      <SearchTextField id="resource-search" placeholder="Buscar por nome..." value={search} onValueChange={setSearch} />
      <FilterSelect
        id="resource-can-reserve"
        label="Pode reservar"
        options={canReserveOptions}
        value={canReserve}
        onValueChange={setCanReserve}
        className="w-full"
      />
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
