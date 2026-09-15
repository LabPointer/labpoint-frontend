import { useForm } from "@tanstack/react-form";
import { createLink, useNavigate } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import * as z from "zod";
import { useApi } from "#/lib/utils/restapi";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";

const formSchema = z.object({
  email: z.email("E-mail invalido"),
});

export function ForgetPasswordForm() {
  const api = useApi();
  const LinkButton = createLink(Button);
  const navigate = useNavigate();

  const form = useForm({
    defaultValues: {
      email: "",
    },
    validators: {
      onSubmit: formSchema,
    },
    onSubmit: async ({ value }) => {
      const res = await api.POST("/auth/forgot-password", {
        body: {
          email: value.email,
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

      toast.success("Email de recuperação enviado com sucesso!", {
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
              name="email"
              children={(field) => {
                const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
                return (
                  <Field data-invalid={isInvalid}>
                    <FieldLabel className={"font-semibold"} htmlFor={field.name}>
                      E-mail
                    </FieldLabel>
                    <Input
                      id={field.name}
                      name={field.name}
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                      aria-invalid={isInvalid}
                      type="email"
                      placeholder="E-mail"
                      autoComplete="off"
                    />
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
            Enviar
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
