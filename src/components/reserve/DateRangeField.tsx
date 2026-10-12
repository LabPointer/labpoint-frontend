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
const DEFAULT_MAX_RANGE_DAYS = 30;

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
  value: DateRange | undefined;
  onChange: (range: DateRange | undefined) => void;
  errors?: ({ message?: string } | undefined)[];
  disabled?: boolean;
};

const fmt = (date: Date) => format(date, "dd/MM/yyyy", { locale: ptBR });

export function DateRangeField({
  id,
  label,
  minDate: minDateProp,
  maxDate,
  maxDays = DEFAULT_MAX_RANGE_DAYS,
  hint,
  value,
  onChange,
  errors,
  disabled,
}: DateRangeFieldProps) {
  const minDate = minDateProp === undefined ? firstAvailableDate() : minDateProp;

  function handleSelect(range: DateRange | undefined) {
    // limita o período a MAX_RANGE_DAYS a partir do início
    const clamped =
      maxDays !== null && range?.from && range.to && range.to > addDays(range.from, maxDays)
        ? { from: range.from, to: addDays(range.from, maxDays) }
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
            defaultMonth={value?.from ?? minDate ?? new Date()}
            selected={value}
            disabled={[...(minDate ? [{ before: minDate }] : []), ...(maxDate ? [{ after: maxDate }] : [])]}
            onSelect={handleSelect}
            // com um período já escolhido, o próximo clique começa um novo período (sem isso o clique só
            // estendia o intervalo anterior e não era possível trocar a data)
            resetOnSelect
            numberOfMonths={1}
          />
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
      {hasErrors && <FieldError errors={errors} />}
    </Field>
  );
}
