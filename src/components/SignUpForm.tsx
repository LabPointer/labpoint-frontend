import { useState } from "react";
import { useForm } from "@tanstack/react-form";
import { createLink } from "@tanstack/react-router";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Field, FieldGroup } from "@/components/ui/field";
import { AuthCard } from "./_public/AuthCard";
import { FormTextField } from "./_public/FormTextField";
import { PasswordField } from "./_public/PasswordField";
import { SubmitButton } from "./_public/SubmitButton";

const formSchema = z
  .object({
    name: z
      .string("Nome inválido")
      .min(3, "Nome deve ter pelo menos 3 caracteres")
      .max(100, "Nome deve ter no máximo 100 caracteres"),
    registration: z
      .string("Matrícula inválida")
      .min(4, "Matrícula deve ter pelo menos 4 caracteres")
      .max(20, "Matrícula deve ter no máximo 20 caracteres"),
    email: z.email("E-mail inválido"),
    password: z
      .string("Senha inválida")
      .min(6, "Senha deve ter pelo menos 6 caracteres")
      .max(100, "Senha deve ter no máximo 100 caracteres"),
    passwordConfirm: z.string("Senha inválida"),
  })
  .superRefine((value, ctx) => {
    if (value.password !== value.passwordConfirm) {
      ctx.addIssue({ code: "custom", path: ["password"], message: "As senhas não coincidem." });
      ctx.addIssue({ code: "custom", path: ["passwordConfirm"], message: "As senhas não coincidem." });
    }
  });

interface SignUpFormProps {
  isLoading: boolean;
  isRedirecting: boolean;
  onFormSubmit: (name: string, registration: string, email: string, password: string) => Promise<void>;
}

export function SignUpForm({ onFormSubmit, isLoading, isRedirecting }: SignUpFormProps) {
  const LinkButton = createLink(Button);
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const isDisabled = isRedirecting || isLoading;

  const form = useForm({
    defaultValues: { name: "", registration: "", email: "", password: "", passwordConfirm: "" },
    validators: { onSubmit: formSchema },
    onSubmit: async ({ value }) => {
      await onFormSubmit(value.name, value.registration, value.email, value.password);
    },
  });

  return (
    <AuthCard
      title="Criar uma conta"
      description="Preencha seus dados institucionais para começar a reservar."
      footer={
        <Field orientation="vertical">
          <SubmitButton form="sign-up-form" isLoading={isLoading} disabled={isDisabled}>
            Cadastrar
          </SubmitButton>
          <div className="w-full justify-center flex items-center gap-0">
            <span>Já tem conta?</span>
            <LinkButton
              disabled={isDisabled}
              className="font-semibold px-1 dark:text-violet-400 underline"
              type="button"
              variant="link"
              to="/"
            >
              Entrar
            </LinkButton>
          </div>
        </Field>
      }
    >
      <form
        id="sign-up-form"
        onSubmit={(e) => {
          e.preventDefault();
          form.handleSubmit();
        }}
      >
        <FieldGroup>
          <form.Field
            name="name"
            children={(field) => (
              <FormTextField field={field} label="Nome" placeholder="Nome" disabled={isDisabled} />
            )}
          />

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

          <form.Field
            name="password"
            children={(field) => (
              <PasswordField
                field={field}
                label="Senha"
                placeholder="Senha"
                disabled={isDisabled}
                isVisible={isPasswordVisible}
                onToggleVisibility={() => setIsPasswordVisible((v) => !v)}
              />
            )}
          />

          <form.Field
            name="passwordConfirm"
            children={(field) => (
              <PasswordField
                field={field}
                label="Confirme sua senha"
                placeholder="Confirme sua senha"
                disabled={isDisabled}
                isVisible={isPasswordVisible}
                onToggleVisibility={() => setIsPasswordVisible((v) => !v)}
              />
            )}
          />
        </FieldGroup>
      </form>
    </AuthCard>
  );
}
