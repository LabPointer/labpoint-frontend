import { useEffect, useMemo, useState } from "react";
import { useDebouncedValue } from "#/hooks/use-debounced-value";
import { ROLE_LABELS } from "#/lib/queries/accounts";
import { SubjectSelect } from "@/components/shared/entity-selects";
import { type FilterOption, FilterSelect } from "@/components/shared/FilterSelect";
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

  const filters = useMemo<UserFilters>(
    () => ({ search, role, subjectId: subject?.id, enabled }),
    [search, role, subject?.id, enabled],
  );
  const debouncedFilters = useDebouncedValue(filters, 500);

  useEffect(() => {
    onSearch(debouncedFilters);
  }, [debouncedFilters, onSearch]);

  return (
    <SearchPanel>
      <SearchTextField
        id="user-search"
        placeholder="Buscar por nome, matrícula ou e-mail..."
        value={search}
        onValueChange={setSearch}
      />

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
