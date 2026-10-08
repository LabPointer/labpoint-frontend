import z from "zod";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "../ui/dialog";
import { useForm } from "@tanstack/react-form";
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel } from "../ui/field";
import { InputGroup, InputGroupTextarea, InputGroupAddon, InputGroupText } from "../ui/input-group";
import { Checkbox } from "../ui/checkbox";
import { Button } from "../ui/button";
import { Input } from "../ui/input";

export type ManageCreateResourceData = {
  name: string;
  description: string;
  canBeReserved: boolean;
  status: boolean;
};

export type ManageCreateResourceDialogProps = {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: ManageCreateResourceData) => Promise<void>;
};

const formSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório.").max(100, "Nome deve ter no máximo 100 caracteres."),
  description: z.string().min(1, "Descrição é obrigatória.").max(200, "Descrição deve ter no máximo 200 caracteres."),
  canBeReserved: z.boolean(),
  status: z.boolean(),
});

export function ManageCreateResourceDialog({ isOpen, onClose, onSubmit }: ManageCreateResourceDialogProps) {
  const form = useForm({
    defaultValues: {
      name: "",
      description: "",
      canBeReserved: false,
      status: true,
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
          <DialogTitle>Criar novo recurso</DialogTitle>
          <DialogDescription>
            Por favor, preencha os detalhes necessários para prosseguir com a criação do recurso.
          </DialogDescription>
        </DialogHeader>

        <form
          id="create-resource-form"
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
                      placeholder="Nome do recurso..."
                      autoComplete="off"
                    />
                    {isInvalid && <FieldError errors={field.state.meta.errors} />}
                  </Field>
                );
              }}
            />
            <form.Field
              name="description"
              children={(field) => {
                const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
                return (
                  <Field data-invalid={isInvalid}>
                    <FieldLabel htmlFor={field.name}>Descrição</FieldLabel>
                    <InputGroup>
                      <InputGroupTextarea
                        id={field.name}
                        name={field.name}
                        value={field.state.value}
                        onBlur={field.handleBlur}
                        onChange={(e) => field.handleChange(e.target.value)}
                        placeholder="Descrição do recurso..."
                        rows={6}
                        className="min-h-24 resize-none"
                        aria-invalid={isInvalid}
                      />
                      <InputGroupAddon align="block-end">
                        <InputGroupText className="tabular-nums">
                          {field.state.value.length}/200 characters
                        </InputGroupText>
                      </InputGroupAddon>
                    </InputGroup>
                    <FieldDescription>Descreva o para que serve o recurso.</FieldDescription>
                    {isInvalid && <FieldError errors={field.state.meta.errors} />}
                  </Field>
                );
              }}
            />
            <form.Field
              name="canBeReserved"
              children={(field) => {
                const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
                return (
                  <Field orientation="horizontal" data-invalid={isInvalid}>
                    <Checkbox
                      id="terms-checkbox-basic"
                      name="terms-checkbox-basic"
                      checked={field.state.value}
                      onCheckedChange={(e) => field.setValue(e)}
                    />
                    <FieldLabel htmlFor="terms-checkbox-basic">Recurso pode ser reservado</FieldLabel>
                    {isInvalid && <FieldError errors={field.state.meta.errors} />}
                  </Field>
                );
              }}
            />
            <form.Field
              name="status"
              children={(field) => {
                const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
                return (
                  <Field orientation="horizontal" data-invalid={isInvalid}>
                    <Checkbox
                      id="terms-checkbox-basic"
                      name="terms-checkbox-basic"
                      checked={field.state.value}
                      onCheckedChange={(e) => field.setValue(e)}
                    />
                    <FieldLabel htmlFor="terms-checkbox-basic">Status</FieldLabel>
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
              Reset
            </Button>
            <Button type="submit" form="create-resource-form">
              Submit
            </Button>
          </Field>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
