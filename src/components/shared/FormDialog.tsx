import type { FormEvent, ReactNode } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Field, FieldGroup } from "@/components/ui/field";

type FormDialogProps = {
  open: boolean;
  /** Chamado quando o dialog fecha (Esc, clique fora, X). Faça o reset do formulário aqui. */
  onClose: () => void;
  title: string;
  description: string;
  /** Conteúdo extra logo abaixo da descrição (ex.: resumo do item sendo editado). */
  headerExtra?: ReactNode;
  formId: string;
  submitLabel: string;
  isSubmitting?: boolean;
  onSubmit: () => void;
  onReset: () => void;
  children: ReactNode;
};

/** Casca padrão dos dialogs de criação/edição: título, <form>, rodapé com "Limpar" e enviar. */
export function FormDialog({
  open,
  onClose,
  title,
  description,
  headerExtra,
  formId,
  submitLabel,
  isSubmitting = false,
  onSubmit,
  onReset,
  children,
}: FormDialogProps) {
  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    onSubmit();
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        if (!nextOpen) onClose();
      }}
    >
      <DialogContent className="max-h-[90dvh] overflow-y-auto rounded-md border bg-white/70 p-4 shadow-md backdrop-blur-xl hover:shadow-lg sm:max-w-md dark:border-violet-500/10 dark:bg-black/70 dark:shadow-violet-300/15">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
          {headerExtra}
        </DialogHeader>

        <form id={formId} onSubmit={handleSubmit}>
          <FieldGroup>{children}</FieldGroup>
        </form>

        <DialogFooter className="flex border-t bg-transparent">
          <Field orientation="horizontal" className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={onReset} disabled={isSubmitting}>
              Limpar
            </Button>
            <Button type="submit" form={formId} disabled={isSubmitting}>
              {isSubmitting ? "Enviando..." : submitLabel}
            </Button>
          </Field>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
