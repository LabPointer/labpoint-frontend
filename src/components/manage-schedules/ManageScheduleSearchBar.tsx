import { PlusIcon } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useDebouncedValue } from "#/hooks/use-debounced-value";
import { DEFAULT_PAGE_LIMIT } from "#/lib/utils/pagination";
import { type FilterOption, FilterSelect } from "@/components/shared/FilterSelect";
import { PageLimitSelect } from "@/components/shared/PageLimitSelect";
import { SearchPanel } from "@/components/shared/SearchPanel";
import { Button } from "@/components/ui/button";
import { Field, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";

export type ScheduleFilters = {
  shift: number | undefined;
  enabled: boolean | undefined;
  /** "HH:mm": horários que começam a partir dessa hora */
  startAt: string | undefined;
  /** "HH:mm": horários que terminam até essa hora */
  endAt: string | undefined;
  /** itens por página */
  limit: number;
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
  const [startAt, setStartAt] = useState("");
  const [endAt, setEndAt] = useState("");
  const [limit, setLimit] = useState(DEFAULT_PAGE_LIMIT);

  const filters = useMemo<ScheduleFilters>(
    () => ({ shift, enabled, startAt: startAt || undefined, endAt: endAt || undefined, limit }),
    [shift, enabled, startAt, endAt, limit],
  );
  const debouncedFilters = useDebouncedValue(filters, 500);

  useEffect(() => {
    onSearch(debouncedFilters);
  }, [debouncedFilters, onSearch]);

  // "HH:mm" compara corretamente como texto
  const invalidRange = Boolean(startAt && endAt && startAt > endAt);

  return (
    <SearchPanel>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <FilterSelect
          id="schedule-shift"
          label="Turno"
          options={shiftOptions}
          value={shift}
          onValueChange={setShift}
        />
        <FilterSelect
          id="schedule-status"
          label="Status"
          options={statusOptions}
          value={enabled}
          onValueChange={setEnabled}
        />
        <PageLimitSelect id="schedule-limit" value={limit} onValueChange={setLimit} />
        <Field data-invalid={invalidRange}>
          <FieldLabel htmlFor="schedule-start-at" className="font-bold">
            Hora de início (a partir de)
          </FieldLabel>
          <Input
            id="schedule-start-at"
            type="time"
            value={startAt}
            onChange={(event) => setStartAt(event.target.value)}
            aria-invalid={invalidRange}
          />
        </Field>
        <Field data-invalid={invalidRange}>
          <FieldLabel htmlFor="schedule-end-at" className="font-bold">
            Hora de fim (até)
          </FieldLabel>
          <Input
            id="schedule-end-at"
            type="time"
            value={endAt}
            onChange={(event) => setEndAt(event.target.value)}
            aria-invalid={invalidRange}
          />
        </Field>
      </div>
      {invalidRange && (
        <p className="text-sm text-destructive">A hora de início precisa ser igual ou anterior à hora de fim.</p>
      )}
      <Button className="w-full shrink-0 lg:w-auto" type="button" onClick={onAddNewSchedule}>
        <PlusIcon />
        Adicionar horário
      </Button>
    </SearchPanel>
  );
}
