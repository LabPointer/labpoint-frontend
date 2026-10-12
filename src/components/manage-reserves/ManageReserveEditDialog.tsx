import { useForm, useStore } from "@tanstack/react-form";
import { parseISO } from "date-fns";
import { useMemo } from "react";
import type { DateRange } from "react-day-picker";
import z from "zod";
import type { AdminReserve } from "#/lib/queries/admin-reserves";
import { RESERVE_STATUS } from "#/lib/queries/reserves";
import { scheduleLabel, sortSchedules } from "#/lib/queries/schedules";
import type { ReservationStatus } from "#/lib/types/reservation-types";
import { statusLabel } from "#/lib/utils/reservation-utils";
import { DateRangeField } from "@/components/reserve/DateRangeField";
import { ReserveScheduleField } from "@/components/reserve/ReserveScheduleField";
import { FilterSelect } from "@/components/shared/FilterSelect";
import { FormDialog } from "@/components/shared/FormDialog";
import type { RemoteOption } from "@/components/shared/RemoteCombobox";

export type ManageReserveEditData = {
  range: DateRange;
  schedules: RemoteOption[];
  status: number;
};

type ManageReserveEditDialogProps = {
  reserve: AdminReserve;
  open: boolean;
  onClose: () => void;
  onSubmit: (data: ManageReserveEditData) => Promise<void>;
};

const statusOptions = (Object.keys(RESERVE_STATUS) as ReservationStatus[]).map((key) => ({
  label: statusLabel(key),
  value: RESERVE_STATUS[key],
}));

const formSchema = z.object({
  range: z.custom<DateRange | undefined>().refine((range) => Boolean(range?.from), "Selecione a data da reserva."),
  schedules: z.array(z.object({ id: z.number(), name: z.string() })).min(1, "Selecione pelo menos um horário."),
  status: z.number(),
});

/** Admin: altera dia, horários e status. Sem restrição de data mínima. O pai deve remontar (`key`) a cada abertura. */
export function ManageReserveEditDialog({ reserve, open, onClose, onSubmit }: ManageReserveEditDialogProps) {
  const ownScheduleIds = useMemo(() => reserve.schedules.map((schedule) => Number(schedule.id)), [reserve.schedules]);

  const form = useForm({
    defaultValues: {
      range: { from: parseISO(reserve.dateFrom), to: parseISO(reserve.dateTo) } as DateRange | undefined,
      schedules: sortSchedules(reserve.schedules).map((schedule) => ({
        id: Number(schedule.id),
        name: scheduleLabel(schedule),
      })) as RemoteOption[],
      status: Number(reserve.status),
    },
    validators: { onSubmit: formSchema },
    onSubmit: async ({ value }) => {
      if (!value.range?.from) return;
      await onSubmit({ range: value.range, schedules: value.schedules, status: value.status });
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
      description={`${reserve.spaces.name} — ${reserve.account.username}`}
      formId="manage-reserve-edit-form"
      submitLabel="Salvar"
      isSubmitting={isSubmitting}
      onSubmit={() => form.handleSubmit()}
      onReset={() => form.reset()}
    >
      <form.Field name="range">
        {(field) => (
          <DateRangeField
            id="manage-reserve-range"
            label="Dia da reserva"
            minDate={null}
            maxDays={null}
            value={field.state.value}
            errors={field.state.meta.isTouched ? field.state.meta.errors : undefined}
            onChange={(range) => {
              field.handleChange(range);
              // os horários disponíveis dependem do período: limpa a seleção ao trocar
              form.setFieldValue("schedules", []);
            }}
          />
        )}
      </form.Field>

      <form.Subscribe selector={(state) => state.values.range}>
        {(range) => (
          <form.Field name="schedules">
            {(field) => (
              <ReserveScheduleField
                id="manage-reserve-schedules"
                spaceId={Number(reserve.spaces.id)}
                range={range}
                ownScheduleIds={ownScheduleIds}
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
            id="manage-reserve-status"
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
