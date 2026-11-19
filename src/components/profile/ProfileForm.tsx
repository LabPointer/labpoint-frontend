import { useForm, useStore } from "@tanstack/react-form";
import z from "zod";
import { type Account, type MyAccountEditPayload, roleLabel, useEditMyAccount } from "#/lib/queries/accounts";
import { succeeded } from "#/lib/utils/api-result";
import { SubjectSelect } from "@/components/shared/entity-selects";
import type { RemoteOption } from "@/components/shared/RemoteCombobox";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";

const formSchema = z.object({
  username: z.string().trim().min(1, "Nome é obrigatório.").max(100, "Nome deve ter no máximo 100 caracteres."),
  subject: z.object({ id: z.number(), name: z.string() }).or(z.undefined()),
});

function initials(name: string) {
  return (
    name
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase())
      .join("") || "LP"
  );
}

/**
 * Edição da própria conta (nome e matéria). Os valores iniciais vêm de `account`;
 * para refletir outra conta, o pai deve remontar o componente (`key`).
 */
export function ProfileForm({ account }: { account: Account }) {
  const editMyAccount = useEditMyAccount();

  const initialSubject = account.subject
    ? { id: Number(account.subject.id), name: account.subject.name }
    : (undefined as RemoteOption | undefined);

  const form = useForm({
    defaultValues: { username: account.username, subject: initialSubject },
    validators: { onSubmit: formSchema },
    onSubmit: async ({ value, formApi }) => {
      // PATCH parcial: só envia o que mudou.
      const payload: MyAccountEditPayload = {};
      const username = value.username.trim();
      if (username !== account.username) payload.username = username;
      if (value.subject && value.subject.id !== initialSubject?.id) payload.subjectId = value.subject.id;

      if (Object.keys(payload).length === 0) return;

      if (await succeeded(editMyAccount.mutateAsync(payload))) {
        // Os valores salvos passam a ser a nova base do formulário (o botão Salvar volta a ficar desabilitado).
        formApi.reset({ username, subject: value.subject });
      }
    },
  });

  const isSubmitting = useStore(form.store, (state) => state.isSubmitting);
  const isDirty = useStore(form.store, (state) => state.isDirty);

  return (
    <Card className="mx-auto w-full max-w-2xl bg-white/70 p-4 shadow-md backdrop-blur-xl hover:shadow-lg sm:max-w-md dark:border-violet-500/10 dark:bg-black/30 dark:shadow-violet-300/15">
      <CardHeader className="flex flex-row items-center gap-4">
        <Avatar className="size-16">
          <AvatarImage src="https://github.com/shadcn.png" />
          <AvatarFallback>{initials(account.username)}</AvatarFallback>
        </Avatar>
        <div className="flex min-w-0 flex-col gap-1">
          <CardTitle className="truncate text-xl">{account.username}</CardTitle>
          <CardDescription className="truncate">{account.email}</CardDescription>
          <Badge variant="secondary" className="w-fit">
            {roleLabel(account.role)}
          </Badge>
        </div>
      </CardHeader>

      <form
        id="profile-form"
        onSubmit={(event) => {
          event.preventDefault();
          form.handleSubmit();
        }}
      >
        <CardContent>
          <FieldGroup>
            <form.Field name="username">
              {(field) => {
                const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
                return (
                  <Field data-invalid={isInvalid}>
                    <FieldLabel htmlFor={field.name}>Nome</FieldLabel>
                    <Input
                      id={field.name}
                      name={field.name}
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(event) => field.handleChange(event.target.value)}
                      aria-invalid={isInvalid}
                      autoComplete="name"
                    />
                    {isInvalid && <FieldError errors={field.state.meta.errors} />}
                  </Field>
                );
              }}
            </form.Field>

            <form.Field name="subject">
              {(field) => (
                <SubjectSelect
                  id="profile-subject"
                  label="Matéria"
                  enabledOnly
                  value={field.state.value}
                  onValueChange={field.handleChange}
                />
              )}
            </form.Field>

            <div className="grid gap-4 sm:grid-cols-2">
              <Field>
                <FieldLabel htmlFor="profile-registration">Matrícula</FieldLabel>
                <Input id="profile-registration" value={account.registration} disabled readOnly />
              </Field>
              <Field>
                <FieldLabel htmlFor="profile-email">E-mail</FieldLabel>
                <Input id="profile-email" value={account.email} disabled readOnly />
              </Field>
            </div>
            <FieldDescription>Matrícula, e-mail e cargo só podem ser alterados por um administrador.</FieldDescription>
          </FieldGroup>
        </CardContent>

        <CardFooter className="flex border-t bg-transparent items-center justify-end">
          <Button type="button" variant="outline" disabled={!isDirty || isSubmitting} onClick={() => form.reset()}>
            Descartar
          </Button>
          <Button type="submit" disabled={!isDirty || isSubmitting}>
            {isSubmitting && <Spinner />}
            Salvar
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
