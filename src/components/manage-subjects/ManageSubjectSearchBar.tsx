import { PlusIcon } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useDebouncedValue } from "#/hooks/use-debounced-value";
import { DEFAULT_PAGE_LIMIT } from "#/lib/utils/pagination";
import { type FilterOption, FilterSelect } from "@/components/shared/FilterSelect";
import { PageLimitSelect } from "@/components/shared/PageLimitSelect";
import { SearchPanel, SearchTextField } from "@/components/shared/SearchPanel";
import { Button } from "@/components/ui/button";

export type SubjectFilters = {
  search: string;
  status: boolean | undefined;
  /** itens por página */
  limit: number;
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
  const [limit, setLimit] = useState(DEFAULT_PAGE_LIMIT);

  const filters = useMemo<SubjectFilters>(() => ({ search, status, limit }), [search, status, limit]);
  const debouncedFilters = useDebouncedValue(filters, 500);

  useEffect(() => {
    onSearch(debouncedFilters);
  }, [debouncedFilters, onSearch]);

  return (
    <SearchPanel>
      <div className="flex flex-wrap items-end gap-4">
        <SearchTextField
          id="subject-search"
          placeholder="Buscar por nome..."
          value={search}
          onValueChange={setSearch}
        />
        <PageLimitSelect id="subject-limit" value={limit} onValueChange={setLimit} className="w-full sm:w-40" />
      </div>
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
