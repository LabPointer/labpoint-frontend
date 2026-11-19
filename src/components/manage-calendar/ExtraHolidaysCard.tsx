import { format } from "date-fns";
import { Trash2 } from "lucide-react";
import { type FormEvent, useState } from "react";
import {
  type CalendarDay,
  HOLIDAY_SOURCE,
  holidaySourceLabel,
  parseApiDate,
  useAddHoliday,
  useRemoveHoliday,
} from "#/lib/queries/calendar";
import { toApiDate } from "#/lib/queries/reserves";
import { succeeded } from "#/lib/utils/api-result";
import { DatePickerField } from "@/components/shared/DatePickerField";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Field, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";

type ExtraHolidaysCardProps = {
  year: number;
  /** Dias do ano inteiro. */
  days: CalendarDay[];
};

/**
 * Feriados do ano. Os nacionais, estaduais e municipais vêm prontos; a coordenação cadastra os extras (recesso,
 * ponte, feriado decretado), que bloqueiam o dia como qualquer feriado.
 */
export function ExtraHolidaysCard({ year, days }: ExtraHolidaysCardProps) {
  const addHoliday = useAddHoliday();
  const removeHoliday = useRemoveHoliday();
  const [date, setDate] = useState<Date | undefined>();
  const [name, setName] = useState("");

  const holidays = days.flatMap((day) => day.holidays.map((holiday) => ({ ...holiday, released: day.released })));
  const canSubmit = date !== undefined && name.trim().length >= 2 && !addHoliday.isPending;

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (!canSubmit || !date) return;
    if (await succeeded(addHoliday.mutateAsync({ date: toApiDate(date), name: name.trim() }))) {
      setDate(undefined);
      setName("");
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h3 className="font-bold">Feriados de {year}</h3>
        <p className="text-xs text-muted-foreground">
          Nacionais, de Goiás e de Anápolis entram sozinhos. Cadastre aqui recessos e outros dias sem aula.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="grid gap-3 sm:grid-cols-[10rem_1fr_auto] sm:items-end">
        <DatePickerField id="holiday-date" label="Data" value={date} onChange={setDate} />
        <Field>
          <FieldLabel htmlFor="holiday-name">Nome</FieldLabel>
          <Input
            id="holiday-name"
            placeholder="Ex.: Recesso escolar"
            maxLength={100}
            value={name}
            onChange={(event) => setName(event.target.value)}
          />
        </Field>
        <Button type="submit" disabled={!canSubmit}>
          Adicionar feriado
        </Button>
      </form>

      <ul className="flex flex-col divide-y rounded-md border dark:border-violet-500/10">
        {holidays.length === 0 && <li className="px-3 py-2 text-sm text-muted-foreground">Nenhum feriado no ano.</li>}
        {holidays.map((holiday) => {
          const custom = Number(holiday.source) === HOLIDAY_SOURCE.CUSTOM;
          return (
            <li key={holiday.id} className="flex items-center gap-3 px-3 py-2 text-sm">
              <span className="w-12 shrink-0 font-medium tabular-nums">
                {format(parseApiDate(holiday.date), "dd/MM")}
              </span>
              <span className="min-w-0 flex-1 truncate">{holiday.name}</span>
              {holiday.released && <span className="text-xs text-emerald-600 dark:text-emerald-400">Liberado</span>}
              <Badge variant="outline">{holidaySourceLabel(holiday.source)}</Badge>
              {custom ? (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  aria-label={`Remover ${holiday.name}`}
                  disabled={removeHoliday.isPending}
                  onClick={() => removeHoliday.mutate(Number(holiday.id))}
                >
                  <Trash2 />
                </Button>
              ) : (
                <span className="size-7 shrink-0" aria-hidden="true" />
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
