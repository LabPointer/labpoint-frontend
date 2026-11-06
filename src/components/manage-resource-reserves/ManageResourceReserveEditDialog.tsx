import { useForm, useStore } from "@tanstack/react-form";
import { parseISO } from "date-fns";
import { useMemo } from "react";
import type { DateRange } from "react-day-picker";
import z from "zod";
import { RESERVE_STATUS } from "#/lib/queries/reserves";
import type { AdminResourceReserve } from "#/lib/queries/resource-reserves";
import type { ReserveExclusion } from "#/lib/queries/resources";
import { scheduleLabel, sortSchedules } from "#/lib/queries/schedules";
import type { ReservationStatus } from "#/lib/types/reservation-types";
import { statusLabel } from "#/lib/utils/reservation-utils";
import { DateRangeField } from "@/components/reserve/DateRangeField";
import { ReserveScheduleField } from "@/components/reserve/ReserveScheduleField";
import { FilterSelect } from "@/components/shared/FilterSelect";
import { FormDialog } from "@/components/shared/FormDialog";
import type { RemoteOption } from "@/components/shared/RemoteCombobox";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";

export type ManageResourceReserveEditData = {
  range: DateRange;
  schedules: RemoteOption[];
  quantity: number;
  status: number;
};

type ManageResourceReserveEditDialogProps = {
  reserve: AdminResourceReserve;
  open: boolean;
  onClose: () => void;
  onSubmit: (data: ManageResourceReserveEditData) => Promise<void>;
};

// "Bloqueada" é só de sala: não se aplica à reserva de recurso
const statusOptions = (Object.keys(RESERVE_STATUS) as ReservationStatus[])
  .filter((key) => key !== "BLOCKED")
  .map((key) => ({ label: statusLabel(key), value: RESERVE_STATUS[key] }));

/** Admin: altera status, período, horários e quantidade. Sem data mínima. O pai deve remontar (`key`) a cada abertura. */
export function ManageResourceReserveEditDialog({
  reserve,
  open,
  onClose,
  onSubmit,
}: ManageResourceReserveEditDialogProps) {
  const total = Number(reserve.resource.quantity ?? reserve.quantity);
  const linked = reserve.spaceReserve;
  const ownScheduleIds = useMemo(() => reserve.schedules.map((schedule) => Number(schedule.id)), [reserve.schedules]);
  const exclude = useMemo<ReserveExclusion>(
    () => (linked ? { spaceReserveId: Number(linked.id) } : { resourceReserveId: Number(reserve.id) }),
    [linked, reserve.id],
  );

  const formSchema = useMemo(
    () =>
      z.object({
        range: z
          .custom<DateRange | undefined>()
          .refine((range) => Boolean(range?.from), "Selecione a data da reserva."),
        schedules: z.array(z.object({ id: z.number(), name: z.string() })).min(1, "Selecione pelo menos um horário."),
        quantity: z
          .number({ error: "Informe a quantidade." })
          .int("A quantidade deve ser um número inteiro.")
          .min(1, "Quantidade mínima: 1.")
          .max(total, `O recurso tem ${total} unidade(s).`),
        status: z.number(),
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
      status: Number(reserve.status),
    },
    validators: { onSubmit: formSchema },
    onSubmit: async ({ value }) => {
      if (!value.range?.from) return;
      await onSubmit({
        range: value.range,
        schedules: value.schedules,
        quantity: value.quantity,
        status: value.status,
      });
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
      description={`${reserve.resource.name} — ${reserve.account.username}`}
      headerExtra={
        linked ? (
          <Alert>
            <AlertDescription>
              Reserva feita junto com a sala <strong>{linked.spaceName}</strong>. Mudar o período ou os horários altera
              também a reserva da sala. O status muda só o recurso.
            </AlertDescription>
          </Alert>
        ) : undefined
      }
      formId="manage-resource-reserve-edit-form"
      submitLabel="Salvar"
      isSubmitting={isSubmitting}
      onSubmit={() => form.handleSubmit()}
      onReset={() => form.reset()}
    >
      <form.Field name="range">
        {(field) => (
          <DateRangeField
            id="manage-resource-reserve-range"
            label="Período"
            minDate={null}
            maxDays={null}
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
              <FieldLabel htmlFor="manage-resource-reserve-quantity">Quantidade</FieldLabel>
              <Input
                id="manage-resource-reserve-quantity"
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
                id="manage-resource-reserve-schedules"
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

      <form.Field name="status">
        {(field) => (
          <FilterSelect
            id="manage-resource-reserve-status"
            label="Status"
            options={statusOptions}
            value={field.state.value}
            onValueChange={field.handleChange}
            className="w-full"
          />
        )}
      </form.Field>
    </FormDialog>
  );
}
