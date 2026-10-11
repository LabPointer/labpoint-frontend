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
  isPending: boolean;
  onClose: () => void;
  onConfirm: () => void;
};

/** Confirmação antes de cancelar: a ação não pode ser desfeita. */
export function CancelReserveDialog({ open, spaceName, isPending, onClose, onConfirm }: CancelReserveDialogProps) {
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
            A reserva de {spaceName} será cancelada e os horários voltarão a ficar disponíveis. Essa ação não pode ser
            desfeita.
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
