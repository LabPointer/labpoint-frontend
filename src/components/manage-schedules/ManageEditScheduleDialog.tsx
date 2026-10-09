import { useForm } from "@tanstack/react-form";
import { useState } from "react";
import z from "zod";
import { Button } from "../ui/button";
import { Checkbox } from "../ui/checkbox";
import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
  ComboboxValue,
} from "../ui/combobox";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "../ui/dialog";
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel } from "../ui/field";
import { Input } from "../ui/input";

export type ManageEditScheduleData = {
  id: number;
  startAt: string | undefined;
  endAt: string | undefined;
  shift: number | undefined;
  enabled: boolean | undefined;
};

export type ManageEditScheduleDialogProps = {
  data: ManageEditScheduleData;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: ManageEditScheduleData) => Promise<void>;
};

const formSchema = z
  .object({
    startAt: z
      .string()
      .min(1, "Horario de início é obrigatório.")
      .max(100, "Horario de início deve ter no máximo 100 caracteres."),
    endAt: z
      .string()
      .min(1, "Horario de término é obrigatório.")
      .max(100, "Horario de término deve ter no máximo 100 caracteres."),
    shift: z.number(),
    enabled: z.boolean(),
  })
  .superRefine((value, context) => {
    if (value.startAt >= value.endAt) {
      context.addIssue({
        code: "custom",
        path: ["endAt"],
        message: "Horario de término deve ser maior que o horário de início.",
      });
    }
  });

const shiftRecord: Record<string, number> = {
  Manha: 0,
  Tarde: 1,
  Noite: 2,
};

export function ManageEditScheduleDialog({ data, isOpen, onClose, onSubmit }: ManageEditScheduleDialogProps) {
  const shifts = ["Manha", "Tarde", "Noite"];
  const [shift, setShift] = useState(shifts[data.shift ?? 0] ?? shifts[0]);

  const form = useForm({
    defaultValues: {
      startAt: data.startAt ?? "",
      endAt: data.endAt ?? "",
      shift: shiftRecord[shift] ?? 0,
      enabled: data.enabled ?? true,
    },
    validators: {
      onSubmit: formSchema,
    },
    onSubmit: async ({ value }) => {
      await onSubmit({
        id: data.id,
        startAt: value.startAt,
        endAt: value.endAt,
        shift: value.shift,
        enabled: value.enabled,
      });
    },
  });

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (open === false) {
          form.reset();
          onClose();
        }
      }}
    >
      <DialogContent className="sm:max-w-md bg-white/70 dark:bg-black/70 backdrop-blur-xl rounded-md border dark:border-violet-500/10 shadow-md hover:shadow-lg p-4 dark:shadow-violet-300/15">
        <DialogHeader>
          <DialogTitle>Editar horario</DialogTitle>
          <DialogDescription>
            Por favor, preencha os detalhes necessários para prosseguir com a edição do horario.
          </DialogDescription>
        </DialogHeader>

        <form
          id="edit-schedule-form"
          onSubmit={(e) => {
            e.preventDefault();
            form.handleSubmit();
          }}
        >
          <FieldGroup>
            <form.Field
              name="startAt"
              children={(field) => {
                const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
                return (
                  <Field data-invalid={isInvalid}>
                    <FieldLabel htmlFor={field.name}>Horário de início</FieldLabel>
                    <Input
                      type="time"
                      id="time-picker-start"
                      step="1"
                      value={field.state.value}
                      onChange={(e) => field.setValue(e.target.value)}
                      className="appearance-none bg-background [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-calendar-picker-indicator]:appearance-none"
                    />
                    {isInvalid && <FieldError errors={field.state.meta.errors} />}
                  </Field>
                );
              }}
            />
            <form.Field
              name="endAt"
              children={(field) => {
                const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
                return (
                  <Field data-invalid={isInvalid}>
                    <FieldLabel htmlFor={field.name}>Horário de término</FieldLabel>
                    <Input
                      type="time"
                      id="time-picker-end"
                      step="1"
                      value={field.state.value}
                      onChange={(e) => field.setValue(e.target.value)}
                      className="appearance-none bg-background [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-calendar-picker-indicator]:appearance-none"
                    />
                    {isInvalid && <FieldError errors={field.state.meta.errors} />}
                  </Field>
                );
              }}
            />
            <form.Field
              name="shift"
              children={(field) => {
                const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
                return (
                  <Field className="w-full">
                    <FieldLabel htmlFor="shift-status" className="font-bold">
                      Turno
                    </FieldLabel>
                    <Combobox
                      items={shifts}
                      value={shift}
                      onValueChange={(value) => {
                        setShift(value ?? shifts[0]);
                        field.setValue(shiftRecord[value ?? shifts[0]] ?? 0);
                      }}
                    >
                      <ComboboxInput
                        id="shift-status"
                        aria-label="Filtrar por turno"
                        placeholder="Todos os turnos"
                        className="w-full"
                        showClear={false}
                      />
                      <ComboboxContent>
                        <ComboboxEmpty>Nenhum turno encontrado.</ComboboxEmpty>
                        <ComboboxList>
                          {(item) => (
                            <ComboboxItem key={item} value={item}>
                              <ComboboxValue>{item}</ComboboxValue>
                            </ComboboxItem>
                          )}
                        </ComboboxList>
                      </ComboboxContent>
                    </Combobox>
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
                      <FieldLabel htmlFor="enabled-checkbox-basic">
                        {(field.state.value as boolean) ? "Ativo" : "Inativo"}
                      </FieldLabel>
                      {isInvalid && <FieldError errors={field.state.meta.errors} />}
                    </Field>
                    <FieldDescription>Uma trava para usar o horario.</FieldDescription>
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
            <Button type="submit" form="edit-schedule-form">
              Editar
            </Button>
          </Field>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
