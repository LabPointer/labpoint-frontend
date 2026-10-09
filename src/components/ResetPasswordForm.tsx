import { useForm } from "@tanstack/react-form";
import { createLink} from "@tanstack/react-router";
import { ArrowLeft, Eye, EyeOff } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { InputGroup, InputGroupButton, InputGroupInput } from "./ui/input-group";

const formSchema = z.object({
  password: z
    .string("Senha invalida")
    .min(6, "Senha deve ter pelo menos 6 caracteres")
    .max(100, "Senha deve ter no maximo 100 caracteres"),
  passwordConfirm: z.string("Senha invalida"),
})
.superRefine((value, context) => {
    if (value.password !== value.passwordConfirm) {
      context.addIssue({
        code: "custom",
        path: ["password"],
        message: "As senhas não coincidem.",
      });
      context.addIssue({
        code: "custom",
        path: ["passwordConfirm"],
        message: "As senhas não coincidem.",
      });
    }
  });

interface ResetPasswordProps {
  isSubmitting: boolean;
  isRedirectting: boolean;
  onFormSubmitSuccess: (newPassowrd: string) => Promise<void>;
}

export function ResetPasswordForm(props: ResetPasswordProps) {
  const { isSubmitting, isRedirectting, onFormSubmitSuccess } = props;
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const LinkButton = createLink(Button);

  const form = useForm({
    defaultValues: {
      password: "",
      passwordConfirm: "",
    },
    validators: {
      onSubmit: formSchema,
    },
    onSubmit: async ({ value }) => {
      onFormSubmitSuccess(value.password);
      form.reset();
    },
  });

  return (
    <Card className="w-full sm:max-w-md bg-white shadow-md hover:shadow-lg dark:border-violet-500/10 dark:bg-white/5 dark:shadow-violet-300/15">
      <CardHeader className="pb-5 border-b">
        <CardTitle className="font-bold">Recuperar senha</CardTitle>
        <CardDescription>Informe seu e-mail institucional e enviaremos as instruções de redefinição.</CardDescription>
      </CardHeader>
      <CardContent>
        <form
          id="sign-in-form"
          onSubmit={(e) => {
            e.preventDefault();
            form.handleSubmit();
          }}
        >
          <FieldGroup>
            <form.Field
              name="password"
              children={(field) => {
                const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
                return (
                  <Field data-invalid={isInvalid}>
                    <FieldLabel className={"font-semibold"} htmlFor={field.name}>
                      Nova senha
                    </FieldLabel>
                    <InputGroup>
                      <InputGroupInput
                        disabled={isSubmitting || isRedirectting}
                        id={field.name}
                        name={field.name}
                        value={field.state.value}
                        onBlur={field.handleBlur}
                        onChange={(e) => field.handleChange(e.target.value)}
                        aria-invalid={isInvalid}
                        type={isPasswordVisible ? "text" : "password"}
                        placeholder="Senha"
                        autoComplete="off"
                      />
                      <InputGroupButton
                        aria-label={isPasswordVisible ? "Ocultar senha" : "Visualizar senha"}
                        title={isPasswordVisible ? "Ocultar senha" : "Visualizar senha"}
                        size="icon-sm"
                        onClick={() => setIsPasswordVisible((visible) => !visible)}
                      >
                        {isPasswordVisible ? <EyeOff /> : <Eye />}
                      </InputGroupButton>
                    </InputGroup>
                    {isInvalid && <FieldError errors={field.state.meta.errors} />}
                  </Field>
                );
              }}
            />

            <form.Field
              name="passwordConfirm"
              children={(field) => {
                const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
                return (
                  <Field data-invalid={isInvalid}>
                    <FieldLabel className={"font-semibold"} htmlFor={field.name}>
                      Confirme a nova senha
                    </FieldLabel>
                    <InputGroup>
                      <InputGroupInput
                        disabled={isSubmitting || isRedirectting}
                        id={field.name}
                        name={field.name}
                        value={field.state.value}
                        onBlur={field.handleBlur}
                        onChange={(e) => field.handleChange(e.target.value)}
                        aria-invalid={isInvalid}
                        type={isPasswordVisible ? "text" : "password"}
                        placeholder="Confirmar senha"
                        autoComplete="off"
                      />
                      <InputGroupButton
                        aria-label={isPasswordVisible ? "Ocultar senha" : "Visualizar senha"}
                        title={isPasswordVisible ? "Ocultar senha" : "Visualizar senha"}
                        size="icon-sm"
                        onClick={() => setIsPasswordVisible((visible) => !visible)}
                      >
                        {isPasswordVisible ? <EyeOff /> : <Eye />}
                      </InputGroupButton>
                    </InputGroup>
                    {isInvalid && <FieldError errors={field.state.meta.errors} />}
                  </Field>
                );
              }}
            />
          </FieldGroup>
        </form>
      </CardContent>
      <CardFooter className="bg-transparent">
        <Field orientation="vertical">
          <Button type="submit" form="sign-in-form" disabled={isSubmitting || isRedirectting}>
            Redefinir senha
          </Button>
          <div className="w-full justify-center flex items-center gap-0">
            <LinkButton className={"font-semibold px-1 dark:text-violet-400"} type="button" variant="link" to="/" disabled={isSubmitting || isRedirectting}>
              <ArrowLeft />
              <span>Voltar para o login</span>
            </LinkButton>
          </div>
        </Field>
      </CardFooter>
    </Card>
  );
}
