import { useForm, useStore } from "@tanstack/react-form";
import { addDays, startOfDay } from "date-fns";
import { useMemo } from "react";
import type { DateRange } from "react-day-picker";
import z from "zod";
import type { Resource } from "#/lib/queries/resources";
import { DateRangeField } from "@/components/reserve/DateRangeField";
import { ReserveScheduleField } from "@/components/reserve/ReserveScheduleField";
import { FormDialog } from "@/components/shared/FormDialog";
import type { RemoteOption } from "@/components/shared/RemoteCombobox";
import { Field, FieldDescription, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { InputGroup, InputGroupAddon, InputGroupText, InputGroupTextarea } from "@/components/ui/input-group";

export type ResourceReserveFormData = {
  range: DateRange;
  schedules: RemoteOption[];
  quantity: number;
  purpose: string;
};

type ResourceReserveModalProps = {
  resource: Resource;
  /** Período já escolhido na busca (pré-preenche o formulário). */
  initialRange?: DateRange;
  open: boolean;
  onClose: () => void;
  onSubmit: (data: ResourceReserveFormData) => Promise<void>;
};

const PURPOSE_MAX = 200;

/** Reserva avulsa (sem sala) de N unidades de um recurso. O pai deve remontá-lo (`key`) a cada abertura. */
export function ResourceReserveModal({ resource, initialRange, open, onClose, onSubmit }: ResourceReserveModalProps) {
  const total = Number(resource.quantity ?? 1);

  const formSchema = useMemo(
    () =>
      z.object({
        range: z
          .custom<DateRange | undefined>()
          .refine((range) => Boolean(range?.from), "Selecione a data da reserva.")
          .refine(
            (range) => !range?.from || range.from >= startOfDay(addDays(new Date(), 1)),
            "A data da reserva deve começar a partir de amanhã.",
          ),
        schedules: z.array(z.object({ id: z.number(), name: z.string() })).min(1, "Selecione pelo menos um horário."),
        quantity: z
          .number({ error: "Informe a quantidade." })
          .int("A quantidade deve ser um número inteiro.")
          .min(1, "Quantidade mínima: 1.")
          .max(total, `O recurso tem ${total} unidade(s).`),
        purpose: z
          .string()
          .trim()
          .min(1, "Campo 'propósito' é obrigatório.")
          .max(PURPOSE_MAX, `Propósito deve ter no máximo ${PURPOSE_MAX} caracteres.`),
      }),
    [total],
  );

  const form = useForm({
    defaultValues: {
      range: initialRange as DateRange | undefined,
      schedules: [] as RemoteOption[],
      quantity: 1,
      purpose: "",
    },
    validators: { onSubmit: formSchema },
    onSubmit: async ({ value }) => {
      if (!value.range?.from) return;
      await onSubmit({
        range: value.range,
        schedules: value.schedules,
        quantity: value.quantity,
        purpose: value.purpose.trim(),
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
      title="Reservar recurso"
      description="Defina o período, os horários e quantas unidades você precisa."
      headerExtra={
        <div className="flex flex-col items-start rounded-md border p-2 shadow-md dark:border-violet-400/20 dark:shadow-violet-400/20">
          <span className="text-base font-bold">{resource.name}</span>
          <span className="text-xs text-muted-foreground">
            {total} unidade(s){resource.description ? ` · ${resource.description}` : ""}
          </span>
        </div>
      }
      formId="resource-reserve-form"
      submitLabel="Reservar"
      isSubmitting={isSubmitting}
      onSubmit={() => form.handleSubmit()}
      onReset={() => form.reset()}
    >
      <form.Field name="range">
        {(field) => (
          <DateRangeField
            id="resource-reserve-range"
            label="Data da reserva"
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
              <FieldLabel htmlFor="resource-reserve-quantity">Quantidade</FieldLabel>
              <Input
                id="resource-reserve-quantity"
                type="number"
                inputMode="numeric"
                min={1}
                max={total}
                value={Number.isNaN(field.state.value) ? "" : field.state.value}
                onBlur={field.handleBlur}
                onChange={(event) => field.handleChange(event.target.valueAsNumber)}
                aria-invalid={isInvalid}
              />
              <FieldDescription>Os horários sem essa quantidade livre no período não aparecem.</FieldDescription>
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
                id="resource-reserve-schedules"
                range={range}
                resources={[
                  { id: Number(resource.id), quantity: Number.isInteger(quantity) && quantity > 0 ? quantity : 1 },
                ]}
                value={field.state.value}
                onChange={field.handleChange}
                errors={field.state.meta.isTouched ? field.state.meta.errors : undefined}
              />
            )}
          </form.Field>
        )}
      </form.Subscribe>

      <form.Field name="purpose">
        {(field) => {
          const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
          return (
            <Field data-invalid={isInvalid}>
              <FieldLabel htmlFor="resource-reserve-purpose">Propósito</FieldLabel>
              <InputGroup>
                <InputGroupTextarea
                  id="resource-reserve-purpose"
                  name={field.name}
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(event) => field.handleChange(event.target.value)}
                  placeholder="Ex: Aula prática no pátio, apresentação na biblioteca..."
                  rows={3}
                  className="min-h-16 resize-none"
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
