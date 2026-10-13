import { useForm, useStore } from "@tanstack/react-form";
import z from "zod";
import { BooleanField } from "@/components/shared/BooleanField";
import { ResourceMultiSelect, SubjectMultiSelect } from "@/components/shared/entity-selects";
import { FormDialog } from "@/components/shared/FormDialog";
import type { RemoteOption } from "@/components/shared/RemoteCombobox";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

export type SpaceFormData = {
  name: string;
  description: string;
  capacity: number;
  /** `true` = ativo (o envio converte para `locked = !enabled`) */
  enabled: boolean;
  subjects: RemoteOption[];
  resources: RemoteOption[];
};

type ManageSpaceDialogProps = {
  mode: "create" | "edit";
  /** Valores atuais (somente em `edit`). */
  space?: SpaceFormData;
  open: boolean;
  onClose: () => void;
  onSubmit: (data: SpaceFormData) => Promise<void>;
};

const optionSchema = z.object({ id: z.number(), name: z.string() });

const formSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório.").max(100, "Nome deve ter no máximo 100 caracteres."),
  description: z
    .string()
    .trim()
    .min(1, "Descrição é obrigatória.")
    .max(200, "Descrição deve ter no máximo 200 caracteres."),
  capacity: z
    .number("Capacidade deve ser um número.")
    .int("Capacidade deve ser um número inteiro.")
    .min(1, "Capacidade deve ser de pelo menos 1 lugar."),
  enabled: z.boolean(),
  subjects: z.array(optionSchema),
  resources: z.array(optionSchema),
});

/** Dialog único de criação/edição. O pai deve remontá-lo (`key`) a cada abertura. */
export function ManageSpaceDialog({ mode, space, open, onClose, onSubmit }: ManageSpaceDialogProps) {
  const isEdit = mode === "edit";

  const form = useForm({
    defaultValues: {
      name: space?.name ?? "",
      description: space?.description ?? "",
      capacity: space?.capacity ?? 20,
      enabled: space?.enabled ?? true,
      subjects: space?.subjects ?? ([] as RemoteOption[]),
      resources: space?.resources ?? ([] as RemoteOption[]),
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
      title={isEdit ? "Editar espaço" : "Criar novo espaço"}
      description={
        isEdit
          ? "Altere os dados do espaço e clique em editar para salvar."
          : "Preencha os detalhes necessários para prosseguir com a criação do espaço."
      }
      formId={`${mode}-space-form`}
      submitLabel={isEdit ? "Editar" : "Criar"}
      isSubmitting={isSubmitting}
      onSubmit={() => form.handleSubmit()}
      onReset={() => form.reset()}
    >
      <form.Field name="name">
        {(field) => {
          const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
          return (
            <Field data-invalid={isInvalid}>
              <FieldLabel htmlFor={`${mode}-space-name`}>Nome</FieldLabel>
              <Input
                id={`${mode}-space-name`}
                name={field.name}
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(event) => field.handleChange(event.target.value)}
                aria-invalid={isInvalid}
                placeholder="Nome do espaço..."
                autoComplete="off"
              />
              {isInvalid && <FieldError errors={field.state.meta.errors} />}
            </Field>
          );
        }}
      </form.Field>

      <form.Field name="capacity">
        {(field) => {
          const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
          return (
            <Field data-invalid={isInvalid}>
              <FieldLabel htmlFor={`${mode}-space-capacity`}>Capacidade</FieldLabel>
              <Input
                id={`${mode}-space-capacity`}
                name={field.name}
                type="number"
                min={1}
                step={1}
                inputMode="numeric"
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

      <form.Field name="description">
        {(field) => {
          const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
          return (
            <Field data-invalid={isInvalid}>
              <FieldLabel htmlFor={`${mode}-space-description`}>Descrição</FieldLabel>
              <Textarea
                id={`${mode}-space-description`}
                name={field.name}
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(event) => field.handleChange(event.target.value)}
                aria-invalid={isInvalid}
                placeholder="Descrição do espaço..."
                rows={3}
                maxLength={200}
              />
              {isInvalid && <FieldError errors={field.state.meta.errors} />}
            </Field>
          );
        }}
      </form.Field>

      <form.Field name="resources">
        {(field) => (
          <ResourceMultiSelect
            id={`${mode}-space-resources`}
            label="Recursos"
            // só recursos que NÃO podem ser reservados (equipamentos fixos) são vinculados ao espaço
            enabledOnly
            value={field.state.value}
            onValueChange={field.handleChange}
          />
        )}
      </form.Field>

      <form.Field name="subjects">
        {(field) => (
          <SubjectMultiSelect
            id={`${mode}-space-subjects`}
            label="Matérias"
            enabledOnly
            value={field.state.value}
            onValueChange={field.handleChange}
          />
        )}
      </form.Field>

      <form.Field name="enabled">
        {(field) => (
          <BooleanField
            label="Ativado"
            description="Espaços desativados ficam bloqueados para reserva."
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
