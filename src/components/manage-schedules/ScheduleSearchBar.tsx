import { useDebounce } from "ahooks";
import { PlusIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "../ui/button";
import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
  ComboboxValue,
} from "../ui/combobox";
import { Field, FieldLabel } from "../ui/field";

export type ScheduleFilters = {
  shift: number | undefined;
  enabled: boolean | undefined;
};

export type ScheduleSearchBarProps = {
  onSearch: (filters: ScheduleFilters) => void;
  onAddNewSchedule: () => void;
};

const statusRecord: Record<string, boolean | undefined> = {
  "Todos os status": undefined,
  Ativo: true,
  Inativo: false,
};

const shiftRecord: Record<string, number | undefined> = {
  "Todos os turnos": undefined,
  Manha: 0,
  Tarde: 1,
  Noite: 2,
};

export default function ManageScheduleSearchBar({ onSearch, onAddNewSchedule }: ScheduleSearchBarProps) {
  const statuses = ["Todos os status", "Ativo", "Inativo"];
  const [status, setStatus] = useState(statuses[0]);
  const shifts = ["Todos os turnos", "Manha", "Tarde", "Noite"];
  const [shift, setShift] = useState(shifts[0]);
  const debouncedStatus: ScheduleFilters = useDebounce(
    { enabled: statusRecord[status], shift: shiftRecord[shift] },
    { wait: 500 },
  );

  useEffect(() => {
    onSearch({ shift: shiftRecord[shift], enabled: statusRecord[status] });
  }, [debouncedStatus]);

  return (
    <div className="flex flex-col gap-4 rounded-lg border bg-white p-4 shadow-md hover:shadow-lg dark:border-violet-500/10 dark:bg-white/5 dark:shadow-violet-300/15">
      <Field className="w-full">
        <FieldLabel htmlFor="space-status" className="font-bold">
          Turno
        </FieldLabel>
        <Combobox items={shifts} value={shift} onValueChange={(value) => setShift(value ?? shifts[0])}>
          <ComboboxInput
            id="space-status"
            aria-label="Filtrar por turno"
            placeholder="Todos os turnos"
            className="w-full"
            showClear={false}
          />
          <ComboboxContent>
            <ComboboxEmpty>Nenhum turno encontrado.</ComboboxEmpty>
            <ComboboxList>
              {(item) => (
                <ComboboxItem key={item} value={item}>
                  <ComboboxValue>{item}</ComboboxValue>
                </ComboboxItem>
              )}
            </ComboboxList>
          </ComboboxContent>
        </Combobox>
      </Field>

      <Field className="w-full">
        <FieldLabel htmlFor="space-status" className="font-bold">
          Status
        </FieldLabel>
        <Combobox items={statuses} value={status} onValueChange={(value) => setStatus(value ?? statuses[0])}>
          <ComboboxInput
            id="space-status"
            aria-label="Filtrar por status"
            placeholder="Todos os status"
            className="w-full"
            showClear={false}
          />
          <ComboboxContent>
            <ComboboxEmpty>Nenhum status encontrado.</ComboboxEmpty>
            <ComboboxList>
              {(item) => (
                <ComboboxItem key={item} value={item}>
                  <ComboboxValue>{item}</ComboboxValue>
                </ComboboxItem>
              )}
            </ComboboxList>
          </ComboboxContent>
        </Combobox>
      </Field>

      <Button className="w-full shrink-0 lg:w-auto" type="button" onClick={onAddNewSchedule}>
        <PlusIcon />
        Adicionar Horario
      </Button>
    </div>
  );
}
