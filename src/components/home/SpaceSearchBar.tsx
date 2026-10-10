import { addDays, addYears, endOfYear, format, startOfToday, startOfTomorrow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { CalendarIcon, Filter, SearchIcon, Users } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import type { DateRange } from "react-day-picker";
import { useDebouncedValue } from "#/hooks/use-debounced-value";
import { shiftLabels, useSchedules } from "#/lib/queries/schedules";
import { ResourceMultiSelect, SubjectMultiSelect } from "@/components/shared/entity-selects";
import { RemoteMultiCombobox, type RemoteOption } from "@/components/shared/RemoteCombobox";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/components/ui/input-group";
import { Button } from "../ui/button";
import { Calendar } from "../ui/calendar";
import { Field, FieldLabel } from "../ui/field";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";

// restrições de capacidade
const MIN_CAPACITY = 10;
const MAX_CAPACITY = 300;
const CAPACITY_STEP = 10;
const DEFAULT_CAPACITY = 20;

export type SpaceSearchFilters = {
  searchQuery: string;
  minimumCapacity: number;
  resources: number[];
  subjects: number[];
  startDate: Date;
  endDate: Date;
  schedules: number[];
};

type SpaceSearchBarProps = {
  onSearch: (filters: SpaceSearchFilters) => void;
};

const labelClass = "text-sm font-semibold text-neutral-800 dark:text-neutral-200";

export function SpaceSearchBar({ onSearch }: SpaceSearchBarProps) {
  const tomorrow = useMemo(() => startOfTomorrow(), []);
  const maxDate = useMemo(() => endOfYear(addYears(new Date(), 1)), []);

  const [searchQuery, setSearchQuery] = useState("");
  const [minimumCapacity, setMinimumCapacity] = useState(DEFAULT_CAPACITY);
  const [resources, setResources] = useState<RemoteOption[]>([]);
  const [subjects, setSubjects] = useState<RemoteOption[]>([]);
  const [schedules, setSchedules] = useState<RemoteOption[]>([]);
  const [dateRange, setDateRange] = useState<DateRange | undefined>({ from: tomorrow, to: addDays(tomorrow, 30) });

  // Horários: poucos itens, carregados uma única vez e filtrados localmente.
  const scheduleQuery = useSchedules({ enabled: true });
  const scheduleOptions = useMemo<RemoteOption[]>(
    () =>
      (scheduleQuery.data ?? []).map((schedule) => ({
        id: Number(schedule.id),
        name: `${shiftLabels[schedule.shift] ?? "—"}: ${schedule.startAt.slice(0, 5)} - ${schedule.endAt.slice(0, 5)}`,
      })),
    [scheduleQuery.data],
  );

  const filters = useMemo<SpaceSearchFilters>(
    () => ({
      searchQuery,
      minimumCapacity,
      resources: resources.map((resource) => resource.id),
      subjects: subjects.map((subject) => subject.id),
      schedules: schedules.map((schedule) => schedule.id),
      startDate: dateRange?.from ?? tomorrow,
      endDate: dateRange?.to ?? addDays(tomorrow, 30),
    }),
    [searchQuery, minimumCapacity, resources, subjects, schedules, dateRange, tomorrow],
  );
  const debouncedFilters = useDebouncedValue(filters, 1000);

  useEffect(() => {
    onSearch(debouncedFilters);
  }, [debouncedFilters, onSearch]);

  return (
    <div className="rounded-md border bg-white p-4 shadow-md hover:shadow-lg dark:border-violet-500/10 dark:bg-white/5 dark:shadow-violet-300/15">
      <div className="flex flex-col gap-4">
        <Field className="w-full">
          <FieldLabel className={labelClass} htmlFor="search-spaces">
            Pesquisar
          </FieldLabel>
          <InputGroup className="h-10">
            <InputGroupInput
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              id="search-spaces"
              placeholder="Buscar por nome ou descrição..."
              className="text-sm"
              autoComplete="off"
            />
            <InputGroupAddon align="inline-start">
              <SearchIcon className="size-4 text-muted-foreground" />
            </InputGroupAddon>
          </InputGroup>
        </Field>

        <Field className="w-full">
          <FieldLabel className={labelClass} htmlFor="capacity-select">
            Capacidade mínima
          </FieldLabel>
          <InputGroup className="h-10">
            <InputGroupInput
              value={minimumCapacity}
              onChange={(event) => setMinimumCapacity(Number(event.target.value) || 0)}
              id="capacity-select"
              className="text-sm"
              type="number"
              min={MIN_CAPACITY}
              max={MAX_CAPACITY}
              step={CAPACITY_STEP}
            />
            <InputGroupAddon align="inline-start">
              <Users className="size-4 text-muted-foreground" />
            </InputGroupAddon>
          </InputGroup>
        </Field>

        {/* Filtros avançados */}
        <Collapsible>
          <CollapsibleTrigger className="w-full rounded-md border p-2 md:w-fit dark:border-violet-300/20 hover:dark:border-violet-400/40">
            <div className="flex items-center gap-x-2">
              <Filter className="size-4" />
              <span className="text-sm font-semibold">Filtros avançados</span>
            </div>
          </CollapsibleTrigger>
          <CollapsibleContent className="flex flex-col gap-y-4 pt-3">
            <ResourceMultiSelect
              id="space-resources"
              label="Equipamentos"
              value={resources}
              onValueChange={setResources}
              enabledOnly
              canReserve={false}
            />

            <SubjectMultiSelect
              id="space-subjects"
              label="Disciplinas"
              value={subjects}
              onValueChange={setSubjects}
              enabledOnly
            />

            {/* Data de início e término */}
            <Field className="w-full">
              <FieldLabel htmlFor="date-picker-range" className={labelClass}>
                Período
              </FieldLabel>
              <Popover>
                <PopoverTrigger
                  render={
                    <Button variant="outline" id="date-picker-range" className="justify-start px-2.5 font-normal">
                      <CalendarIcon data-icon="inline-start" />
                      {dateRange?.from ? (
                        dateRange.to ? (
                          <>
                            {format(dateRange.from, "dd 'de' MMM, yyyy", { locale: ptBR })} -{" "}
                            {format(dateRange.to, "dd 'de' MMM, yyyy", { locale: ptBR })}
                          </>
                        ) : (
                          format(dateRange.from, "dd 'de' MMM, yyyy", { locale: ptBR })
                        )
                      ) : (
                        <span>Selecione uma data</span>
                      )}
                    </Button>
                  }
                />
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="range"
                    locale={ptBR}
                    defaultMonth={dateRange?.from}
                    selected={dateRange}
                    onSelect={setDateRange}
                    numberOfMonths={2}
                    disabled={[{ before: tomorrow }, { after: maxDate }]}
                    startMonth={startOfToday()}
                    endMonth={maxDate}
                    className="rounded-lg border"
                  />
                </PopoverContent>
              </Popover>
            </Field>

            <RemoteMultiCombobox
              id="space-schedules"
              label="Horários"
              options={scheduleOptions}
              isLoading={scheduleQuery.isPending}
              isError={scheduleQuery.isError}
              value={schedules}
              onValueChange={setSchedules}
              placeholder="Selecione horários..."
              emptyText="Nenhum horário encontrado."
            />
          </CollapsibleContent>
        </Collapsible>
      </div>
    </div>
  );
}
