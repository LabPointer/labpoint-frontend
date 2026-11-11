import { addDays, endOfMonth, format, max as maxOf, min as minOf, startOfDay, startOfMonth } from "date-fns";
import { ptBR } from "date-fns/locale";
import { CalendarIcon } from "lucide-react";
import { useMemo, useState } from "react";
import type { DateRange } from "react-day-picker";
import { type CalendarDay, parseApiDate, useCalendarDays } from "#/lib/queries/calendar";
import { toApiDate } from "#/lib/queries/reserves";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

/** Primeiro dia permitido para reservar (amanhã). */
export const firstAvailableDate = () => startOfDay(addDays(new Date(), 1));

/** Período máximo de uma reserva, em dias. */
const DEFAULT_MAX_RANGE_DAYS = 30;

/**
 * Fins de semana e feriados sem liberação da coordenação.
 * - `block`: não podem ser início nem fim do período (o período pode atravessá-los: esses dias são pulados).
 * - `warn`: só avisa (edição pela coordenação).
 */
export type CalendarRules = "block" | "warn";

type DateRangeFieldProps = {
  id: string;
  label: string;
  /** Primeiro dia selecionável. Padrão: amanhã. `null` = sem restrição (permite hoje e dias passados). */
  minDate?: Date | null;
  /** Último dia selecionável. Padrão: sem limite. */
  maxDate?: Date;
  /** Tamanho máximo do período, em dias. Padrão: 30. `null` = sem limite. */
  maxDays?: number | null;
  /** Texto de ajuda abaixo do campo. Padrão descreve o limite de dias; `null` oculta. */
  hint?: string | null;
  /** Aplica os bloqueios de fim de semana e feriado. Sem a prop, todos os dias são iguais (ex.: filtros de busca). */
  calendarRules?: CalendarRules;
  value: DateRange | undefined;
  onChange: (range: DateRange | undefined) => void;
  errors?: ({ message?: string } | undefined)[];
  disabled?: boolean;
};

const fmt = (date: Date) => format(date, "dd/MM/yyyy", { locale: ptBR });

/** Dias do calendário, por "yyyy-MM-dd". */
function useCalendarRules(rules: CalendarRules | undefined, month: Date, value: DateRange | undefined) {
  // Mês visível + período escolhido (que pode passar para o mês seguinte).
  const startAt = minOf([startOfMonth(month), ...(value?.from ? [value.from] : [])]);
  const endAt = maxOf([endOfMonth(month), ...(value?.to ? [value.to] : value?.from ? [value.from] : [])]);
  const days = useCalendarDays({ startAt, endAt }, { enabled: rules !== undefined });

  return useMemo(() => {
    const byDate = new Map<string, CalendarDay>((days.data ?? []).map((day) => [day.date, day]));
    const isBlocked = (date: Date) => byDate.get(toApiDate(date))?.blocked ?? false;
    const isHoliday = (date: Date) => (byDate.get(toApiDate(date))?.holidays.length ?? 0) > 0;
    const isReleased = (date: Date) => byDate.get(toApiDate(date))?.released ?? false;
    const holidaysInMonth = (days.data ?? []).filter(
      (day) => day.holidays.length > 0 && parseApiDate(day.date).getMonth() === month.getMonth(),
    );
    return { loaded: days.data !== undefined, isBlocked, isHoliday, isReleased, holidaysInMonth };
  }, [days.data, month]);
}

/** Quantos dias do período ficam bloqueados (e são pulados pela reserva). */
function countBlocked(range: DateRange | undefined, isBlocked: (date: Date) => boolean) {
  if (!range?.from) return { total: 0, blocked: 0 };
  const to = range.to ?? range.from;
  let total = 0;
  let blocked = 0;
  for (let day = range.from; day <= to; day = addDays(day, 1)) {
    total++;
    if (isBlocked(day)) blocked++;
  }
  return { total, blocked };
}

