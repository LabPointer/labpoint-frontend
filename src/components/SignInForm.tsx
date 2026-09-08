import { useForm } from "@tanstack/react-form";
import { createLink, useNavigate, useRouter } from "@tanstack/react-router";
import { Eye, EyeOff } from "lucide-react";
import * as React from "react";
import { toast } from "sonner";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {
    Field,
    FieldError,
    FieldGroup,
    FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
    InputGroup,
    InputGroupButton,
    InputGroupInput,
} from "@/components/ui/input-group";
import { useApi } from "@/lib/restapi";
import { type sessionSchema, setIsAuthenticated, setSessionServerFn } from "@/lib/session";

const formSchema = z.object({
    registration: z
        .string("Matricula invalida")
        .min(5, "Matricula deve ter pelo menos 5 caracteres")
        .max(16, "Matricula deve ter no maximo 16 caracteres"),
    password: z
        .string("Senha invalida")
        .min(5, "Senha deve ter pelo menos 5 caracteres")
        .max(16, "Senha deve ter no maximo 16 caracteres"),
});

export function SignInForm() {
    const LinkButton = createLink(Button);
    const [isPasswordVisible, setIsPasswordVisible] = React.useState(false);
    const api = useApi();
    const navigate = useNavigate();
    const router = useRouter();

    const form = useForm({
        defaultValues: {
            registration: "",
            password: "",
        },
        validators: {
            onSubmit: formSchema,
        },
        onSubmit: async ({ value }) => {
            const response = await api.POST("/auth/sign-in", {
                body: {
                    registration: value.registration,
                    password: value.password,
                },
            });

            const { data } = response;
            const { ok, status, statusText } = response.response;

            if (!ok || !data) {
                toast.error(
                    `Erro ${status}: ${status === 403 ? "Matrícula ou senha incorretos" : statusText}`,
                    {
                        duration: 2000,
                        onAutoClose: () => {
                            navigate({ to: "/" });
                        },
                        position: "bottom-center",
                        style: {
                            color: "white",
                            backgroundColor: "red",
                            borderColor: "red",
                        },
                    },
                );

                return;
            }

            const sessionData = {
                expire_in: data.tokenExpireIn.toString(),
                role: data.role as ("OWNER" | "ADMIN" | "USER"),
                username: data.username as string,
            } satisfies z.infer<typeof sessionSchema>;

            await Promise.all([
                setSessionServerFn({ data: sessionData }),
                setIsAuthenticated({ data: true }),
            ]);

            await router.invalidate();

            toast.success(
                "Bem vindo ao Labpoint! Você será redirecionado em alguns segundos.",
                {
                    duration: 3000,
                    onAutoClose: () => {
                        navigate({ to: "/" });
                    },
                    position: "bottom-center",
                    style: {
                        color: "white",
                        backgroundColor: "green",
                        borderColor: "green",
                    },
                },
            );
        },
    });

    return (
        <Card className="w-full sm:max-w-md bg-white shadow-md hover:shadow-lg dark:border-violet-500/10 dark:bg-white/5 dark:shadow-violet-300/15">
            <CardHeader className="pb-5 border-b">
                <CardTitle className="font-bold">Entre com sua conta</CardTitle>
                <CardDescription>
                    Use sua matrícula institucional para acessar o sistema.
                </CardDescription>
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
                                const isInvalid =
                                    field.state.meta.isTouched &&
                                    !field.state.meta.isValid;
                                return (
                                    <Field data-invalid={isInvalid}>
                                        <FieldLabel
                                            className={"font-semibold"}
                                            htmlFor={field.name}
                                        >
                                            Matrícula
                                        </FieldLabel>
                                        <Input
                                            id={field.name}
                                            name={field.name}
                                            value={field.state.value}
                                            onBlur={field.handleBlur}
                                            onChange={(e) =>
                                                field.handleChange(
                                                    e.target.value,
                                                )
                                            }
                                            aria-invalid={isInvalid}
                                            placeholder="Matricula"
                                            autoComplete="off"
                                        />
                                        {isInvalid && (
                                            <FieldError
                                                errors={field.state.meta.errors}
                                            />
                                        )}
                                    </Field>
                                );
                            }}
                        />
                        <form.Field
                            name="password"
                            children={(field) => {
                                const isInvalid =
                                    field.state.meta.isTouched &&
                                    !field.state.meta.isValid;
                                return (
                                    <Field data-invalid={isInvalid}>
                                        <FieldLabel
                                            className={"font-semibold"}
                                            htmlFor={field.name}
                                        >
                                            Senha
                                        </FieldLabel>
                                        <InputGroup>
                                            <InputGroupInput
                                                id={field.name}
                                                name={field.name}
                                                value={field.state.value}
                                                onBlur={field.handleBlur}
                                                onChange={(e) =>
                                                    field.handleChange(
                                                        e.target.value,
                                                    )
                                                }
                                                aria-invalid={isInvalid}
                                                type={
                                                    isPasswordVisible
                                                        ? "text"
                                                        : "password"
                                                }
                                                placeholder="Senha"
                                                autoComplete="off"
                                            />
                                            <InputGroupButton
                                                aria-label={
                                                    isPasswordVisible
                                                        ? "Ocultar senha"
                                                        : "Visualizar senha"
                                                }
                                                title={
                                                    isPasswordVisible
                                                        ? "Ocultar senha"
                                                        : "Visualizar senha"
                                                }
                                                size="icon-sm"
                                                onClick={() =>
                                                    setIsPasswordVisible(
                                                        (visible) => !visible,
                                                    )
                                                }
                                            >
                                                {isPasswordVisible ? (
                                                    <EyeOff />
                                                ) : (
                                                    <Eye />
                                                )}
                                            </InputGroupButton>
                                        </InputGroup>
                                        {isInvalid && (
                                            <FieldError
                                                errors={field.state.meta.errors}
                                            />
                                        )}
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
                        Entrar
                    </Button>
                    <LinkButton
                        className={
                            "font-semibold dark:text-violet-400 underline"
                        }
                        type="button"
                        variant="link"
                        to="/forget-password"
                    >
                        Esqueci minha senha
                    </LinkButton>
                    <div className="w-full justify-center flex items-center gap-0">
                        <span>Não tem conta?</span>
                        <LinkButton
                            className={
                                "font-semibold px-1 dark:text-violet-400 underline"
                            }
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
