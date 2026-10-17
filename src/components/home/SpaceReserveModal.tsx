import { useForm, useStore } from "@tanstack/react-form";
import { addDays, startOfDay } from "date-fns";
import type { DateRange } from "react-day-picker";
import z from "zod";
import { DateRangeField } from "@/components/reserve/DateRangeField";
import { ReserveScheduleField } from "@/components/reserve/ReserveScheduleField";
import { FormDialog } from "@/components/shared/FormDialog";
import type { RemoteOption } from "@/components/shared/RemoteCombobox";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { InputGroup, InputGroupAddon, InputGroupText, InputGroupTextarea } from "@/components/ui/input-group";
import { useRouteContext } from "@tanstack/react-router";
import { BooleanField } from "../shared/BooleanField";

type ListData = {
  id: string | number;
  name: string;
};

export type SpaceProps = {
  id: number;
  name: string;
  capacity: number;
  subjects?: ListData[] | undefined;
  locked: boolean;
};

export type SpaceReserveFormData = {
  range: DateRange;
  schedules: RemoteOption[];
  purpose: string;
  lock: boolean;
};

type SpaceReserveModalProps = {
  space: SpaceProps;
  open: boolean;
  onClose: () => void;
  onSubmit: (data: SpaceReserveFormData) => Promise<void>;
};

const PURPOSE_MAX = 200;

const formSchema = z.object({
  range: z
    .custom<DateRange | undefined>()
    .refine((range) => Boolean(range?.from), "Selecione a data da reserva.")
    .refine(
      (range) => !range?.from || range.from >= startOfDay(addDays(new Date(), 1)),
      "A data da reserva deve começar a partir de amanhã.",
    ),
  schedules: z.array(z.object({ id: z.number(), name: z.string() })).min(1, "Selecione pelo menos um horário."),
  lock: z.boolean(),
  purpose: z
    .string()
    .trim()
    .min(1, "Campo 'propósito' é obrigatório.")
    .max(PURPOSE_MAX, `Propósito deve ter no máximo ${PURPOSE_MAX} caracteres.`),
});

/** Dialog de nova reserva. O pai deve remontá-lo (`key`) a cada abertura. */
export function SpaceReserveModal({ space, open, onClose, onSubmit }: SpaceReserveModalProps) {
  const { sessionInfo } = useRouteContext({ from: "__root__" });

  const form = useForm({
    defaultValues: {
      range: undefined as DateRange | undefined,
      schedules: [] as RemoteOption[],
      lock: false,
      purpose: "",
    },
    validators: { onSubmit: formSchema },
    onSubmit: async ({ value }) => {
      if (!value.range?.from) return;
      await onSubmit({
        range: value.range,
        schedules: value.schedules,
        purpose: value.purpose.trim(),
        lock: value.lock,
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
      title="Nova reserva"
      description="Defina as informações da sua reserva."
      headerExtra={
        <div className="flex items-center rounded-md border p-2 shadow-md dark:border-violet-400/20 dark:shadow-violet-400/20">
          <div className="flex flex-col items-start">
            <span className="text-base font-bold">{space.name}</span>
            <span className="text-xs text-muted-foreground">
              {space.subjects?.length ? space.subjects.map((subject) => subject.name).join(", ") : "---"} ·{" "}
              {space.capacity} lugares
            </span>
          </div>
          <div className="ml-auto">
            <StatusBadge active={!space.locked} activeLabel="Disponível" inactiveLabel="Bloqueado" />
          </div>
        </div>
      }
      formId="space-reserve-form"
      submitLabel="Reservar"
      isSubmitting={isSubmitting || space.locked}
      onSubmit={() => form.handleSubmit()}
      onReset={() => form.reset()}
    >
      <form.Field name="range">
        {(field) => (
          <DateRangeField
            id="reserve-date-range"
            label="Data da reserva"
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
                id="reserve-schedules"
                spaceId={space.id}
                range={range}
                value={field.state.value}
                onChange={field.handleChange}
                errors={field.state.meta.isTouched ? field.state.meta.errors : undefined}
              />
            )}
          </form.Field>
        )}
      </form.Subscribe>

      {(sessionInfo?.roles.includes("Owner") || sessionInfo?.roles.includes("Admin")) && (
        <form.Field name="lock">
          {(field) => (
            <BooleanField
              label="Bloquear espaço"
              description="Espaços bloqueados não podem ser reservados."
              checked={field.state.value}
              onCheckedChange={field.handleChange}
              trueLabel="Bloqueado"
              falseLabel="Disponível"
              disabled={!(sessionInfo?.roles.includes("Owner") || sessionInfo?.roles.includes("Admin"))}
              disabledReason="Você não pode bloquear a reserva de um espaço com cargo igual ou superior ao seu."
            />
          )}
        </form.Field>
      )}

      <form.Field name="purpose">
        {(field) => {
          const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
          return (
            <Field data-invalid={isInvalid}>
              <FieldLabel htmlFor="reserve-purpose">Propósito</FieldLabel>
              <InputGroup>
                <InputGroupTextarea
                  id="reserve-purpose"
                  name={field.name}
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(event) => field.handleChange(event.target.value)}
                  placeholder="Ex: Aula prática de Cálculo I, reunião pedagógica, palestra..."
                  rows={4}
                  className="min-h-20 resize-none"
                  aria-invalid={isInvalid}
                />
                <InputGroupAddon align="block-end">
                  <InputGroupText className="tabular-nums">
                    {field.state.value.length}/{PURPOSE_MAX} caracteres
                  </InputGroupText>
                </InputGroupAddon>
              </InputGroup>
              {isInvalid && <FieldError errors={field.state.meta.errors} />}
            </Field>
          );
        }}
      </form.Field>
    </FormDialog>
  );
}
