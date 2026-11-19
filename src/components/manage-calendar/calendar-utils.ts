import { startOfDay } from "date-fns";
import { type CalendarDay, parseApiDate } from "#/lib/queries/calendar";

/** Fim de semana ou feriado: o tipo de dia que a coordenação libera. */
export const isRestricted = (day: CalendarDay) => day.isWeekend || day.holidays.length > 0;

/** Dias passados não são mais liberados nem bloqueados. */
export const isPast = (day: CalendarDay) => parseApiDate(day.date) < startOfDay(new Date());

/** Dias do mês de `month`. */
export const daysOfMonth = (days: CalendarDay[], month: Date) =>
  days.filter((day) => {
    const date = parseApiDate(day.date);
    return date.getFullYear() === month.getFullYear() && date.getMonth() === month.getMonth();
  });
