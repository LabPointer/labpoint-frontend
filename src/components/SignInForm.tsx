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
	registration: z.string("Matricula invalida"),
	password: z
		.string("Senha invalida")
		.min(6, "Senha deve ter pelo menos 6 caracteres"),
});

export function SignInForm() {
	const LinkButton = createLink(Button);
	const [isPasswordVisible, setIsPasswordVisible] = React.useState(false);

	const form = useForm({
		defaultValues: {
			registration: "",
			password: "",
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
					</FieldGroup>
				</form>
			</CardContent>
			<CardFooter className="bg-transparent">
				<Field orientation="vertical">
					<Button type="submit" form="sign-in-form">
						Entrar
					</Button>
					<LinkButton
						className={"font-semibold dark:text-violet-400 underline"}
						type="button"
						variant="link"
						to="/forget-password"
					>
						Esqueci minha senha
					</LinkButton>
					<div className="w-full justify-center flex items-center gap-0">
						<span>Não tem conta?</span>
						<LinkButton
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
