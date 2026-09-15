import { useForm } from "@tanstack/react-form";
import { createLink, useNavigate } from "@tanstack/react-router";
import { ArrowLeft, Eye, EyeOff } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import * as z from "zod";
import { useApi } from "#/lib/utils/restapi";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { InputGroup, InputGroupButton, InputGroupInput } from "./ui/input-group";

const formSchema = z.object({
  password: z
    .string("Senha invalida")
    .min(5, "Senha deve ter pelo menos 5 caracteres")
    .max(16, "Senha deve ter no maximo 16 caracteres"),
  confirmPassword: z.string("Senha invalida"),
});

type ResetPasswordProps = {
  token: string;
};

export function ResetPasswordForm(props: ResetPasswordProps) {
  const { token } = props;
  const api = useApi();
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const LinkButton = createLink(Button);
  const navigate = useNavigate();

  const form = useForm({
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
    validators: {
      onSubmit: formSchema,
    },
    onSubmit: async ({ value }) => {
      if (value.password !== value.confirmPassword) {
        toast.error("As senhas não coincidem.", {
          duration: 3000,
          position: "bottom-center",
          style: {
            color: "white",
            backgroundColor: "red",
            borderColor: "red",
          },
        });
        return;
      }

      const res = await api.PATCH("/auth/reset-password/{token}", {
        params: {
          path: { token: token },
        },
        body: {
          password: value.password,
        },
      });

      const { response, error } = res;

      if (!response.ok && error) {
        toast.error(`Error ${response.status}: ${error.message}`, {
          duration: 3000,
          position: "bottom-center",
          style: {
            color: "white",
            backgroundColor: "red",
            borderColor: "red",
          },
        });
        form.reset();
        return;
      }

      toast.success("Senha redefinida com sucesso!", {
        duration: 3000,
        position: "bottom-center",
        onAutoClose: () => {
          navigate({ to: "/" });
        },
        style: {
          color: "white",
          backgroundColor: "green",
          borderColor: "green",
        },
      });
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
              name="confirmPassword"
              children={(field) => {
                const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
                return (
                  <Field data-invalid={isInvalid}>
                    <FieldLabel className={"font-semibold"} htmlFor={field.name}>
                      Confirme a nova senha
                    </FieldLabel>
                    <InputGroup>
                      <InputGroupInput
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
          <Button type="submit" form="sign-in-form">
            Redefinir senha
          </Button>
          <div className="w-full justify-center flex items-center gap-0">
            <LinkButton className={"font-semibold px-1 dark:text-violet-400"} type="button" variant="link" to="/">
              <ArrowLeft />
              <span>Voltar para o login</span>
            </LinkButton>
          </div>
        </Field>
      </CardFooter>
    </Card>
  );
}
