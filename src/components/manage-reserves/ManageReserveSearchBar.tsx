import { addYears, endOfMonth, endOfYear, startOfMonth } from "date-fns";
import { useEffect, useMemo, useState } from "react";
import type { DateRange } from "react-day-picker";
import { useDebouncedValue } from "#/hooks/use-debounced-value";
import { toApiDate } from "#/lib/queries/reserves";
import { DEFAULT_PAGE_LIMIT } from "#/lib/utils/pagination";
import { reserveStatusFilterOptions } from "#/lib/utils/reservation-utils";
import { DateRangeField } from "@/components/reserve/DateRangeField";
import { AccountMultiSelect, ScheduleMultiSelect, SpaceMultiSelect } from "@/components/shared/entity-selects";
import { FilterSelect } from "@/components/shared/FilterSelect";
import { PageLimitSelect } from "@/components/shared/PageLimitSelect";
import type { RemoteOption } from "@/components/shared/RemoteCombobox";
import { SearchPanel } from "@/components/shared/SearchPanel";

export type ReserveFilters = {
  /** ids dos espaços escolhidos; vazio = todos */
  spaceIds: number[];
  /** yyyy-MM-dd */
  startAt: string;
  /** yyyy-MM-dd */
  endAt: string;
  scheduleIds: number[];
  accountIds: string[];
  /** valor de EReserveStatus; `undefined` = todos os status */
  status: number | undefined;
  /** itens por página */
  limit: number;
};

/** O backend exige um período: por padrão, o mês atual. */
const defaultRange = (): DateRange => {
  const today = new Date();
  return { from: startOfMonth(today), to: endOfMonth(today) };
};

export const initialReserveFilters = (): ReserveFilters => {
  const range = defaultRange();
  return {
    spaceIds: [],
    startAt: toApiDate(range.from as Date),
    endAt: toApiDate(range.to as Date),
    scheduleIds: [],
    accountIds: [],
    status: undefined,
    limit: DEFAULT_PAGE_LIMIT,
  };
};

type ManageReserveSearchBarProps = {
  onSearch: (filters: ReserveFilters) => void;
};

export function ManageReserveSearchBar({ onSearch }: ManageReserveSearchBarProps) {
  const maxDate = useMemo(() => endOfYear(addYears(new Date(), 1)), []);
  const [spaces, setSpaces] = useState<RemoteOption[]>([]);
  const [range, setRange] = useState<DateRange>(defaultRange);
  const [schedules, setSchedules] = useState<RemoteOption[]>([]);
  const [accounts, setAccounts] = useState<RemoteOption<string>[]>([]);
  const [status, setStatus] = useState<number | undefined>(undefined);
  const [limit, setLimit] = useState(DEFAULT_PAGE_LIMIT);

  const filters = useMemo<ReserveFilters>(() => {
    const from = range.from ?? (defaultRange().from as Date);
    return {
      spaceIds: spaces.map((space) => space.id),
      startAt: toApiDate(from),
      // sem fim selecionado = um único dia
      endAt: toApiDate(range.to ?? from),
      scheduleIds: schedules.map((schedule) => schedule.id),
      accountIds: accounts.map((account) => account.id),
      status,
      limit,
    };
  }, [spaces, range, schedules, accounts, status, limit]);
  const debouncedFilters = useDebouncedValue(filters, 500);

  useEffect(() => {
    onSearch(debouncedFilters);
  }, [debouncedFilters, onSearch]);

  return (
    <SearchPanel>
      <div className="flex flex-wrap items-end gap-4">
        <SpaceMultiSelect
          id="reserve-spaces-filter"
          label="Espaços"
          value={spaces}
          onValueChange={setSpaces}
          className="min-w-50 flex-1"
        />
        <PageLimitSelect id="reserve-limit" value={limit} onValueChange={setLimit} className="w-full sm:w-40" />
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <DateRangeField
          id="reserve-period"
          label="Período"
          value={range}
          // limpar o período volta ao mês atual (o backend exige início e fim)
          onChange={(next) => setRange(next ?? defaultRange())}
          minDate={null}
          maxDate={maxDate}
          maxDays={null}
          hint={null}
        />
        <ScheduleMultiSelect
          id="reserve-schedules-filter"
          label="Horários"
          value={schedules}
          onValueChange={setSchedules}
        />
        <AccountMultiSelect
          id="reserve-accounts-filter"
          label="Usuários"
          value={accounts}
          onValueChange={setAccounts}
        />
        <FilterSelect
          id="reserve-status-filter"
          label="Status"
          options={reserveStatusFilterOptions}
          value={status}
          onValueChange={setStatus}
        />
      </div>
    </SearchPanel>
  );
}
