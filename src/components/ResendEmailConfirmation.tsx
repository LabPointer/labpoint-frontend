import { useForm } from "@tanstack/react-form";
import { createLink } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Field, FieldGroup } from "@/components/ui/field";
import { AuthCard } from "./_public/AuthCard";
import { FormTextField } from "./_public/FormTextField";
import { SubmitButton } from "./_public/SubmitButton";

const formSchema = z.object({
  email: z.email("E-mail inválido"),
});

interface Props {
  isSubmitting: boolean;
  isRedirectting: boolean;
  onSubmitForm: (email: string) => Promise<void>;
}

export function ResendEmailConfirmationForm({ onSubmitForm, isRedirectting, isSubmitting }: Props) {
  const LinkButton = createLink(Button);
  const isDisabled = isSubmitting || isRedirectting;

  const form = useForm({
    defaultValues: { email: "" },
    validators: { onSubmit: formSchema },
    onSubmit: async ({ value }) => {
      await onSubmitForm(value.email);
      form.reset();
    },
  });

  return (
    <AuthCard
      title="Reenviar email de confirmação"
      description="Informe seu e-mail institucional e reenviaremos o link de confirmação."
      footer={
        <Field orientation="vertical">
          <SubmitButton form="resend-email-form" isLoading={isSubmitting} disabled={isDisabled}>
            Enviar
          </SubmitButton>
          <LinkButton
            className="font-semibold px-1 dark:text-violet-400"
            type="button"
            variant="link"
            to="/"
            disabled={isDisabled}
          >
            <ArrowLeft />
            <span>Voltar para o login</span>
          </LinkButton>
        </Field>
      }
    >
      <form
        id="resend-email-form"
        onSubmit={(e) => {
          e.preventDefault();
          form.handleSubmit();
        }}
      >
        <FieldGroup>
          <form.Field
            name="email"
            children={(field) => (
              <FormTextField
                field={field}
                label="E-mail"
                placeholder="E-mail"
                type="email"
                autoComplete="on"
                disabled={isDisabled}
              />
            )}
          />
        </FieldGroup>
      </form>
    </AuthCard>
  );
}
