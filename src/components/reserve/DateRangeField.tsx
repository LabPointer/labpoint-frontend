import { addDays, format, startOfDay } from "date-fns";
import { ptBR } from "date-fns/locale";
import { CalendarIcon } from "lucide-react";
import type { DateRange } from "react-day-picker";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

/** Primeiro dia permitido para reservar (amanhã). */
export const firstAvailableDate = () => startOfDay(addDays(new Date(), 1));

/** Período máximo de uma reserva, em dias. */
const MAX_RANGE_DAYS = 30;

type DateRangeFieldProps = {
  id: string;
  label: string;
  value: DateRange | undefined;
  onChange: (range: DateRange | undefined) => void;
  errors?: ({ message?: string } | undefined)[];
  disabled?: boolean;
};

const fmt = (date: Date) => format(date, "dd/MM/yyyy", { locale: ptBR });

export function DateRangeField({ id, label, value, onChange, errors, disabled }: DateRangeFieldProps) {
  const minDate = firstAvailableDate();

  function handleSelect(range: DateRange | undefined) {
    // limita o período a MAX_RANGE_DAYS a partir do início
    const clamped =
      range?.from && range.to && range.to > addDays(range.from, MAX_RANGE_DAYS)
        ? { from: range.from, to: addDays(range.from, MAX_RANGE_DAYS) }
        : range;
    onChange(clamped);
  }

  const hasErrors = Boolean(errors?.length);

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
            defaultMonth={value?.from ?? minDate}
            selected={value}
            disabled={{ before: minDate }}
            onSelect={handleSelect}
            numberOfMonths={1}
          />
        </PopoverContent>
      </Popover>
      <p className="text-xs text-muted-foreground">Selecione um dia ou um período de até {MAX_RANGE_DAYS} dias.</p>
      {hasErrors && <FieldError errors={errors} />}
    </Field>
  );
}
