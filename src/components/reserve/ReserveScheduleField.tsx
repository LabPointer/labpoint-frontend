import { useEffect, useMemo } from "react";
import type { DateRange } from "react-day-picker";
import { useExistingSchedules } from "#/lib/queries/reserves";
import { type ReserveExclusion, useResourcesAvailability } from "#/lib/queries/resources";
import { SCHEDULE_OPTIONS_LIMIT, scheduleLabel, sortSchedules, useSchedules } from "#/lib/queries/schedules";
import { RemoteMultiCombobox, type RemoteOption } from "@/components/shared/RemoteCombobox";
import { Checkbox } from "@/components/ui/checkbox";
import { Field, FieldDescription, FieldError, FieldLabel } from "@/components/ui/field";

/** Recurso escolhido na reserva e quantas unidades. */
export type ResourceDemandItem = { id: number; quantity: number };

type ReserveScheduleFieldProps = {
  id: string;
  /** Sala da reserva. Sem sala (reserva só de recurso), só a disponibilidade dos recursos conta. */
  spaceId?: number;
  range: DateRange | undefined;
  value: RemoteOption[];
  onChange: (value: RemoteOption[]) => void;
  /** Horários da própria reserva de sala (edição): não contam como ocupados. */
  ownScheduleIds?: number[];
  /** Recursos pedidos: um horário só aparece se todos tiverem unidades livres suficientes nele. */
  resources?: ResourceDemandItem[];
  /** Edição: as unidades da própria reserva não contam como ocupadas. */
  exclude?: ReserveExclusion;
  errors?: ({ message?: string } | undefined)[];
};

const NO_RESOURCES: ResourceDemandItem[] = [];

/**
 * Horários reserváveis: todos os horários ativos de `/schedule`, menos os já ocupados no espaço dentro do período
 * (`/space-reserve/existing-schedules`) e menos os horários em que algum recurso escolhido não tem unidades livres
 * suficientes (`/resource-reserve/availability`). Se a troca de período, recurso ou quantidade tornar inválido um
 * horário já selecionado, ele sai da seleção.
 */
export function ReserveScheduleField({
  id,
  spaceId,
  range,
  value,
  onChange,
  ownScheduleIds = [],
  resources = NO_RESOURCES,
  exclude,
  errors,
}: ReserveScheduleFieldProps) {
  const schedules = useSchedules({ enabled: true, limit: SCHEDULE_OPTIONS_LIMIT });
  const existing = useExistingSchedules(spaceId, range);
  const resourceIds = useMemo(() => resources.map((resource) => resource.id), [resources]);
  const availability = useResourcesAvailability(resourceIds, range, exclude);

  const { options, blockedByResources } = useMemo(() => {
    const occupied = new Set((existing.data ?? []).map((schedule) => Number(schedule.id)));
    for (const ownId of ownScheduleIds) occupied.delete(ownId);

    let blocked = 0;
    const list = sortSchedules(schedules.data ?? [])
      .filter((schedule) => {
        const scheduleId = Number(schedule.id);
        if (occupied.has(scheduleId)) return false;

        const lacksUnits = resources.some((resource) => {
          const free = availability.byResource.get(resource.id)?.get(scheduleId);
          return free !== undefined && free < resource.quantity;
        });
        if (lacksUnits) blocked++;
        return !lacksUnits;
      })
      .map((schedule) => ({ id: Number(schedule.id), name: scheduleLabel(schedule) }));

    return { options: list, blockedByResources: blocked };
  }, [schedules.data, existing.data, ownScheduleIds, resources, availability.byResource]);

  const hasRange = Boolean(range?.from);
  const isLoading = schedules.isPending || (hasRange && (existing.isFetching || availability.isFetching));
  const isError = schedules.isError || existing.isError || availability.isError;
  const disabled = !hasRange || isLoading || isError || options.length === 0;
  const allSelected = options.length > 0 && value.length === options.length;
  const hasErrors = Boolean(errors?.length);

  // Horário selecionado que deixou de estar disponível (ex.: recurso esgotado nele) sai da seleção.
  const optionIds = useMemo(() => new Set(options.map((option) => option.id)), [options]);
  useEffect(() => {
    if (!hasRange || isLoading || isError) return;
    const stillValid = value.filter((option) => optionIds.has(option.id));
    if (stillValid.length !== value.length) onChange(stillValid);
  }, [hasRange, isLoading, isError, value, optionIds, onChange]);

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
      {hasRange && !isLoading && blockedByResources > 0 && (
        <FieldDescription>
          {blockedByResources === 1 ? "1 horário oculto" : `${blockedByResources} horários ocultos`}: os recursos
          escolhidos não têm unidades livres suficientes neles.
        </FieldDescription>
      )}
      {hasErrors && <FieldError errors={errors} />}
    </Field>
  );
}
