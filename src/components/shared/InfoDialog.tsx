import type { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type InfoDialogProps = {
  open: boolean;
  onClose: () => void;
  title: string;
  description: string;
  children: ReactNode;
};

/**
 * Dialog (e não popover) para "ver mais info": em telas pequenas um popover fica espremido
 * ou sai da tela, enquanto o dialog ocupa a largura útil e rola o conteúdo.
 */
export function InfoDialog({ open, onClose, title, description, children }: InfoDialogProps) {
  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        if (!nextOpen) onClose();
      }}
    >
      <DialogContent className="max-h-[90dvh] overflow-y-auto rounded-md border bg-white/70 p-4 shadow-md backdrop-blur-xl sm:max-w-md dark:border-violet-500/10 dark:bg-black/70 dark:shadow-violet-300/15">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <div className="text-sm">{children}</div>
        <DialogFooter className="flex border-t bg-transparent">
          <DialogClose render={<Button type="button" variant="outline" />}>Fechar</DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
