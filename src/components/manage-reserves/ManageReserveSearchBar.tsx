import { addYears, endOfMonth, endOfYear, startOfMonth } from "date-fns";
import { useEffect, useMemo, useState } from "react";
import type { DateRange } from "react-day-picker";
import { useDebouncedValue } from "#/hooks/use-debounced-value";
import { RESERVE_STATUS, toApiDate } from "#/lib/queries/reserves";
import type { ReservationStatus } from "#/lib/types/reservation-types";
import { statusLabel } from "#/lib/utils/reservation-utils";
import { DateRangeField } from "@/components/reserve/DateRangeField";
import { AccountMultiSelect, ScheduleMultiSelect } from "@/components/shared/entity-selects";
import { type FilterOption, FilterSelect } from "@/components/shared/FilterSelect";
import type { RemoteOption } from "@/components/shared/RemoteCombobox";
import { SearchPanel, SearchTextField } from "@/components/shared/SearchPanel";

export type ReserveFilters = {
  /** nome do espaço */
  search: string;
  /** yyyy-MM-dd */
  startAt: string;
  /** yyyy-MM-dd */
  endAt: string;
  scheduleIds: number[];
  accountIds: string[];
  /** valor de EReserveStatus; `undefined` = todos os status */
  status: number | undefined;
};

const statusOptions: FilterOption<number | undefined>[] = [
  { label: "Todos os status", value: undefined },
  ...(Object.keys(RESERVE_STATUS) as ReservationStatus[]).map((key) => ({
    label: statusLabel(key),
    value: RESERVE_STATUS[key],
  })),
];

/** O backend exige um período: por padrão, o mês atual. */
const defaultRange = (): DateRange => {
  const today = new Date();
  return { from: startOfMonth(today), to: endOfMonth(today) };
};

export const initialReserveFilters = (): ReserveFilters => {
  const range = defaultRange();
  return {
    search: "",
    startAt: toApiDate(range.from as Date),
    endAt: toApiDate(range.to as Date),
    scheduleIds: [],
    accountIds: [],
    status: undefined,
  };
};

type ManageReserveSearchBarProps = {
  onSearch: (filters: ReserveFilters) => void;
};

export function ManageReserveSearchBar({ onSearch }: ManageReserveSearchBarProps) {
  const maxDate = useMemo(() => endOfYear(addYears(new Date(), 1)), []);
  const [search, setSearch] = useState("");
  const [range, setRange] = useState<DateRange>(defaultRange);
  const [schedules, setSchedules] = useState<RemoteOption[]>([]);
  const [accounts, setAccounts] = useState<RemoteOption<string>[]>([]);
  const [status, setStatus] = useState<number | undefined>(undefined);

  const filters = useMemo<ReserveFilters>(() => {
    const from = range.from ?? (defaultRange().from as Date);
    return {
      search,
      startAt: toApiDate(from),
      // sem fim selecionado = um único dia
      endAt: toApiDate(range.to ?? from),
      scheduleIds: schedules.map((schedule) => schedule.id),
      accountIds: accounts.map((account) => account.id),
      status,
    };
  }, [search, range, schedules, accounts, status]);
  const debouncedFilters = useDebouncedValue(filters, 500);

  useEffect(() => {
    onSearch(debouncedFilters);
  }, [debouncedFilters, onSearch]);

  return (
    <SearchPanel>
      <SearchTextField
        id="reserve-search"
        placeholder="Buscar pelo nome do espaço..."
        value={search}
        onValueChange={setSearch}
      />

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
          options={statusOptions}
          value={status}
          onValueChange={setStatus}
        />
      </div>
    </SearchPanel>
  );
}
