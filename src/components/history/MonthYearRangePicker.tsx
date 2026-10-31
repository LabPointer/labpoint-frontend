import { CalendarIcon } from "lucide-react";
import { useMemo, useState } from "react";
import {
  currentMonthYear,
  formatMonthYear,
  formatMonthYearPeriod,
  type MonthYear,
  type MonthYearRange,
  normalizeRange,
} from "#/lib/utils/month-year";
import { Button } from "@/components/ui/button";
import { Field, FieldLabel } from "@/components/ui/field";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { MonthYearGrid } from "./MonthYearGrid";

type MonthYearRangePickerProps = {
  value?: MonthYearRange;
  defaultValue?: MonthYearRange;
  /** Chamado quando o período muda. Um mês só vem como `from` e `to` iguais. */
  onChange?: (value: MonthYearRange) => void;
  /** Último mês selecionável (também limita o ano máximo da lista). */
  maxMonth?: MonthYear;
  minYear?: number;
  maxYear?: number;
  disabled?: boolean;
  className?: string;
  /** Texto acima do botão; `null` esconde. */
  label?: string | null;
  placeholder?: string;
  id?: string;
};

/**
 * Seletor de mês ou de sequência de meses, no estilo do calendar range do shadcn:
 * um clique escolhe o mês inicial e o segundo clique o final. Clicar duas vezes no mesmo mês
 * (ou fechar o popover depois do primeiro clique) seleciona só aquele mês.
 */
export function MonthYearRangePicker({
  value,
  defaultValue,
  onChange,
  maxMonth,
  minYear,
  maxYear,
  disabled,
  className,
  label = "Período",
  placeholder = "Selecione o período",
  id,
}: MonthYearRangePickerProps) {
  const today = currentMonthYear();
  const resolvedMinYear = minYear ?? today.year - 10;
  const resolvedMaxYear = maxYear ?? maxMonth?.year ?? today.year + 2;
  const years = useMemo(
    () => Array.from({ length: resolvedMaxYear - resolvedMinYear + 1 }, (_, index) => resolvedMinYear + index),
    [resolvedMinYear, resolvedMaxYear],
  );

  const [uncontrolled, setUncontrolled] = useState<MonthYearRange>(defaultValue ?? {});
  const selected = value ?? uncontrolled;
  const [open, setOpen] = useState(false);
  /** Primeiro clique de uma seleção em andamento (ainda sem o mês final). */
  const [anchor, setAnchor] = useState<MonthYear | undefined>();
  const [viewYear, setViewYear] = useState(selected.from?.year ?? maxMonth?.year ?? today.year);
  const [hoverMonth, setHoverMonth] = useState<MonthYear | undefined>();

  function commit(next: MonthYearRange) {
    const normalized = normalizeRange(next);
    if (value === undefined) setUncontrolled(normalized);
    onChange?.(normalized);
  }

  function handleOpenChange(nextOpen: boolean) {
    if (nextOpen) {
      setViewYear(selected.from?.year ?? maxMonth?.year ?? today.year);
    } else if (anchor) {
      // Fechou depois do primeiro clique: vale como um mês só.
      commit({ from: anchor, to: anchor });
    }
    setAnchor(undefined);
    setHoverMonth(undefined);
    setOpen(nextOpen);
  }

  function handleSelectMonth(month: number) {
    const picked = { month, year: viewYear };

    if (!anchor) {
      setAnchor(picked);
      return;
    }

    commit({ from: anchor, to: picked });
    setAnchor(undefined);
    setHoverMonth(undefined);
    setOpen(false);
  }

  const { from, to } = selected;
  const triggerLabel = from && to ? formatMonthYearPeriod({ from, to }) : from ? formatMonthYear(from) : placeholder;

  return (
    <Field className={cn("w-fit", className)}>
      {label && (
        <FieldLabel htmlFor={id} className="text-sm font-semibold text-neutral-800 dark:text-neutral-200">
          {label}
        </FieldLabel>
      )}
      <Popover open={open} onOpenChange={handleOpenChange}>
        <PopoverTrigger
          id={id}
          disabled={disabled}
          render={
            <Button
              variant="outline"
              className="h-10 min-w-72 justify-between bg-white/10 border dark:border-violet-400/20 shadow-md hover:shadow-lg dark:shadow-violet-300/20"
            />
          }
        >
          <span className="flex items-center gap-2">
            <CalendarIcon className="size-4 text-violet-500 dark:text-violet-400" />
            <span className={cn(!from && "text-muted-foreground")}>{triggerLabel}</span>
          </span>
        </PopoverTrigger>
        <PopoverContent align="start" className="w-72 p-3">
          <p className="px-1 text-xs text-muted-foreground">
            {anchor
              ? "Escolha o mês final, ou clique no mesmo mês para selecionar só ele"
              : "Escolha um mês ou o primeiro e o último mês do período"}
          </p>
          <MonthYearGrid
            viewYear={viewYear}
            years={years}
            maxMonth={maxMonth}
            rangeStart={anchor ?? selected.from}
            rangeEnd={anchor ? undefined : selected.to}
            hoverMonth={hoverMonth}
            onViewYearChange={setViewYear}
            onSelectMonth={handleSelectMonth}
            onHoverMonth={setHoverMonth}
          />
        </PopoverContent>
      </Popover>
    </Field>
  );
}
