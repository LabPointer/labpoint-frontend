import { addYears, endOfYear } from "date-fns";
import { useEffect, useMemo, useState } from "react";
import type { DateRange } from "react-day-picker";
import { useDebouncedValue } from "#/hooks/use-debounced-value";
import { toApiDate } from "#/lib/queries/reserves";
import { USAGE_STATUS, usageStatusLabel } from "#/lib/queries/usage";
import { DEFAULT_PAGE_LIMIT } from "#/lib/utils/pagination";
import { DateRangeField } from "@/components/reserve/DateRangeField";
import { AccountMultiSelect, SpaceMultiSelect } from "@/components/shared/entity-selects";
import { FilterSelect } from "@/components/shared/FilterSelect";
import { PageLimitSelect } from "@/components/shared/PageLimitSelect";
import type { RemoteOption } from "@/components/shared/RemoteCombobox";
import { SearchPanel } from "@/components/shared/SearchPanel";

export type CheckOutFilters = {
  /** yyyy-MM-dd */
  startAt: string;
  /** yyyy-MM-dd */
  endAt: string;
  /** valores de EUsageStatus; vazio = todos */
  statuses: number[];
  spaceIds: number[];
  accountIds: string[];
  limit: number;
};

type StatusFilter = "open" | "all" | `${number}`;

const STATUS_FILTERS: Record<StatusFilter, number[]> = {
  open: [USAGE_STATUS.CHECKED_IN, USAGE_STATUS.CHECKOUT_PENDING],
  all: [],
  ...Object.fromEntries(Object.values(USAGE_STATUS).map((status) => [String(status), [status]])),
};

const statusOptions: { label: string; value: StatusFilter }[] = [
  { label: "Em aberto (em uso e pendentes)", value: "open" },
  { label: "Todos os status", value: "all" },
  ...Object.values(USAGE_STATUS).map((status) => ({
    label: usageStatusLabel(status),
    value: String(status) as StatusFilter,
  })),
];

/** Por padrão: hoje. */
const defaultRange = (): DateRange => {
  const today = new Date();
  return { from: today, to: today };
};

export function ManageCheckOutSearchBar({ onSearch }: { onSearch: (filters: CheckOutFilters) => void }) {
  const maxDate = useMemo(() => endOfYear(addYears(new Date(), 1)), []);
  const [range, setRange] = useState<DateRange>(defaultRange);
  const [status, setStatus] = useState<StatusFilter>("open");
  const [spaces, setSpaces] = useState<RemoteOption[]>([]);
  const [accounts, setAccounts] = useState<RemoteOption<string>[]>([]);
  const [limit, setLimit] = useState(DEFAULT_PAGE_LIMIT);

  const filters = useMemo<CheckOutFilters>(() => {
    const from = range.from ?? new Date();
    return {
      startAt: toApiDate(from),
      endAt: toApiDate(range.to ?? from),
      statuses: STATUS_FILTERS[status],
      spaceIds: spaces.map((space) => space.id),
      accountIds: accounts.map((account) => account.id),
      limit,
    };
  }, [range, status, spaces, accounts, limit]);
  const debouncedFilters = useDebouncedValue(filters, 400);

  useEffect(() => {
    onSearch(debouncedFilters);
  }, [debouncedFilters, onSearch]);

  return (
    <SearchPanel>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        <DateRangeField
          id="check-out-period"
          label="Período"
          value={range}
          onChange={(next) => setRange(next ?? defaultRange())}
          minDate={null}
          maxDate={maxDate}
          maxDays={null}
          hint={null}
        />
        <FilterSelect
          id="check-out-status"
          label="Status"
          options={statusOptions}
          value={status}
          onValueChange={setStatus}
        />
        <SpaceMultiSelect id="check-out-spaces" label="Sala" value={spaces} onValueChange={setSpaces} />
        <AccountMultiSelect id="check-out-accounts" label="Usuários" value={accounts} onValueChange={setAccounts} />
        <PageLimitSelect id="check-out-limit" value={limit} onValueChange={setLimit} className="w-full" />
      </div>
    </SearchPanel>
  );
}
