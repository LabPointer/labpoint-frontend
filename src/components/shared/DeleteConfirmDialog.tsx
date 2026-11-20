import { Trash2 } from "lucide-react";
import { type FormEvent, useId, useState } from "react";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type DeleteConfirmDialogProps = {
  open: boolean;
  /** Ex.: "recurso", "matéria". Usado no título e na mensagem. */
  entityLabel: string;
  /** Nome que precisa ser digitado, exatamente como aparece, para liberar a exclusão. */
  itemName: string;
  /** O que mais é apagado junto (reservas, vínculos...). */
  consequences: string;
  isPending: boolean;
  onClose: () => void;
  onConfirm: () => void;
};

/**
 * Confirmação de exclusão permanente: o botão só habilita depois que o nome do item é digitado.
 * Monte com `key` de sessão (useFormDialog) para o campo voltar vazio a cada abertura.
 */
export function DeleteConfirmDialog({
  open,
  entityLabel,
  itemName,
  consequences,
  isPending,
  onClose,
  onConfirm,
}: DeleteConfirmDialogProps) {
  const [typed, setTyped] = useState("");
  const inputId = useId();
  const matches = typed.trim() === itemName.trim();

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (matches && !isPending) onConfirm();
  }

  return (
    <AlertDialog
      open={open}
      onOpenChange={(nextOpen) => {
        if (!nextOpen) onClose();
      }}
    >
      <AlertDialogContent>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir {entityLabel} permanentemente?</AlertDialogTitle>
            <AlertDialogDescription>
              <span className="font-semibold wrap-break-word text-foreground">{itemName}</span> será excluído de vez.{" "}
              {consequences} Essa ação não pode ser desfeita. Se quiser só tirar de uso, desative em vez de excluir.
            </AlertDialogDescription>
          </AlertDialogHeader>

          <div className="flex flex-col gap-2">
            <Label htmlFor={inputId} className="text-sm leading-snug font-normal">
              Para confirmar, digite <span className="font-semibold wrap-break-word select-all">{itemName}</span>
            </Label>
            <Input
              id={inputId}
              value={typed}
              autoComplete="off"
              spellCheck={false}
              disabled={isPending}
              onChange={(event) => setTyped(event.target.value)}
            />
          </div>

          <AlertDialogFooter>
            <AlertDialogCancel type="button" disabled={isPending}>
              Voltar
            </AlertDialogCancel>
            <Button type="submit" variant="destructive" disabled={!matches || isPending}>
              <Trash2 className="size-4" />
              {isPending ? "Excluindo..." : "Excluir permanentemente"}
            </Button>
          </AlertDialogFooter>
        </form>
      </AlertDialogContent>
    </AlertDialog>
  );
}
