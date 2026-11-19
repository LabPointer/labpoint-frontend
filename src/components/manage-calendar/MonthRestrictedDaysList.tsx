import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { type CalendarDay, parseApiDate } from "#/lib/queries/calendar";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { daysOfMonth, isPast, isRestricted } from "./calendar-utils";

type MonthRestrictedDaysListProps = {
  month: Date;
  days: CalendarDay[];
  pending: boolean;
  onRelease: (dates: string[]) => void;
  onRevoke: (date: Date) => void;
};

/** Fins de semana e feriados do mês, um por linha, com um switch para liberar (o jeito mais simples no celular). */
export function MonthRestrictedDaysList({ month, days, pending, onRelease, onRevoke }: MonthRestrictedDaysListProps) {
  const restricted = daysOfMonth(days, month).filter(isRestricted);
  const releasedCount = restricted.filter((day) => day.released).length;

  return (
    <div className="flex flex-col gap-3">
      <div>
        <h3 className="font-bold">Fins de semana e feriados do mês</h3>
        <p className="text-xs text-muted-foreground">
          {releasedCount} de {restricted.length} liberado(s) para reservas.
        </p>
      </div>
      <ul className="flex flex-col divide-y rounded-md border dark:border-violet-500/10">
        {restricted.map((day) => {
          const date = parseApiDate(day.date);
          const past = isPast(day);
          const id = `release-${day.date}`;
          return (
            <li key={day.date} className="flex items-center gap-3 px-3 py-2">
              <label htmlFor={id} className="flex min-w-0 flex-1 flex-col gap-0.5">
                <span className="text-sm font-medium first-letter:uppercase">
                  {format(date, "EEEE, dd/MM", { locale: ptBR })}
                </span>
                {day.holidays.length > 0 && (
                  <span className="flex flex-wrap gap-1">
                    {day.holidays.map((holiday) => (
                      <Badge
                        key={holiday.id}
                        variant="outline"
                        className="border-amber-500/30 bg-amber-500/15 text-amber-700 dark:text-amber-300"
                      >
                        {holiday.name}
                      </Badge>
                    ))}
                  </span>
                )}
              </label>
              <span
                className={
                  day.released ? "text-xs text-emerald-600 dark:text-emerald-400" : "text-xs text-muted-foreground"
                }
              >
                {day.released ? "Liberado" : "Bloqueado"}
              </span>
              <Switch
                id={id}
                checked={day.released}
                disabled={past || pending}
                aria-label={`Liberar ${format(date, "dd/MM")} para reservas`}
                onCheckedChange={(checked) => (checked ? onRelease([day.date]) : onRevoke(date))}
              />
            </li>
          );
        })}
      </ul>
    </div>
  );
}
