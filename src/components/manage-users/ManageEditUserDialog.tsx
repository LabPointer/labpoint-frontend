import { useForm, useStore } from "@tanstack/react-form";
import z from "zod";
import { type Account, ROLE_LABELS, ROLE_RANK } from "#/lib/queries/accounts";
import { BooleanField } from "@/components/shared/BooleanField";
import { SubjectSelect } from "@/components/shared/entity-selects";
import { FilterSelect } from "@/components/shared/FilterSelect";
import { FormDialog } from "@/components/shared/FormDialog";
import type { RemoteOption } from "@/components/shared/RemoteCombobox";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";

export type ManageEditUserData = {
  id: string;
  username: string;
  registration: string;
  role: number;
  subject: RemoteOption | undefined;
  enabled: boolean;
};

export type ManageEditUserDialogProps = {
  account: Account;
  /** Cargo de quem está editando (índice em ROLE_LABELS). Define o que o formulário permite alterar. */
  viewerRole: number;
  open: boolean;
  onClose: () => void;
  onSubmit: (data: ManageEditUserData) => Promise<void>;
};

const formSchema = z.object({
  username: z.string().min(1, "Nome é obrigatório.").max(100, "Nome deve ter no máximo 100 caracteres."),
  registration: z.string().min(1, "Matrícula é obrigatória.").max(30, "Matrícula deve ter no máximo 30 caracteres."),
  role: z.number(),
  subject: z.object({ id: z.number(), name: z.string() }).or(z.undefined()),
  enabled: z.boolean(),
});

const roleOptions = ROLE_LABELS.map((label, index) => ({ label, value: index }));

/**
 * Os valores iniciais vêm da conta selecionada. Para o formulário refletir outra conta,
 * o pai deve remontar o componente (`key`) a cada abertura.
 */
export function ManageEditUserDialog({ account, viewerRole, open, onClose, onSubmit }: ManageEditUserDialogProps) {
  // Regras (também validadas no backend): só o Owner altera cargos; ativar/desativar a conta exige
  // cargo superior ao do usuário editado.
  const canChangeRole = viewerRole === ROLE_RANK.Owner;
  const canToggleStatus = viewerRole > account.role;

  const { subject } = account;
  const defaultValues = {
    username: account.username,
    registration: account.registration,
    role: account.role,
    subject: subject ? { id: Number(subject.id), name: subject.name } : (undefined as RemoteOption | undefined),
    enabled: account.enabled,
  };

  const form = useForm({
    defaultValues,
    validators: { onSubmit: formSchema },
    onSubmit: async ({ value }) => {
      await onSubmit({ id: account.id, ...value });
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
      title="Editar usuário"
      description="Altere os dados do usuário e clique em editar para salvar."
      formId="edit-user-form"
      submitLabel="Editar"
      isSubmitting={isSubmitting}
      onSubmit={() => form.handleSubmit()}
      onReset={() => form.reset()}
    >
      <form.Field name="username">
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
                autoComplete="off"
              />
              {isInvalid && <FieldError errors={field.state.meta.errors} />}
            </Field>
          );
        }}
      </form.Field>

      <form.Field name="registration">
        {(field) => {
          const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
          return (
            <Field data-invalid={isInvalid}>
              <FieldLabel htmlFor={field.name}>Matrícula</FieldLabel>
              <Input
                id={field.name}
                name={field.name}
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(event) => field.handleChange(event.target.value)}
                aria-invalid={isInvalid}
                autoComplete="off"
              />
              {isInvalid && <FieldError errors={field.state.meta.errors} />}
            </Field>
          );
        }}
      </form.Field>

      <form.Field name="role">
        {(field) => (
          <div className="flex flex-col gap-1">
            <FilterSelect
              id="edit-user-role"
              label="Cargo"
              options={roleOptions}
              value={field.state.value}
              onValueChange={field.handleChange}
              disabled={!canChangeRole}
            />
            {!canChangeRole && (
              <p className="text-xs text-muted-foreground">Somente o proprietário (Owner) pode alterar cargos.</p>
            )}
          </div>
        )}
      </form.Field>

      <form.Field name="subject">
        {(field) => (
          <SubjectSelect
            id="edit-user-subject"
            label="Matéria"
            enabledOnly
            value={field.state.value}
            onValueChange={field.handleChange}
          />
        )}
      </form.Field>

      <form.Field name="enabled">
        {(field) => (
          <BooleanField
            label="Conta"
            description="Contas desabilitadas não conseguem acessar o sistema."
            checked={field.state.value}
            onCheckedChange={field.handleChange}
            trueLabel="Ativa"
            falseLabel="Inativa"
            disabled={!canToggleStatus}
            disabledReason="Você não pode alterar o status de um usuário com cargo igual ou superior ao seu."
          />
        )}
      </form.Field>
    </FormDialog>
  );
}
