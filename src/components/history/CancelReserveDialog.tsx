import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

type CancelReserveDialogProps = {
  open: boolean;
  spaceName: string;
  /** Quando informado (admin), diz de quem é a reserva. */
  userName?: string;
  /** Texto extra após a mensagem padrão (ex.: o que acontece com os recursos vinculados). */
  note?: string;
  isPending: boolean;
  onClose: () => void;
  onConfirm: () => void;
};

/** Confirmação antes de cancelar: a ação não pode ser desfeita. */
export function CancelReserveDialog({
  open,
  spaceName,
  userName,
  note,
  isPending,
  onClose,
  onConfirm,
}: CancelReserveDialogProps) {
  return (
    <AlertDialog
      open={open}
      onOpenChange={(nextOpen) => {
        if (!nextOpen) onClose();
      }}
    >
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Cancelar reserva?</AlertDialogTitle>
          <AlertDialogDescription>
            {userName ? `A reserva de ${userName} em ${spaceName}` : `A reserva de ${spaceName}`} será cancelada e os
            horários voltarão a ficar disponíveis. Essa ação não pode ser desfeita.
            {note && <span className="mt-2 block">{note}</span>}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isPending}>Voltar</AlertDialogCancel>
          <AlertDialogAction variant="destructive" disabled={isPending} onClick={onConfirm}>
            {isPending ? "Cancelando..." : "Cancelar reserva"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
