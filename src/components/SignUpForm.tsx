import { useForm } from "@tanstack/react-form";
import { createLink } from "@tanstack/react-router";
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

const formSchema = z.object({
    name: z.string("Nome invalido"),
	registration: z.string("Matricula invalida"),
    cargo: z.string("Cargo invalido"),
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

	const form = useForm({
		defaultValues: {
            name: "",
			registration: "",
            cargo: "",
            email: "",
			password: "",
            passwordConfirm: "",
		},
		validators: {
			onSubmit: formSchema,
		},
		onSubmit: async ({ value }) => {
			toast("You submitted the following values:", {
				description: (
					<pre className="mt-2 w-[320px] overflow-x-auto rounded-md bg-code p-4 text-code-foreground">
						<code>{JSON.stringify(value, null, 2)}</code>
					</pre>
				),
				position: "bottom-right",
				classNames: {
					content: "flex flex-col gap-2",
				},
				style: {
					"--border-radius": "calc(var(--radius)  + 4px)",
				} as React.CSSProperties,
			});
		},
	});

	return (
		<Card className="w-full sm:max-w-md bg-white/10 dark:bg-white/5 backdrop-blur-md">
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
									field.state.meta.isTouched && !field.state.meta.isValid;
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
											onChange={(e) => field.handleChange(e.target.value)}
											aria-invalid={isInvalid}
											placeholder="Nome"
											autoComplete="off"
										/>
										{isInvalid && (
											<FieldError errors={field.state.meta.errors} />
										)}
									</Field>
								);
							}}
						/>
						<form.Field
							name="registration"
							children={(field) => {
								const isInvalid =
									field.state.meta.isTouched && !field.state.meta.isValid;
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
											onChange={(e) => field.handleChange(e.target.value)}
											aria-invalid={isInvalid}
											placeholder="Matricula"
											autoComplete="off"
										/>
										{isInvalid && (
											<FieldError errors={field.state.meta.errors} />
										)}
									</Field>
								);
							}}
						/>
                        <form.Field
							name="cargo"
							children={(field) => {
								const isInvalid =
									field.state.meta.isTouched && !field.state.meta.isValid;
								return (
									<Field data-invalid={isInvalid}>
										<FieldLabel
											className={"font-semibold"}
											htmlFor={field.name}
										>
											Cargo
										</FieldLabel>
										<Input
											id={field.name}
											name={field.name}
											value={field.state.value}
											onBlur={field.handleBlur}
											onChange={(e) => field.handleChange(e.target.value)}
											aria-invalid={isInvalid}
											placeholder="Selecione um cargo"
											autoComplete="off"
										/>
										{isInvalid && (
											<FieldError errors={field.state.meta.errors} />
										)}
									</Field>
								);
							}}
						/>
                        <form.Field
							name="email"
							children={(field) => {
								const isInvalid =
									field.state.meta.isTouched && !field.state.meta.isValid;
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
											onChange={(e) => field.handleChange(e.target.value)}
											aria-invalid={isInvalid}
                                            type="email"
											placeholder="E-mail"
											autoComplete="off"
										/>
										{isInvalid && (
											<FieldError errors={field.state.meta.errors} />
										)}
									</Field>
								);
							}}
						/>
						<form.Field
							name="password"
							children={(field) => {
								const isInvalid =
									field.state.meta.isTouched && !field.state.meta.isValid;
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
												onChange={(e) => field.handleChange(e.target.value)}
												aria-invalid={isInvalid}
												type={isPasswordVisible ? "text" : "password"}
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
													setIsPasswordVisible((visible) => !visible)
												}
											>
												{isPasswordVisible ? <EyeOff /> : <Eye />}
											</InputGroupButton>
										</InputGroup>
										{isInvalid && (
											<FieldError errors={field.state.meta.errors} />
										)}
									</Field>
								);
							}}
						/>
                        <form.Field
							name="passwordConfirm"
							children={(field) => {
								const isInvalid =
									field.state.meta.isTouched && !field.state.meta.isValid;
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
												onChange={(e) => field.handleChange(e.target.value)}
												aria-invalid={isInvalid}
												type={isPasswordVisible ? "text" : "password"}
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
													setIsPasswordVisible((visible) => !visible)
												}
											>
												{isPasswordVisible ? <EyeOff /> : <Eye />}
											</InputGroupButton>
										</InputGroup>
										{isInvalid && (
											<FieldError errors={field.state.meta.errors} />
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
					<div className="w-full justify-center flex items-center gap-0">
						<span>Já tem conta?</span>
						<LinkButton
							className={"font-semibold px-1 dark:text-violet-400 underline"}
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
