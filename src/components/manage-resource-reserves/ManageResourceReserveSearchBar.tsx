import { addYears, endOfMonth, endOfYear, startOfMonth } from "date-fns";
import { useEffect, useMemo, useState } from "react";
import type { DateRange } from "react-day-picker";
import { useDebouncedValue } from "#/hooks/use-debounced-value";
import { toApiDate } from "#/lib/queries/reserves";
import { DEFAULT_PAGE_LIMIT } from "#/lib/utils/pagination";
import { reserveStatusFilterOptions } from "#/lib/utils/reservation-utils";
import { DateRangeField } from "@/components/reserve/DateRangeField";
import {
  AccountMultiSelect,
  ReservableResourceMultiSelect,
  SpaceMultiSelect,
} from "@/components/shared/entity-selects";
import { FilterSelect } from "@/components/shared/FilterSelect";
import { PageLimitSelect } from "@/components/shared/PageLimitSelect";
import type { RemoteOption } from "@/components/shared/RemoteCombobox";
import { SearchPanel } from "@/components/shared/SearchPanel";

export type ResourceReserveFilters = {
  /** ids dos recursos escolhidos; vazio = todos */
  resourceIds: number[];
  /** yyyy-MM-dd */
  startAt: string;
  /** yyyy-MM-dd */
  endAt: string;
  /** sala da reserva vinculada */
  spaceIds: number[];
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

type ManageResourceReserveSearchBarProps = {
  onSearch: (filters: ResourceReserveFilters) => void;
};

export function ManageResourceReserveSearchBar({ onSearch }: ManageResourceReserveSearchBarProps) {
  const maxDate = useMemo(() => endOfYear(addYears(new Date(), 1)), []);
  const [resources, setResources] = useState<RemoteOption[]>([]);
  const [range, setRange] = useState<DateRange>(defaultRange);
  const [spaces, setSpaces] = useState<RemoteOption[]>([]);
  const [accounts, setAccounts] = useState<RemoteOption<string>[]>([]);
  const [status, setStatus] = useState<number | undefined>(undefined);
  const [limit, setLimit] = useState(DEFAULT_PAGE_LIMIT);

  const filters = useMemo<ResourceReserveFilters>(() => {
    const from = range.from ?? (defaultRange().from as Date);
    return {
      resourceIds: resources.map((resource) => resource.id),
      startAt: toApiDate(from),
      endAt: toApiDate(range.to ?? from),
      spaceIds: spaces.map((space) => space.id),
      accountIds: accounts.map((account) => account.id),
      status,
      limit,
    };
  }, [resources, range, spaces, accounts, status, limit]);
  const debouncedFilters = useDebouncedValue(filters, 500);

  useEffect(() => {
    onSearch(debouncedFilters);
  }, [debouncedFilters, onSearch]);

  return (
    <SearchPanel>
      <div className="flex flex-wrap items-end gap-4">
        <ReservableResourceMultiSelect
          id="resource-reserve-resources"
          label="Recursos"
          value={resources}
          onValueChange={setResources}
          className="min-w-50 flex-1"
        />
        <PageLimitSelect
          id="resource-reserve-limit"
          value={limit}
          onValueChange={setLimit}
          className="w-full sm:w-40"
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <DateRangeField
          id="resource-reserve-period"
          label="Período"
          value={range}
          // limpar o período volta ao mês atual (o backend exige início e fim)
          onChange={(next) => setRange(next ?? defaultRange())}
          minDate={null}
          maxDate={maxDate}
          maxDays={null}
          hint={null}
        />
        <SpaceMultiSelect id="resource-reserve-spaces" label="Sala" value={spaces} onValueChange={setSpaces} />
        <AccountMultiSelect
          id="resource-reserve-accounts"
          label="Usuários"
          value={accounts}
          onValueChange={setAccounts}
        />
        <FilterSelect
          id="resource-reserve-status"
          label="Status"
          options={reserveStatusFilterOptions}
          value={status}
          onValueChange={setStatus}
        />
      </div>
    </SearchPanel>
  );
}
