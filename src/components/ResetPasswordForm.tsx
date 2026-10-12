import { useState } from "react";
import { useForm } from "@tanstack/react-form";
import { createLink } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Field, FieldGroup } from "@/components/ui/field";
import { AuthCard } from "./_public/AuthCard";
import { PasswordField } from "./_public/PasswordField";
import { SubmitButton } from "./_public/SubmitButton";

const formSchema = z
  .object({
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

interface ResetPasswordProps {
  isSubmitting: boolean;
  isRedirectting: boolean;
  onFormSubmitSuccess: (newPassword: string) => Promise<void>;
}

export function ResetPasswordForm({ isSubmitting, isRedirectting, onFormSubmitSuccess }: ResetPasswordProps) {
  const LinkButton = createLink(Button);
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const isDisabled = isSubmitting || isRedirectting;

  const form = useForm({
    defaultValues: { password: "", passwordConfirm: "" },
    validators: { onSubmit: formSchema },
    onSubmit: async ({ value }) => {
      await onFormSubmitSuccess(value.password);
      form.reset();
    },
  });

  return (
    <AuthCard
      title="Redefinir senha"
      description="Crie uma nova senha para a sua conta."
      footer={
        <Field orientation="vertical">
          <SubmitButton form="reset-password-form" isLoading={isSubmitting} disabled={isDisabled}>
            Redefinir senha
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
        id="reset-password-form"
        onSubmit={(e) => {
          e.preventDefault();
          form.handleSubmit();
        }}
      >
        <FieldGroup>
          <form.Field
            name="password"
            children={(field) => (
              <PasswordField
                field={field}
                label="Nova senha"
                placeholder="Nova senha"
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
                label="Confirme a nova senha"
                placeholder="Confirmar senha"
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
