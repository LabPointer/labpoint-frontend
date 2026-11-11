import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { CalendarIcon } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Field, FieldLabel } from "@/components/ui/field";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

type DatePickerFieldProps = {
  id: string;
  label: string;
  value: Date | undefined;
  onChange: (date: Date | undefined) => void;
  placeholder?: string;
  disabled?: boolean;
};

/** Campo de uma data só: botão que abre o calendário do shadcn num popover (mesmo visual do DateRangeField). */
export function DatePickerField({
  id,
  label,
  value,
  onChange,
  placeholder = "Selecione a data",
  disabled,
}: DatePickerFieldProps) {
  const [open, setOpen] = useState(false);

  return (
    <Field>
      <FieldLabel htmlFor={id}>{label}</FieldLabel>
      <Popover open={open} onOpenChange={setOpen}>
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
              {value ? (
                format(value, "dd/MM/yyyy", { locale: ptBR })
              ) : (
                <span className="text-muted-foreground">{placeholder}</span>
              )}
            </Button>
          }
        />
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            locale={ptBR}
            selected={value}
            defaultMonth={value}
            onSelect={(date) => {
              onChange(date);
              if (date) setOpen(false);
            }}
          />
        </PopoverContent>
      </Popover>
    </Field>
  );
}
