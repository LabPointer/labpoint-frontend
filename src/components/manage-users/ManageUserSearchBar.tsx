import { useEffect, useMemo, useState } from "react";
import { useDebouncedValue } from "#/hooks/use-debounced-value";
import { ROLE_LABELS } from "#/lib/queries/accounts";
import { DEFAULT_PAGE_LIMIT } from "#/lib/utils/pagination";
import { SubjectSelect } from "@/components/shared/entity-selects";
import { type FilterOption, FilterSelect } from "@/components/shared/FilterSelect";
import { PageLimitSelect } from "@/components/shared/PageLimitSelect";
import type { RemoteOption } from "@/components/shared/RemoteCombobox";
import { SearchPanel, SearchTextField } from "@/components/shared/SearchPanel";

export type UserFilters = {
  search: string;
  /** índice em ROLE_LABELS; `undefined` = qualquer cargo */
  role: number | undefined;
  /** `undefined` = qualquer matéria */
  subjectId: number | undefined;
  /** `undefined` = qualquer status */
  enabled: boolean | undefined;
  /** itens por página */
  limit: number;
};

const roleOptions: FilterOption<number | undefined>[] = [
  { label: "Qualquer cargo", value: undefined },
  ...ROLE_LABELS.map((label, index) => ({ label, value: index })),
];

const statusOptions: FilterOption<boolean | undefined>[] = [
  { label: "Qualquer status", value: undefined },
  { label: "Conta ativa", value: true },
  { label: "Conta inativa", value: false },
];

type ManageUserSearchBarProps = {
  onSearch: (filters: UserFilters) => void;
};

export function ManageUserSearchBar({ onSearch }: ManageUserSearchBarProps) {
  const [search, setSearch] = useState("");
  const [role, setRole] = useState<number | undefined>(undefined);
  const [subject, setSubject] = useState<RemoteOption | undefined>(undefined);
  const [enabled, setEnabled] = useState<boolean | undefined>(undefined);
  const [limit, setLimit] = useState(DEFAULT_PAGE_LIMIT);

  const filters = useMemo<UserFilters>(
    () => ({ search, role, subjectId: subject?.id, enabled, limit }),
    [search, role, subject?.id, enabled, limit],
  );
  const debouncedFilters = useDebouncedValue(filters, 500);

  useEffect(() => {
    onSearch(debouncedFilters);
  }, [debouncedFilters, onSearch]);

  return (
    <SearchPanel>
      <div className="flex flex-wrap items-end gap-4">
        <SearchTextField
          id="user-search"
          placeholder="Buscar por nome, matrícula ou e-mail..."
          value={search}
          onValueChange={setSearch}
        />
        <PageLimitSelect id="user-limit" value={limit} onValueChange={setLimit} className="w-full sm:w-40" />
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <FilterSelect id="user-role" label="Cargo" options={roleOptions} value={role} onValueChange={setRole} />
        <SubjectSelect
          id="user-subject"
          label="Matéria"
          anyLabel="Qualquer matéria"
          value={subject}
          onValueChange={setSubject}
        />
        <FilterSelect
          id="user-status"
          label="Status da conta"
          options={statusOptions}
          value={enabled}
          onValueChange={setEnabled}
        />
      </div>
    </SearchPanel>
  );
}
