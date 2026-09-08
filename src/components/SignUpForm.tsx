import { useForm } from "@tanstack/react-form";
import { createLink, useNavigate } from "@tanstack/react-router";
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
import { UserRole } from "@/lib/service";
import {
    Combobox,
    ComboboxContent,
    ComboboxEmpty,
    ComboboxInput,
    ComboboxItem,
    ComboboxList,
} from "./ui/combobox";

const formSchema = z.object({
    name: z
        .string("Nome invalido")
        .min(4, "Nome deve ter pelo menos 4 caracteres"),
    registration: z
        .string("Matricula invalida")
        .min(4, "Matricula deve ter pelo menos 4 caracteres"),
    role: UserRole,
    email: z.email("Email invalido"),
    password: z
        .string("Senha invalida")
        .min(6, "Senha deve ter pelo menos 6 caracteres"),
    passwordConfirm: z
        .string("Confirmação de senha invalida")
        .min(6, "Confirmação de senha deve ter pelo menos 6 caracteres"),
});

export function SignUpForm() {
    const LinkButton = createLink(Button);
    const [isPasswordVisible, setIsPasswordVisible] = React.useState(false);
    const api = useApi();
    const navigate = useNavigate();

    const form = useForm({
        defaultValues: {
            name: "",
            registration: "",
            role: "USER",
            email: "",
            password: "",
            passwordConfirm: "",
        },
        validators: {
            onSubmit: formSchema,
        },
        onSubmit: async ({ value }) => {
            if (value.password !== value.passwordConfirm) {
                toast.error("As senhas não coincidem", {
                    duration: 2000,
                    position: "bottom-center",
                    style: {
                        color: "white",
                        backgroundColor: "red",
                        borderColor: "red",
                    },
                });
                return;
            }

            const response = await api.POST("/auth/sign-up", {
                body: {
                    username: value.name,
                    registration: value.registration,
                    role: value.role as "OWNER" | "ADMIN" | "USER",
                    email: value.email,
                    password: value.password,
                    passwordConfirm: value.passwordConfirm,
                },
            });

            const { ok, status, statusText } = response.response;

            if (!ok) {
                toast.error(
                    `Erro ${status}: ${status === 400 ? "Usuário já registrado" : statusText}`,
                    {
                        duration: 2000,
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

            toast.success(
                `Usuario criado com sucesso! Aguarde para que um administrador ative sua conta.`,
                {
                    duration: 5000,
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
                <CardTitle className="font-bold">Criar uma conta</CardTitle>
                <CardDescription>
                    Preencha seus dados institucionais para começar a reservar.
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
                            name="name"
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
                                            Nome
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
                                            placeholder="Nome"
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
                            name="role"
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
                                            Cargo
                                        </FieldLabel>
                                        <Combobox
                                            items={UserRole.options}
                                            defaultValue={UserRole.options[1]}
                                            onValueChange={(value) =>
                                                field.handleChange(
                                                    value ? value : "",
                                                )
                                            }
                                        >
                                            <ComboboxInput placeholder="Selecione um cargo" />
                                            <ComboboxContent>
                                                <ComboboxEmpty>
                                                    No items found.
                                                </ComboboxEmpty>
                                                <ComboboxList>
                                                    {(item) => (
                                                        <ComboboxItem
                                                            key={item}
                                                            value={item}
                                                        >
                                                            {item}
                                                        </ComboboxItem>
                                                    )}
                                                </ComboboxList>
                                            </ComboboxContent>
                                        </Combobox>
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
                            name="email"
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
                                            E-mail
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
                                            type="email"
                                            placeholder="E-mail"
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
                        <form.Field
                            name="passwordConfirm"
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
                                            Confirme sua senha
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
                                                placeholder="Confirme sua senha"
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
                        Cadastrar
                    </Button>
                    <div className="w-full justify-center flex items-center gap-0">
                        <span>Já tem conta?</span>
                        <LinkButton
                            className={
                                "font-semibold px-1 dark:text-violet-400 underline"
                            }
                            type="button"
                            variant="link"
                            to="/"
                        >
                            Entrar
                        </LinkButton>
                    </div>
                </Field>
            </CardFooter>
        </Card>
    );
}
