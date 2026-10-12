import { useForm, useStore } from "@tanstack/react-form";
import z from "zod";
import { BooleanField } from "@/components/shared/BooleanField";
import { FormDialog } from "@/components/shared/FormDialog";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";

export type ResourceFormData = {
  name: string;
  canReserve: boolean;
  enabled: boolean;
};

type ManageResourceDialogProps = {
  mode: "create" | "edit";
  /** Valores atuais (somente em `edit`). */
  resource?: ResourceFormData;
  open: boolean;
  onClose: () => void;
  onSubmit: (data: ResourceFormData) => Promise<void>;
};

const nameRule = z.string().max(100, "Nome deve ter no máximo 100 caracteres.");

const createSchema = z.object({
  name: nameRule.min(1, "Nome é obrigatório."),
  canReserve: z.boolean(),
  enabled: z.boolean(),
});

const editSchema = z.object({ name: nameRule, canReserve: z.boolean(), enabled: z.boolean() });

/** Dialog único de criação/edição. O pai deve remontá-lo (`key`) a cada abertura. */
export function ManageResourceDialog({ mode, resource, open, onClose, onSubmit }: ManageResourceDialogProps) {
  const isEdit = mode === "edit";

  const form = useForm({
    defaultValues: {
      name: "",
      canReserve: resource?.canReserve ?? false,
      enabled: resource?.enabled ?? true,
    },
    validators: { onSubmit: isEdit ? editSchema : createSchema },
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
      title={isEdit ? "Editar recurso" : "Criar novo recurso"}
      description={
        isEdit
          ? "Preencha apenas os campos que deseja alterar. Nome em branco mantém o atual."
          : "Preencha os detalhes necessários para prosseguir com a criação do recurso."
      }
      formId={`${mode}-resource-form`}
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
              <FieldLabel htmlFor={field.name}>Nome</FieldLabel>
              <Input
                id={field.name}
                name={field.name}
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(event) => field.handleChange(event.target.value)}
                aria-invalid={isInvalid}
                placeholder={isEdit ? `Nome atual: ${resource?.name ?? ""}` : "Nome do recurso..."}
                autoComplete="off"
              />
              {isInvalid && <FieldError errors={field.state.meta.errors} />}
            </Field>
          );
        }}
      </form.Field>

      <form.Field name="canReserve">
        {(field) => (
          <BooleanField
            label="Reservável"
            description="Recurso pode ser reservado."
            checked={field.state.value}
            onCheckedChange={field.handleChange}
          />
        )}
      </form.Field>

      <form.Field name="enabled">
        {(field) => (
          <BooleanField
            label="Ativo"
            description="Uma trava para usar o recurso."
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
