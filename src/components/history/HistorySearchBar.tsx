import { addMonths, endOfYear, startOfToday } from "date-fns";
import { useEffect, useMemo, useState } from "react";
import type { DateRange } from "react-day-picker";
import { useDebouncedValue } from "#/hooks/use-debounced-value";
import { toApiDate } from "#/lib/queries/reserves";
import { DEFAULT_PAGE_LIMIT } from "#/lib/utils/pagination";
import { reserveStatusFilterOptions } from "#/lib/utils/reservation-utils";
import { DateRangeField } from "@/components/reserve/DateRangeField";
import { FilterSelect } from "@/components/shared/FilterSelect";
import { PageLimitSelect } from "@/components/shared/PageLimitSelect";
import { SearchPanel } from "@/components/shared/SearchPanel";

export type HistoryFilters = {
  /** yyyy-MM-dd */
  startAt: string;
  /** yyyy-MM-dd */
  endAt: string;
  /** valor de EReserveStatus; `undefined` = todos os status */
  status: number | undefined;
  /** itens por página */
  limit: number;
};

/** Período padrão: 1 mês, contando a partir do dia atual do usuário. */
const defaultRange = (): DateRange => {
  const today = startOfToday();
  return { from: today, to: addMonths(today, 1) };
};

export const initialHistoryFilters = (): HistoryFilters => {
  const range = defaultRange();
  return {
    startAt: toApiDate(range.from as Date),
    endAt: toApiDate(range.to as Date),
    status: undefined,
    limit: DEFAULT_PAGE_LIMIT,
  };
};

type HistorySearchBarProps = {
  onSearch: (filters: HistoryFilters) => void;
};

export function HistorySearchBar({ onSearch }: HistorySearchBarProps) {
  const maxDate = useMemo(() => endOfYear(addMonths(new Date(), 12)), []);
  const [range, setRange] = useState<DateRange>(defaultRange);
  const [status, setStatus] = useState<number | undefined>(undefined);
  const [limit, setLimit] = useState(DEFAULT_PAGE_LIMIT);

  const filters = useMemo<HistoryFilters>(() => {
    const from = range.from ?? (defaultRange().from as Date);
    return {
      startAt: toApiDate(from),
      // sem fim selecionado = um único dia
      endAt: toApiDate(range.to ?? from),
      status,
      limit,
    };
  }, [range, status, limit]);
  const debouncedFilters = useDebouncedValue(filters, 500);

  useEffect(() => {
    onSearch(debouncedFilters);
  }, [debouncedFilters, onSearch]);

  return (
    <SearchPanel className="w-full">
      <div className="grid gap-4 md:grid-cols-3">
        <DateRangeField
          id="history-period"
          label="Período"
          value={range}
          // limpar o período volta ao padrão (o backend exige início e fim)
          onChange={(next) => setRange(next ?? defaultRange())}
          minDate={null}
          maxDate={maxDate}
          maxDays={null}
          hint={null}
        />
        <FilterSelect
          id="history-status"
          label="Status"
          options={reserveStatusFilterOptions}
          value={status}
          onValueChange={setStatus}
        />
        <PageLimitSelect id="history-limit" value={limit} onValueChange={setLimit} />
      </div>
    </SearchPanel>
  );
}
