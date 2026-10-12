import z from "zod";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "../ui/dialog";
import { useForm } from "@tanstack/react-form";
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel } from "../ui/field";
import { Checkbox } from "../ui/checkbox";
import { Button } from "../ui/button";
import { Input } from "../ui/input";

export type ManageCreateSubjectData = {
  name: string;
  enabled: boolean;
};

export type ManageCreateSubjectDialogProps = {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: ManageCreateSubjectData) => Promise<void>;
};

const formSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório.").max(100, "Nome deve ter no máximo 100 caracteres."),
  enabled: z.boolean(),
});

export function ManageCreateSubjectDialog({ isOpen, onClose, onSubmit }: ManageCreateSubjectDialogProps) {
  const form = useForm({
    defaultValues: {
      name: "",
      enabled: true,
    },
    validators: {
      onSubmit: formSchema,
    },
    onSubmit: async ({ value }) => {
      await onSubmit(value);
    },
  });

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open, eventDetails) => {
        if (open === false) {
          form.reset();
          onClose();
        }
      }}
    >
      <DialogContent className="sm:max-w-md bg-white/70 dark:bg-black/70 backdrop-blur-xl rounded-md border dark:border-violet-500/10 shadow-md hover:shadow-lg p-4 dark:shadow-violet-300/15">
        <DialogHeader>
          <DialogTitle>Criar nova matéria</DialogTitle>
          <DialogDescription>
            Por favor, preencha os detalhes necessários para prosseguir com a criação da matéria.
          </DialogDescription>
        </DialogHeader>

        <form
          id="create-subject-form"
          onSubmit={(e) => {
            e.preventDefault();
            form.handleSubmit();
          }}
        >
          <FieldGroup>
            <form.Field
              name="name"
              children={(field) => {
                const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
                return (
                  <Field data-invalid={isInvalid}>
                    <FieldLabel htmlFor={field.name}>Nome</FieldLabel>
                    <Input
                      className="min-h-8"
                      id={field.name}
                      name={field.name}
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                      aria-invalid={isInvalid}
                      placeholder="Nome da matéria..."
                      autoComplete="off"
                    />
                    {isInvalid && <FieldError errors={field.state.meta.errors} />}
                  </Field>
                );
              }}
            />
            <form.Field
              name="enabled"
              children={(field) => {
                const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
                return (
                  <Field data-invalid={isInvalid}>
                    <FieldLabel htmlFor={field.name}>Ativo</FieldLabel>
                    <Field orientation="horizontal" data-invalid={isInvalid}>
                      <Checkbox
                        id="enabled-checkbox-basic"
                        name="enabled-checkbox-basic"
                        checked={field.state.value as boolean}
                        onCheckedChange={(e) => field.setValue(e)}
                      />
                      <FieldLabel htmlFor="enabled-checkbox-basic">{field.state.value as boolean ? 'Ativo' : 'Inativo'}</FieldLabel>
                      {isInvalid && <FieldError errors={field.state.meta.errors} />}
                    </Field>
                    <FieldDescription>Uma trava para usar da materia.</FieldDescription>
                    {isInvalid && <FieldError errors={field.state.meta.errors} />}
                  </Field>
                );
              }}
            />
          </FieldGroup>
        </form>
        <DialogFooter className="flex bg-transparent border-t">
          <Field orientation="horizontal" className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => form.reset()}>
              Limpar
            </Button>
            <Button type="submit" form="create-subject-form">
              Criar
            </Button>
          </Field>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
