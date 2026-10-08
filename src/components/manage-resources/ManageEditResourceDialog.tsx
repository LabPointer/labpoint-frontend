import { useForm } from "@tanstack/react-form";
import z from "zod";
import { Button } from "../ui/button";
import { Checkbox } from "../ui/checkbox";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "../ui/dialog";
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel } from "../ui/field";
import { Input } from "../ui/input";
import { InputGroup, InputGroupAddon, InputGroupText, InputGroupTextarea } from "../ui/input-group";

export type ManageEditResourceData = {
  id: number;
  name: string;
  description: string;
  canBeReserved: boolean;
  status: boolean;
};

export type ManageEditResourceDialogProps = {
  data: ManageEditResourceData;
  isOpen: boolean;
  onSubmit: (data: ManageEditResourceData) => Promise<void>;
  onClose: () => void;
};

const formSchema = z.object({
  name: z.string().max(100, "Nome deve ter no máximo 100 caracteres."),
  description: z.string().max(200, "Descrição deve ter no máximo 200 caracteres."),
  canBeReserved: z.boolean(),
  status: z.boolean(),
});

export function ManageEditResourceDialog({ data, isOpen, onClose, onSubmit }: ManageEditResourceDialogProps) {
  const { name, description, canBeReserved, status } = data;
  const form = useForm({
    defaultValues: {
      name: "",
      description: "",
      canBeReserved,
      status,
    },
    validators: {
      onSubmit: formSchema,
    },
    onSubmit: async ({ value }) => {
      await onSubmit({
        id: data.id,
        name: value.name,
        description: value.description,
        canBeReserved: value.canBeReserved,
        status: value.status,
      });
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
          <DialogTitle>Editar recurso</DialogTitle>
          <DialogDescription>
            Por favor, preencha apenas os campos que deseja alterar para prosseguir com a edição do recurso.
          </DialogDescription>
        </DialogHeader>
        <form
          id="edit-resource-form"
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
                      className="min-h-8 p-2 border border-black/10 dark:border-white/10 rounded-md"
                      id={field.name}
                      name={field.name}
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                      aria-invalid={isInvalid}
                      placeholder={`Nome atual: ${name}`}
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
                        placeholder={`Descrição atual: ${description}`}
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
                      checked={field.state.value as boolean}
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
                      checked={field.state.value as boolean}
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
            <Button type="submit" form="edit-resource-form">
              Submit
            </Button>
          </Field>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
