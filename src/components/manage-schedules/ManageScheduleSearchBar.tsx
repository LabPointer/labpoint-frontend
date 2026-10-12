import { PlusIcon } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useDebouncedValue } from "#/hooks/use-debounced-value";
import { type FilterOption, FilterSelect } from "@/components/shared/FilterSelect";
import { SearchPanel } from "@/components/shared/SearchPanel";
import { Button } from "@/components/ui/button";

export type ScheduleFilters = {
  shift: number | undefined;
  enabled: boolean | undefined;
};

const shiftOptions: FilterOption<number | undefined>[] = [
  { label: "Todos os turnos", value: undefined },
  { label: "Manhã", value: 0 },
  { label: "Tarde", value: 1 },
  { label: "Noite", value: 2 },
];

const statusOptions: FilterOption<boolean | undefined>[] = [
  { label: "Todos os status", value: undefined },
  { label: "Ativo", value: true },
  { label: "Inativo", value: false },
];

type ManageScheduleSearchBarProps = {
  onSearch: (filters: ScheduleFilters) => void;
  onAddNewSchedule: () => void;
};

export function ManageScheduleSearchBar({ onSearch, onAddNewSchedule }: ManageScheduleSearchBarProps) {
  const [shift, setShift] = useState<number | undefined>(undefined);
  const [enabled, setEnabled] = useState<boolean | undefined>(undefined);

  const filters = useMemo<ScheduleFilters>(() => ({ shift, enabled }), [shift, enabled]);
  const debouncedFilters = useDebouncedValue(filters, 500);

  useEffect(() => {
    onSearch(debouncedFilters);
  }, [debouncedFilters, onSearch]);

  return (
    <SearchPanel>
      <FilterSelect
        id="schedule-shift"
        label="Turno"
        options={shiftOptions}
        value={shift}
        onValueChange={setShift}
        className="w-full"
      />
      <FilterSelect
        id="schedule-status"
        label="Status"
        options={statusOptions}
        value={enabled}
        onValueChange={setEnabled}
        className="w-full"
      />
      <Button className="w-full shrink-0 lg:w-auto" type="button" onClick={onAddNewSchedule}>
        <PlusIcon />
        Adicionar horário
      </Button>
    </SearchPanel>
  );
}
