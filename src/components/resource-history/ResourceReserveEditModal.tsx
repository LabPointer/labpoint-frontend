import { useForm, useStore } from "@tanstack/react-form";
import { parseISO } from "date-fns";
import { useMemo } from "react";
import type { DateRange } from "react-day-picker";
import z from "zod";
import type { ResourceReserve } from "#/lib/queries/resource-reserves";
import type { ReserveExclusion } from "#/lib/queries/resources";
import { scheduleLabel, sortSchedules } from "#/lib/queries/schedules";
import { DateRangeField, firstAvailableDate } from "@/components/reserve/DateRangeField";
import { ReserveScheduleField } from "@/components/reserve/ReserveScheduleField";
import { FormDialog } from "@/components/shared/FormDialog";
import type { RemoteOption } from "@/components/shared/RemoteCombobox";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";

export type ResourceReserveEditFormData = {
  range: DateRange;
  schedules: RemoteOption[];
  quantity: number;
};

type ResourceReserveEditModalProps = {
  reserve: ResourceReserve;
  open: boolean;
  onClose: () => void;
  onSubmit: (data: ResourceReserveEditFormData) => Promise<void>;
};

/**
 * Altera período, horários e quantidade de uma reserva de recurso. Se ela estiver vinculada a uma sala, a mudança
 * de período/horários vale também para a reserva da sala (o backend confere a sala e os demais recursos dela).
 * O pai deve remontar o modal (`key`) a cada abertura.
 */
export function ResourceReserveEditModal({ reserve, open, onClose, onSubmit }: ResourceReserveEditModalProps) {
  const total = Number(reserve.resource.quantity ?? reserve.quantity);
  const linked = reserve.spaceReserve;
  const ownScheduleIds = useMemo(() => reserve.schedules.map((schedule) => Number(schedule.id)), [reserve.schedules]);
  // vinculada: as unidades de TODA a reserva de sala não contam (inclusive esta); avulsa: só esta reserva
  const exclude = useMemo<ReserveExclusion>(
    () => (linked ? { spaceReserveId: Number(linked.id) } : { resourceReserveId: Number(reserve.id) }),
    [linked, reserve.id],
  );

  const formSchema = useMemo(
    () =>
      z.object({
        range: z
          .custom<DateRange | undefined>()
          .refine((range) => Boolean(range?.from), "Selecione a data da reserva.")
          .refine(
            (range) => !range?.from || range.from >= firstAvailableDate(),
            "A nova data deve começar a partir de amanhã.",
          ),
        schedules: z.array(z.object({ id: z.number(), name: z.string() })).min(1, "Selecione pelo menos um horário."),
        quantity: z
          .number({ error: "Informe a quantidade." })
          .int("A quantidade deve ser um número inteiro.")
          .min(1, "Quantidade mínima: 1.")
          .max(total, `O recurso tem ${total} unidade(s).`),
      }),
    [total],
  );

  const form = useForm({
    defaultValues: {
      range: { from: parseISO(reserve.dateFrom), to: parseISO(reserve.dateTo) } as DateRange | undefined,
      schedules: sortSchedules(reserve.schedules).map((schedule) => ({
        id: Number(schedule.id),
        name: scheduleLabel(schedule),
      })) as RemoteOption[],
      quantity: Number(reserve.quantity),
    },
    validators: { onSubmit: formSchema },
    onSubmit: async ({ value }) => {
      if (!value.range?.from) return;
      await onSubmit({ range: value.range, schedules: value.schedules, quantity: value.quantity });
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
      title="Alterar reserva de recurso"
      description={`${reserve.resource.name} — ${reserve.purpose}`}
      headerExtra={
        linked ? (
          <Alert>
            <AlertDescription>
              Esta reserva foi feita junto com a sala <strong>{linked.spaceName}</strong>. Mudar o período ou os
              horários altera também a reserva da sala e os outros recursos dela.
            </AlertDescription>
          </Alert>
        ) : undefined
      }
      formId="resource-reserve-edit-form"
      submitLabel="Salvar"
      isSubmitting={isSubmitting}
      onSubmit={() => form.handleSubmit()}
      onReset={() => form.reset()}
    >
      <form.Field name="range">
        {(field) => (
          <DateRangeField
            id="resource-edit-range"
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

      <form.Field name="quantity">
        {(field) => {
          const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
          return (
            <Field data-invalid={isInvalid}>
              <FieldLabel htmlFor="resource-edit-quantity">Quantidade</FieldLabel>
              <Input
                id="resource-edit-quantity"
                type="number"
                inputMode="numeric"
                min={1}
                max={total}
                value={Number.isNaN(field.state.value) ? "" : field.state.value}
                onBlur={field.handleBlur}
                onChange={(event) => field.handleChange(event.target.valueAsNumber)}
                aria-invalid={isInvalid}
              />
              {isInvalid && <FieldError errors={field.state.meta.errors} />}
            </Field>
          );
        }}
      </form.Field>

      <form.Subscribe selector={(state) => ({ range: state.values.range, quantity: state.values.quantity })}>
        {({ range, quantity }) => (
          <form.Field name="schedules">
            {(field) => (
              <ReserveScheduleField
                id="resource-edit-schedules"
                // vinculada: o horário também precisa estar livre na sala
                spaceId={linked ? Number(linked.spaceId) : undefined}
                ownScheduleIds={linked ? ownScheduleIds : undefined}
                range={range}
                resources={[
                  {
                    id: Number(reserve.resource.id),
                    quantity: Number.isInteger(quantity) && quantity > 0 ? quantity : 1,
                  },
                ]}
                exclude={exclude}
                value={field.state.value}
                onChange={field.handleChange}
                errors={field.state.meta.isTouched ? field.state.meta.errors : undefined}
              />
            )}
          </form.Field>
        )}
      </form.Subscribe>
    </FormDialog>
  );
}
