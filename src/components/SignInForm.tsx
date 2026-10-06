import { useForm } from "@tanstack/react-form";
import { createLink } from "@tanstack/react-router";
import { Eye, EyeOff } from "lucide-react";
import * as React from "react";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { InputGroup, InputGroupButton, InputGroupInput } from "@/components/ui/input-group";
import { Checkbox } from "./ui/checkbox";
import { Label } from "./ui/label";

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
  const [isPasswordVisible, setIsPasswordVisible] = React.useState(false);

  const form = useForm({
    defaultValues: {
      registration: "",
      password: "",
      rememberMe: false,
    },
    validators: {
      onSubmit: formSchema,
    },
    onSubmit: async ({ value }) => {
      await onFormSubmit(value.registration, value.password, value.rememberMe);
    },
  });

  return (
    <Card className="w-full sm:max-w-md bg-white shadow-md hover:shadow-lg dark:border-violet-500/10 dark:bg-white/5 dark:shadow-violet-300/15">
      <CardHeader className="pb-5 border-b">
        <CardTitle className="font-bold">Entre com sua conta</CardTitle>
        <CardDescription>Use sua matrícula institucional para acessar o sistema.</CardDescription>
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
              name="registration"
              children={(field) => {
                const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
                return (
                  <Field data-invalid={isInvalid}>
                    <FieldLabel className={"font-semibold"} htmlFor={field.name}>
                      Matrícula
                    </FieldLabel>
                    <Input
                      disabled={isRedirecting || isLoading}
                      id={field.name}
                      name={field.name}
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                      aria-invalid={isInvalid}
                      placeholder="Matricula"
                      autoComplete="off"
                    />
                    {isInvalid && <FieldError errors={field.state.meta.errors} />}
                  </Field>
                );
              }}
            />
            <form.Field
              name="password"
              children={(field) => {
                const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
                return (
                  <Field data-invalid={isInvalid}>
                    <FieldLabel className={"font-semibold"} htmlFor={field.name}>
                      <span>Senha</span>
                      <LinkButton
                        disabled={isRedirecting || isLoading}
                        className={"font-semibold dark:text-violet-400 underline ml-auto"}
                        type="button"
                        variant="link"
                        to="/forget-password"
                      >
                        Esqueci minha senha
                      </LinkButton>
                    </FieldLabel>

                    <InputGroup>
                      <InputGroupInput
                        disabled={isRedirecting || isLoading}
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
              name="rememberMe"
              children={(field) => {
                const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
                return (
                  <Field data-invalid={isInvalid}>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        disabled={isRedirecting || isLoading}
                        id={field.name}
                        checked={field.state.value}
                        onCheckedChange={(checked) => field.handleChange(checked === true)}
                        onBlur={field.handleBlur}
                      />
                      <Label htmlFor={field.name}>Lembrar-me</Label>
                    </div>
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
          <Button type="submit" form="sign-in-form" disabled={isRedirecting || isLoading}>
            Entrar
          </Button>
          <LinkButton
            disabled={isRedirecting || isLoading}
            className={"font-semibold dark:text-violet-400 underline"}
            type="button"
            variant="link"
            to="/resend-email-confirmation"
          >
            Reenviar email de confirmação
          </LinkButton>
          <div className="w-full justify-center flex items-center gap-0">
            <span>Não tem conta?</span>
            <LinkButton
              disabled={isRedirecting || isLoading}
              className={"font-semibold px-1 dark:text-violet-400 underline"}
              type="button"
              variant="link"
              to="/sign-up"
            >
              Cadastre-se
            </LinkButton>
          </div>
        </Field>
      </CardFooter>
    </Card>
  );
}
