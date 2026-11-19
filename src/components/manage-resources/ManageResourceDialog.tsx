import { useForm, useStore } from "@tanstack/react-form";
import z from "zod";
import { BooleanField } from "@/components/shared/BooleanField";
import { FormDialog } from "@/components/shared/FormDialog";
import { Field, FieldDescription, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { InputGroup, InputGroupAddon, InputGroupText, InputGroupTextarea } from "@/components/ui/input-group";

export type ResourceFormData = {
  name: string;
  description: string;
  enabled: boolean;
  reservable: boolean;
  /** Só vale quando `reservable`. */
  quantity: number;
};

/** Valores atuais do recurso em edição. */
export type ResourceFormInitial = {
  name: string;
  description?: string | null;
  enabled: boolean;
  reservable: boolean;
  quantity?: number | string | null;
};

type ManageResourceDialogProps = {
  mode: "create" | "edit";
  /** Valores atuais (somente em `edit`). */
  resource?: ResourceFormInitial;
  open: boolean;
  onClose: () => void;
  onSubmit: (data: ResourceFormData) => Promise<void>;
};

const DESCRIPTION_MAX = 500;
const QUANTITY_MAX = 100000;

const nameRule = z.string().max(100, "Nome deve ter no máximo 100 caracteres.");
const sharedRules = {
  description: z.string().max(DESCRIPTION_MAX, `Descrição deve ter no máximo ${DESCRIPTION_MAX} caracteres.`),
  enabled: z.boolean(),
  reservable: z.boolean(),
  quantity: z.number(),
};

/** Quantidade só é obrigatória (inteiro ≥ 1) quando o recurso é reservável. */
function quantityRule(value: { reservable: boolean; quantity: number }, ctx: z.RefinementCtx) {
  const { reservable, quantity } = value;
  if (reservable && (!Number.isInteger(quantity) || quantity < 1 || quantity > QUANTITY_MAX)) {
    ctx.addIssue({
      code: "custom",
      path: ["quantity"],
      message: `Informe uma quantidade inteira entre 1 e ${QUANTITY_MAX}.`,
    });
  }
}

const createSchema = z.object({ name: nameRule.min(1, "Nome é obrigatório."), ...sharedRules }).superRefine(quantityRule);
const editSchema = z.object({ name: nameRule, ...sharedRules }).superRefine(quantityRule);

/** Dialog único de criação/edição. O pai deve remontá-lo (`key`) a cada abertura. */
export function ManageResourceDialog({ mode, resource, open, onClose, onSubmit }: ManageResourceDialogProps) {
  const isEdit = mode === "edit";

  const form = useForm({
    defaultValues: {
      name: "",
      description: resource?.description ?? "",
      enabled: resource?.enabled ?? true,
      reservable: resource?.reservable ?? false,
      quantity: resource?.quantity ? Number(resource.quantity) : 1,
    },
    validators: { onSubmit: isEdit ? editSchema : createSchema },
    onSubmit: async ({ value }) => {
      await onSubmit({ ...value, name: value.name.trim(), description: value.description.trim() });
    },
  });

  const isSubmitting = useStore(form.store, (state) => state.isSubmitting);
  const reservable = useStore(form.store, (state) => state.values.reservable);

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

      <form.Field name="description">
        {(field) => {
          const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
          return (
            <Field data-invalid={isInvalid}>
              <FieldLabel htmlFor="resource-description">Descrição (opcional)</FieldLabel>
              <InputGroup>
                <InputGroupTextarea
                  id="resource-description"
                  name={field.name}
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(event) => field.handleChange(event.target.value)}
                  placeholder="Ex.: Notebooks Dell com carregador, guardados no armário da coordenação..."
                  rows={3}
                  className="min-h-16 resize-none"
                  aria-invalid={isInvalid}
                />
                <InputGroupAddon align="block-end">
                  <InputGroupText className="tabular-nums">
                    {field.state.value.length}/{DESCRIPTION_MAX} caracteres
                  </InputGroupText>
                </InputGroupAddon>
              </InputGroup>
              {isInvalid && <FieldError errors={field.state.meta.errors} />}
            </Field>
          );
        }}
      </form.Field>

      <form.Field name="reservable">
        {(field) => (
          <BooleanField
            label="Reservável"
            description="Recursos reserváveis são emprestados por quantidade (sozinhos ou junto com uma sala) e não podem ser associados a um espaço."
            checked={field.state.value}
            onCheckedChange={field.handleChange}
            trueLabel="Reservável"
            falseLabel="Recurso fixo de espaço"
          />
        )}
      </form.Field>

      {reservable && (
        <form.Field name="quantity">
          {(field) => {
            const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
            return (
              <Field data-invalid={isInvalid}>
                <FieldLabel htmlFor="resource-quantity">Quantidade</FieldLabel>
                <Input
                  id="resource-quantity"
                  type="number"
                  inputMode="numeric"
                  min={1}
                  max={QUANTITY_MAX}
                  step={1}
                  value={Number.isNaN(field.state.value) ? "" : field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(event) => field.handleChange(event.target.valueAsNumber)}
                  aria-invalid={isInvalid}
                />
                <FieldDescription>Unidades disponíveis para reserva ao mesmo tempo.</FieldDescription>
                {isInvalid && <FieldError errors={field.state.meta.errors} />}
              </Field>
            );
          }}
        </form.Field>
      )}

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
