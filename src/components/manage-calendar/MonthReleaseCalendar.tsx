import { ptBR } from "date-fns/locale";
import { useMemo, useState } from "react";
import { type CalendarDay, parseApiDate } from "#/lib/queries/calendar";
import { toApiDate } from "#/lib/queries/reserves";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { daysOfMonth, isPast, isRestricted } from "./calendar-utils";

type MonthReleaseCalendarProps = {
  month: Date;
  onMonthChange: (month: Date) => void;
  days: CalendarDay[];
  pending: boolean;
  onRelease: (dates: string[]) => Promise<boolean>;
  onRevoke: (date: Date) => void;
};

const LEGEND = [
  { label: "Bloqueado", className: "bg-muted-foreground/30" },
  { label: "Feriado", className: "bg-amber-500" },
  { label: "Liberado", className: "bg-emerald-500" },
  { label: "Selecionado", className: "bg-primary" },
];

/**
 * Calendário do mês: clique nos fins de semana e feriados bloqueados para selecioná-los e libere de uma vez;
 * clique em um dia liberado para bloqueá-lo de novo. Dias úteis não mudam.
 */
export function MonthReleaseCalendar({
  month,
  onMonthChange,
  days,
  pending,
  onRelease,
  onRevoke,
}: MonthReleaseCalendarProps) {
  const [selected, setSelected] = useState<Date[]>([]);

  const byDate = useMemo(() => new Map(days.map((day) => [day.date, day])), [days]);
  const dayOf = (date: Date) => byDate.get(toApiDate(date));
  const monthDays = daysOfMonth(days, month).filter((day) => !isPast(day));

  // Só fins de semana e feriados ainda por vir mudam; dia útil e passado ficam desabilitados.
  const isLocked = (date: Date) => {
    const day = dayOf(date);
    return !day || !isRestricted(day) || isPast(day);
  };

  function handleSelect(next: Date[] | undefined, trigger: Date) {
    if (dayOf(trigger)?.released) {
      onRevoke(trigger);
      return;
    }
    setSelected(next ?? []);
  }

  async function release(dates: string[]) {
    if (dates.length === 0) return;
    if (await onRelease(dates)) setSelected([]);
  }

  const blockedWhere = (match: (day: CalendarDay) => boolean) =>
    monthDays.filter((day) => day.blocked && match(day)).map((day) => day.date);
  const saturdays = blockedWhere((day) => parseApiDate(day.date).getDay() === 6);
  const sundays = blockedWhere((day) => parseApiDate(day.date).getDay() === 0);
  const holidays = blockedWhere((day) => day.holidays.length > 0);

  return (
    <div className="flex flex-col gap-4">
      <Calendar
        mode="multiple"
        locale={ptBR}
        month={month}
        onMonthChange={(next) => {
          setSelected([]);
          onMonthChange(next);
        }}
        selected={selected}
        onSelect={handleSelect}
        disabled={isLocked}
        showOutsideDays={false}
        className="w-full p-0 [--cell-size:--spacing(10)] sm:[--cell-size:--spacing(12)]"
        classNames={{ root: "w-full" }}
        modifiers={{
          blockedDay: (date) => dayOf(date)?.blocked ?? false,
          holiday: (date) => (dayOf(date)?.holidays.length ?? 0) > 0,
          released: (date) => dayOf(date)?.released ?? false,
        }}
        modifiersClassNames={{
          blockedDay: "[&>button]:bg-muted-foreground/15 [&>button]:line-through",
          holiday: "[&>button]:text-amber-600 dark:[&>button]:text-amber-400 [&>button]:font-semibold",
          released:
            "[&>button]:bg-emerald-500/20 [&>button]:text-emerald-700 dark:[&>button]:text-emerald-300 [&>button]:font-semibold",
        }}
      />

      <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
        {LEGEND.map((item) => (
          <span key={item.label} className="flex items-center gap-1.5">
            <span className={`size-2.5 rounded-full ${item.className}`} />
            {item.label}
          </span>
        ))}
      </div>

      <div className="flex flex-col gap-2">
        <Button
          type="button"
          disabled={selected.length === 0 || pending}
          onClick={() => release(selected.map(toApiDate))}
        >
          Liberar selecionados{selected.length > 0 && ` (${selected.length})`}
        </Button>
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
          <Button
            type="button"
            variant="outline"
            disabled={saturdays.length === 0 || pending}
            onClick={() => release(saturdays)}
          >
            Todos os sábados
          </Button>
          <Button
            type="button"
            variant="outline"
            disabled={sundays.length === 0 || pending}
            onClick={() => release(sundays)}
          >
            Todos os domingos
          </Button>
          <Button
            type="button"
            variant="outline"
            disabled={holidays.length === 0 || pending}
            onClick={() => release(holidays)}
          >
            Todos os feriados
          </Button>
        </div>
        <p className="text-xs text-muted-foreground">
          Os atalhos liberam os dias bloqueados que ainda vão acontecer neste mês. Clique em um dia liberado para
          bloqueá-lo de novo.
        </p>
      </div>
    </div>
  );
}
