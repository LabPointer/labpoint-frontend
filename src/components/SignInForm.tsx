import { useForm } from "@tanstack/react-form";
import { createLink } from "@tanstack/react-router";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Field, FieldGroup } from "@/components/ui/field";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { AuthCard } from "./_public/AuthCard";
import { FormTextField } from "./_public/FormTextField";
import { PasswordField } from "./_public/PasswordField";
import { SubmitButton } from "./_public/SubmitButton";

const formSchema = z.object({
  registration: z
    .string("Matricula invalida")
    .min(4, "Matricula deve ter pelo menos 4 caracteres")
    .max(20, "Matricula deve ter no maximo 20 caracteres"),
  password: z
    .string("Senha invalida")
    .min(6, "Senha deve ter pelo menos 5 caracteres")
    .max(100, "Senha deve ter no maximo 16 caracteres"),
  rememberMe: z.boolean(),
});

interface SignInFormProps {
  isLoading: boolean;
  isRedirecting: boolean;
  onFormSubmit: (registration: string, password: string, rememberMe: boolean) => Promise<void>;
}

export function SignInForm({ onFormSubmit, isLoading, isRedirecting }: SignInFormProps) {
  const LinkButton = createLink(Button);
  const isDisabled = isRedirecting || isLoading;

  const form = useForm({
    defaultValues: { registration: "", password: "", rememberMe: false },
    validators: { onSubmit: formSchema },
    onSubmit: async ({ value }) => {
      await onFormSubmit(value.registration, value.password, value.rememberMe);
    },
  });

  return (
    <AuthCard
      title="Entre com sua conta"
      description="Use sua matrícula institucional para acessar o sistema."
      footer={
        <Field orientation="vertical">
          <SubmitButton form="sign-in-form" isLoading={isLoading} disabled={isDisabled}>
            Entrar
          </SubmitButton>
          <LinkButton
            disabled={isDisabled}
            className="font-semibold dark:text-violet-400 underline"
            type="button"
            variant="link"
            to="/resend-email-confirmation"
          >
            Reenviar email de confirmação
          </LinkButton>
          <div className="w-full justify-center flex items-center gap-0">
            <span>Não tem conta?</span>
            <LinkButton
              disabled={isDisabled}
              className="font-semibold px-1 dark:text-violet-400 underline"
              type="button"
              variant="link"
              to="/sign-up"
            >
              Cadastre-se
            </LinkButton>
          </div>
        </Field>
      }
    >
      <form
        id="sign-in-form"
        onSubmit={(e) => {
          e.preventDefault();
          form.handleSubmit();
        }}
      >
        <FieldGroup>
          <form.Field
            name="registration"
            children={(field) => (
              <FormTextField
                field={field}
                label="Matrícula"
                placeholder="Matrícula"
                disabled={isDisabled}
              />
            )}
          />

          <form.Field
            name="password"
            children={(field) => (
              <PasswordField
                field={field}
                label={
                  <span className="flex w-full items-center justify-between">
                    <span>Senha</span>
                    <LinkButton
                      disabled={isDisabled}
                      className="font-semibold dark:text-violet-400 underline ml-auto h-auto p-0"
                      type="button"
                      variant="link"
                      to="/forget-password"
                    >
                      Esqueci minha senha
                    </LinkButton>
                  </span>
                }
                placeholder="Senha"
                disabled={isDisabled}
              />
            )}
          />

          <form.Field
            name="rememberMe"
            children={(field) => {
              const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
              return (
                <Field data-invalid={isInvalid}>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      disabled={isDisabled}
                      id={field.name}
                      checked={field.state.value}
                      onCheckedChange={(checked) => field.handleChange(checked === true)}
                      onBlur={field.handleBlur}
                    />
                    <Label htmlFor={field.name}>Lembrar-me</Label>
                  </div>
                </Field>
              );
            }}
          />
        </FieldGroup>
      </form>
    </AuthCard>
  );
}
