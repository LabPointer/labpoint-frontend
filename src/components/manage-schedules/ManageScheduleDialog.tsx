import { useForm, useStore } from "@tanstack/react-form";
import z from "zod";
import { shiftLabels } from "#/lib/queries/schedules";
import { BooleanField } from "@/components/shared/BooleanField";
import { FilterSelect } from "@/components/shared/FilterSelect";
import { FormDialog } from "@/components/shared/FormDialog";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";

export type ScheduleFormData = {
  startAt: string;
  endAt: string;
  shift: number;
  enabled: boolean;
};

type ManageScheduleDialogProps = {
  mode: "create" | "edit";
  /** Valores atuais (somente em `edit`). */
  schedule?: ScheduleFormData;
  open: boolean;
  onClose: () => void;
  onSubmit: (data: ScheduleFormData) => Promise<void>;
};

const shiftOptions = Object.entries(shiftLabels).map(([value, label]) => ({ label, value: Number(value) }));

const formSchema = z
  .object({
    startAt: z.string().min(1, "Horário de início é obrigatório."),
    endAt: z.string().min(1, "Horário de término é obrigatório."),
    shift: z.number(),
    enabled: z.boolean(),
  })
  .superRefine((value, context) => {
    if (value.startAt >= value.endAt) {
      context.addIssue({
        code: "custom",
        path: ["endAt"],
        message: "Horário de término deve ser maior que o horário de início.",
      });
    }
  });

const timeInputClass =
  "appearance-none bg-background [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-calendar-picker-indicator]:appearance-none";

/** Dialog único de criação/edição. O pai deve remontá-lo (`key`) a cada abertura. */
export function ManageScheduleDialog({ mode, schedule, open, onClose, onSubmit }: ManageScheduleDialogProps) {
  const isEdit = mode === "edit";

  const form = useForm({
    defaultValues: {
      startAt: schedule?.startAt ?? "",
      endAt: schedule?.endAt ?? "",
      shift: schedule?.shift ?? 0,
      enabled: schedule?.enabled ?? true,
    },
    validators: { onSubmit: formSchema },
    onSubmit: async ({ value }) => {
      await onSubmit(value);
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
      title={isEdit ? "Editar horário" : "Criar novo horário"}
      description={
        isEdit
          ? "Preencha os detalhes necessários para prosseguir com a edição do horário."
          : "Preencha os detalhes necessários para prosseguir com a criação do horário."
      }
      formId={`${mode}-schedule-form`}
      submitLabel={isEdit ? "Editar" : "Criar"}
      isSubmitting={isSubmitting}
      onSubmit={() => form.handleSubmit()}
      onReset={() => form.reset()}
    >
      <form.Field name="startAt">
        {(field) => {
          const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
          return (
            <Field data-invalid={isInvalid}>
              <FieldLabel htmlFor={field.name}>Horário de início</FieldLabel>
              <Input
                type="time"
                id={field.name}
                step="1"
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(event) => field.handleChange(event.target.value)}
                aria-invalid={isInvalid}
                className={timeInputClass}
              />
              {isInvalid && <FieldError errors={field.state.meta.errors} />}
            </Field>
          );
        }}
      </form.Field>

      <form.Field name="endAt">
        {(field) => {
          const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
          return (
            <Field data-invalid={isInvalid}>
              <FieldLabel htmlFor={field.name}>Horário de término</FieldLabel>
              <Input
                type="time"
                id={field.name}
                step="1"
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(event) => field.handleChange(event.target.value)}
                aria-invalid={isInvalid}
                className={timeInputClass}
              />
              {isInvalid && <FieldError errors={field.state.meta.errors} />}
            </Field>
          );
        }}
      </form.Field>

      <form.Field name="shift">
        {(field) => (
          <FilterSelect
            id="schedule-form-shift"
            label="Turno"
            options={shiftOptions}
            value={field.state.value}
            onValueChange={field.handleChange}
            className="w-full"
          />
        )}
      </form.Field>

      <form.Field name="enabled">
        {(field) => (
          <BooleanField
            label="Ativo"
            description="Uma trava para usar o horário."
            checked={field.state.value}
            onCheckedChange={field.handleChange}
            trueLabel="Ativo"
            falseLabel="Inativo"
          />
        )}
      </form.Field>
    </FormDialog>
  );
}
