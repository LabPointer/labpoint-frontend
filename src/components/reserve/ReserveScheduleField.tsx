import { useMemo } from "react";
import type { DateRange } from "react-day-picker";
import { useExistingSchedules } from "#/lib/queries/reserves";
import { SCHEDULE_OPTIONS_LIMIT, scheduleLabel, sortSchedules, useSchedules } from "#/lib/queries/schedules";
import { RemoteMultiCombobox, type RemoteOption } from "@/components/shared/RemoteCombobox";
import { Checkbox } from "@/components/ui/checkbox";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";

type ReserveScheduleFieldProps = {
  id: string;
  spaceId: number;
  range: DateRange | undefined;
  value: RemoteOption[];
  onChange: (value: RemoteOption[]) => void;
  /** Horários da própria reserva (edição): não contam como ocupados. */
  ownScheduleIds?: number[];
  errors?: ({ message?: string } | undefined)[];
};

/**
 * Horários reserváveis: todos os horários ativos de `/schedule` menos os já ocupados no espaço
 * dentro do período escolhido (`/space-reserve/existing-schedules`).
 */
export function ReserveScheduleField({
  id,
  spaceId,
  range,
  value,
  onChange,
  ownScheduleIds = [],
  errors,
}: ReserveScheduleFieldProps) {
  const schedules = useSchedules({ enabled: true, limit: SCHEDULE_OPTIONS_LIMIT });
  const existing = useExistingSchedules(spaceId, range);

  const options = useMemo<RemoteOption[]>(() => {
    const occupied = new Set((existing.data ?? []).map((schedule) => Number(schedule.id)));
    for (const ownId of ownScheduleIds) occupied.delete(ownId);

    return sortSchedules(schedules.data ?? [])
      .filter((schedule) => !occupied.has(Number(schedule.id)))
      .map((schedule) => ({ id: Number(schedule.id), name: scheduleLabel(schedule) }));
  }, [schedules.data, existing.data, ownScheduleIds]);

  const hasRange = Boolean(range?.from);
  const isLoading = schedules.isPending || (hasRange && existing.isFetching);
  const isError = schedules.isError || existing.isError;
  const disabled = !hasRange || isLoading || isError || options.length === 0;
  const allSelected = options.length > 0 && value.length === options.length;
  const hasErrors = Boolean(errors?.length);

  const placeholder = !hasRange
    ? "Selecione o período primeiro"
    : isLoading
      ? "Carregando horários..."
      : isError
        ? "Erro ao carregar horários"
        : options.length === 0
          ? "Nenhum horário disponível"
          : "Selecione os horários";

  return (
    <Field data-invalid={hasErrors}>
      <div className="flex items-center justify-between gap-2">
        <FieldLabel htmlFor={id}>Horários</FieldLabel>
        <Field orientation="horizontal" className="w-fit">
          <Checkbox
            id={`${id}-all`}
            disabled={disabled}
            checked={allSelected}
            onCheckedChange={(checked) => onChange(checked ? options : [])}
          />
          <FieldLabel htmlFor={`${id}-all`} className="text-sm font-medium">
            Selecionar tudo
          </FieldLabel>
        </Field>
      </div>
      <RemoteMultiCombobox
        id={id}
        label=""
        options={options}
        isLoading={isLoading}
        isError={isError}
        value={value}
        onValueChange={onChange}
        disabled={disabled}
        placeholder={placeholder}
        emptyText="Nenhum horário encontrado."
      />
      {hasErrors && <FieldError errors={errors} />}
    </Field>
  );
}