export function DateRangeField({
  id,
  label,
  minDate: minDateProp,
  maxDate,
  maxDays = DEFAULT_MAX_RANGE_DAYS,
  hint,
  calendarRules,
  value,
  onChange,
  errors,
  disabled,
}: DateRangeFieldProps) {
  const minDate = minDateProp === undefined ? firstAvailableDate() : minDateProp;
  const [month, setMonth] = useState<Date>(() => value?.from ?? minDate ?? new Date());
  const rules = useCalendarRules(calendarRules, month, value);
  const blocking = calendarRules === "block";

  function handleSelect(range: DateRange | undefined) {
    // limita o período a MAX_RANGE_DAYS a partir do início
    const clamped =
      maxDays !== null && range?.from && range.to && range.to > addDays(range.from, maxDays)
        ? { from: range.from, to: addDays(range.from, maxDays) }
        : range;
    onChange(clamped);
  }

  const hasErrors = Boolean(errors?.length);
  const { total, blocked } = calendarRules ? countBlocked(value, rules.isBlocked) : { total: 0, blocked: 0 };
  const usable = total - blocked;

  return (
    <Field data-invalid={hasErrors}>
      <FieldLabel htmlFor={id}>{label}</FieldLabel>
      <Popover>
        <PopoverTrigger
          render={
            <Button
              type="button"
              variant="outline"
              id={id}
              disabled={disabled}
              className="w-full justify-start px-2.5 font-normal"
            >
              <CalendarIcon data-icon="inline-start" />
              {value?.from ? (
                value.to && value.to.getTime() !== value.from.getTime() ? (
                  <>
                    {fmt(value.from)} - {fmt(value.to)}
                  </>
                ) : (
                  fmt(value.from)
                )
              ) : (
                <span className="text-muted-foreground">Selecione a data</span>
              )}
            </Button>
          }
        />
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="range"
            locale={ptBR}
            month={month}
            onMonthChange={setMonth}
            selected={value}
            disabled={[
              ...(minDate ? [{ before: minDate }] : []),
              ...(maxDate ? [{ after: maxDate }] : []),
              // Enquanto o calendário não carrega, ao menos os fins de semana ficam de fora.
              ...(blocking ? [rules.loaded ? rules.isBlocked : { dayOfWeek: [0, 6] }] : []),
            ]}
            modifiers={calendarRules ? { holiday: rules.isHoliday, released: rules.isReleased } : undefined}
            modifiersClassNames={{
              holiday: "[&>button]:text-amber-600 dark:[&>button]:text-amber-400",
              released: "[&>button]:underline [&>button]:decoration-emerald-500 [&>button]:decoration-2",
            }}
            onSelect={handleSelect}
            // com um período já escolhido, o próximo clique começa um novo período (sem isso o clique só
            // estendia o intervalo anterior e não era possível trocar a data)
            resetOnSelect
            numberOfMonths={1}
          />
          {calendarRules && (
            <div className="flex max-w-64 flex-col gap-1 border-t px-3 py-2 text-xs text-muted-foreground">
              <p>Fins de semana e feriados só aceitam reserva quando liberados pela coordenação.</p>
              {rules.holidaysInMonth.map((day) => (
                <p key={day.date}>
                  <span className="font-medium text-amber-600 dark:text-amber-400">
                    {format(parseApiDate(day.date), "dd/MM")}
                  </span>{" "}
                  {day.holidays.map((holiday) => holiday.name).join(" / ")}
                  {day.released && <span className="text-emerald-600 dark:text-emerald-400"> (liberado)</span>}
                </p>
              ))}
            </div>
          )}
        </PopoverContent>
      </Popover>
      {hint !== null && (
        <p className="text-xs text-muted-foreground">
          {hint ??
            (maxDays === null
              ? "Selecione um dia ou um período."
              : `Selecione um dia ou um período de até ${maxDays} dias.`)}
        </p>
      )}
      {blocked > 0 && (
        <p className={usable > 0 ? "text-xs text-muted-foreground" : "text-xs text-destructive"}>
          {usable > 0
            ? `${usable} de ${total} dias reserváveis no período: fins de semana e feriados bloqueados não contam.`
            : "O período não tem nenhum dia liberado para reserva."}
        </p>
      )}
      {hasErrors && <FieldError errors={errors} />}
    </Field>
  );
}
