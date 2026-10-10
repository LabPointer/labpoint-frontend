import { PlusIcon } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useDebouncedValue } from "#/hooks/use-debounced-value";
import { type FilterOption, FilterSelect } from "@/components/shared/FilterSelect";
import { SearchPanel, SearchTextField } from "@/components/shared/SearchPanel";
import { Button } from "@/components/ui/button";

export type SubjectFilters = {
  search: string;
  status: boolean | undefined;
};

const statusOptions: FilterOption<boolean | undefined>[] = [
  { label: "Todos os status", value: undefined },
  { label: "Ativo", value: true },
  { label: "Inativo", value: false },
];

type ManageSubjectSearchBarProps = {
  onSearch: (filters: SubjectFilters) => void;
  onAddNewSubject: () => void;
};

export function ManageSubjectSearchBar({ onSearch, onAddNewSubject }: ManageSubjectSearchBarProps) {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<boolean | undefined>(undefined);

  const filters = useMemo<SubjectFilters>(() => ({ search, status }), [search, status]);
  const debouncedFilters = useDebouncedValue(filters, 500);

  useEffect(() => {
    onSearch(debouncedFilters);
  }, [debouncedFilters, onSearch]);

  return (
    <SearchPanel>
      <SearchTextField id="subject-search" placeholder="Buscar por nome..." value={search} onValueChange={setSearch} />
      <FilterSelect
        id="subject-status"
        label="Status"
        options={statusOptions}
        value={status}
        onValueChange={setStatus}
        className="w-full"
      />
      <Button className="w-full shrink-0 lg:w-auto" type="button" onClick={onAddNewSubject}>
        <PlusIcon />
        Adicionar matéria
      </Button>
    </SearchPanel>
  );
}
