import { useEffect, useMemo, useState } from "react";
import type { DateRange } from "react-day-picker";
import { useDebouncedValue } from "#/hooks/use-debounced-value";
import { DEFAULT_PAGE_LIMIT } from "#/lib/utils/pagination";
import { DateRangeField } from "@/components/reserve/DateRangeField";
import { ScheduleMultiSelect } from "@/components/shared/entity-selects";
import { PageLimitSelect } from "@/components/shared/PageLimitSelect";
import type { RemoteOption } from "@/components/shared/RemoteCombobox";
import { SearchPanel, SearchTextField } from "@/components/shared/SearchPanel";

export type ResourceSearchFilters = {
  /** nome ou descrição */
  search: string;
  /** período para checar a disponibilidade (opcional) */
  range: DateRange | undefined;
  scheduleIds: number[];
  /** itens por página */
  limit: number;
};

type ResourceSearchBarProps = {
  onSearch: (filters: ResourceSearchFilters) => void;
  /** Rótulo do campo de período. */
  rangeLabel?: string;
  /** `null` = permite datas passadas (histórico). Padrão: a partir de amanhã. */
  minDate?: Date | null;
  /** Tamanho máximo do período. Padrão: 30 dias. */
  maxDays?: number | null;
  rangeHint?: string | null;
  initialRange?: DateRange;
};

/** Barra de pesquisa de recursos reserváveis: texto (nome/descrição), itens por página, período e horários. */
export function ResourceSearchBar({
  onSearch,
  rangeLabel = "Período",
  minDate,
  maxDays,
  rangeHint,
  initialRange,
}: ResourceSearchBarProps) {
  const [search, setSearch] = useState("");
  const [range, setRange] = useState<DateRange | undefined>(initialRange);
  const [schedules, setSchedules] = useState<RemoteOption[]>([]);
  const [limit, setLimit] = useState(DEFAULT_PAGE_LIMIT);

  const filters = useMemo<ResourceSearchFilters>(
    () => ({ search, range, scheduleIds: schedules.map((schedule) => schedule.id), limit }),
    [search, range, schedules, limit],
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
      <div className="grid gap-4 md:grid-cols-2">
        <DateRangeField
          id="resource-range"
          label={rangeLabel}
          value={range}
          onChange={setRange}
          minDate={minDate}
          maxDays={maxDays}
          hint={rangeHint}
        />
        <ScheduleMultiSelect
          id="resource-schedules"
          label="Horários"
          value={schedules}
          onValueChange={setSchedules}
          enabledOnly
        />
      </div>
    </SearchPanel>
  );
}
