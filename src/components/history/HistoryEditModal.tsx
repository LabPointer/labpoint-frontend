import { useForm, useStore } from "@tanstack/react-form";
import { parseISO } from "date-fns";
import { useMemo } from "react";
import type { DateRange } from "react-day-picker";
import z from "zod";
import type { Reserve } from "#/lib/queries/reserves";
import { isActiveReserveStatus } from "#/lib/queries/resource-reserves";
import { scheduleLabel, sortSchedules } from "#/lib/queries/schedules";
import { DateRangeField, firstAvailableDate } from "@/components/reserve/DateRangeField";
import { type ReservedResource, ReserveResourcesField } from "@/components/reserve/ReserveResourcesField";
import { ReserveScheduleField } from "@/components/reserve/ReserveScheduleField";
import { FormDialog } from "@/components/shared/FormDialog";
import type { RemoteOption } from "@/components/shared/RemoteCombobox";

export type HistoryEditFormData = {
  range: DateRange;
  schedules: RemoteOption[];
  /** Conjunto final de recursos vinculados (adicionar/remover/alterar quantidade). */
  resources: ReservedResource[];
};

type HistoryEditModalProps = {
  reserve: Reserve;
  open: boolean;
  onClose: () => void;
  onSubmit: (data: HistoryEditFormData) => Promise<void>;
};

const formSchema = z.object({
  range: z
    .custom<DateRange | undefined>()
    .refine((range) => Boolean(range?.from), "Selecione a data da reserva.")
    .refine(
      (range) => !range?.from || range.from >= firstAvailableDate(),
      "A nova data deve começar a partir de amanhã.",
    ),
  schedules: z.array(z.object({ id: z.number(), name: z.string() })).min(1, "Selecione pelo menos um horário."),
  resources: z.array(
    z.object({ id: z.number(), name: z.string(), quantity: z.number().int().min(1, "Quantidade mínima: 1.") }),
  ),
});

/** Recursos ativos (pendentes ou confirmados) vinculados à reserva de sala. */
export function activeLinkedResources(reserve: Reserve): ReservedResource[] {
  return (reserve.resources ?? [])
    .filter((resource) => isActiveReserveStatus(resource.status))
    .map((resource) => ({ id: Number(resource.resourceId), name: resource.name, quantity: Number(resource.quantity) }));
}

/**
 * Altera período, horários e recursos de uma reserva. Os valores iniciais vêm da própria reserva (já carregada
 * na listagem). As unidades e horários da própria reserva não contam como ocupados, então só somem das opções os
 * recursos que conflitam com o horário já definido. O pai deve remontar o modal (`key`) a cada abertura.
 */
export function HistoryEditModal({ reserve, open, onClose, onSubmit }: HistoryEditModalProps) {
  const ownScheduleIds = useMemo(() => reserve.schedules.map((schedule) => Number(schedule.id)), [reserve.schedules]);
  const exclude = useMemo(() => ({ spaceReserveId: Number(reserve.id) }), [reserve.id]);

  const form = useForm({
    defaultValues: {
      range: { from: parseISO(reserve.dateFrom), to: parseISO(reserve.dateTo) } as DateRange | undefined,
      schedules: sortSchedules(reserve.schedules).map((schedule) => ({
        id: Number(schedule.id),
        name: scheduleLabel(schedule),
      })) as RemoteOption[],
      resources: activeLinkedResources(reserve),
    },
    validators: { onSubmit: formSchema },
    onSubmit: async ({ value }) => {
      if (!value.range?.from) return;
      await onSubmit({ range: value.range, schedules: value.schedules, resources: value.resources });
    },
  });

  const isSubmitting = useStore(form.store, (state) => state.isSubmitting);

  return (
    <FormDialog
      open={open}
      onClose={() => {
        form.reset();
        onClose();
      }}
      title="Alterar reserva"
      description={`${reserve.space.name} — ${reserve.purpose}`}
      formId="history-edit-form"
      submitLabel="Salvar"
      isSubmitting={isSubmitting}
      onSubmit={() => form.handleSubmit()}
      onReset={() => form.reset()}
    >
      <form.Field name="range">
        {(field) => (
          <DateRangeField
            id="history-date-range"
            calendarRules="block"
            label="Nova data"
            value={field.state.value}
            errors={field.state.meta.isTouched ? field.state.meta.errors : undefined}
            onChange={(range) => {
              field.handleChange(range);
              form.setFieldValue("schedules", []);
            }}
          />
        )}
      </form.Field>

      <form.Subscribe
        selector={(state) => ({
          range: state.values.range,
          schedules: state.values.schedules,
          resources: state.values.resources,
        })}
      >
        {({ range, schedules, resources }) => (
          <>
            <form.Field name="resources">
              {(field) => (
                <ReserveResourcesField
                  id="history-resources"
                  range={range}
                  scheduleIds={schedules.map((schedule) => schedule.id)}
                  exclude={exclude}
                  value={field.state.value}
                  onChange={field.handleChange}
                  errors={field.state.meta.isTouched ? field.state.meta.errors : undefined}
                />
              )}
            </form.Field>
            <form.Field name="schedules">
              {(field) => (
                <ReserveScheduleField
                  id="history-schedules"
                  spaceId={Number(reserve.space.id)}
                  range={range}
                  ownScheduleIds={ownScheduleIds}
                  resources={resources}
                  exclude={exclude}
                  value={field.state.value}
                  onChange={field.handleChange}
                  errors={field.state.meta.isTouched ? field.state.meta.errors : undefined}
                />
              )}
            </form.Field>
          </>
        )}
      </form.Subscribe>
    </FormDialog>
  );
}
