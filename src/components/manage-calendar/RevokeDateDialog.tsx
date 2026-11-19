import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useState } from "react";
import { useAffectedReserves } from "#/lib/queries/calendar";
import { toApiDate } from "#/lib/queries/reserves";
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
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

type RevokeDateDialogProps = {
  date: Date;
  open: boolean;
  pending: boolean;
  onClose: () => void;
  onConfirm: (keepReserves: boolean) => void;
};

/** Bloquear de novo um dia liberado: se houver reservas no dia, o admin escolhe entre manter e cancelar. */
export function RevokeDateDialog({ date, open, pending, onClose, onConfirm }: RevokeDateDialogProps) {
  const affected = useAffectedReserves(toApiDate(date));
  const [choice, setChoice] = useState<"keep" | "cancel">("keep");

  const spaceCount = Number(affected.data?.spaceReserves ?? 0);
  const resourceCount = Number(affected.data?.resourceReserves ?? 0);
  const hasReserves = spaceCount + resourceCount > 0;
  const label = format(date, "EEEE, dd 'de' MMMM", { locale: ptBR });

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        if (!nextOpen) onClose();
      }}
    >
      <DialogContent className="rounded-md border bg-white/70 p-4 shadow-md backdrop-blur-xl sm:max-w-md dark:border-violet-500/10 dark:bg-black/70 dark:shadow-violet-300/15">
        <DialogHeader>
          <DialogTitle>Bloquear dia de novo</DialogTitle>
          <DialogDescription className="first-letter:uppercase">{label}</DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-3 text-sm">
          {affected.isPending ? (
            <p className="text-muted-foreground">Conferindo as reservas do dia...</p>
          ) : hasReserves ? (
            <>
              <p>
                Este dia tem <strong>{spaceCount}</strong> reserva(s) de sala e <strong>{resourceCount}</strong> de
                recurso. O que fazer com elas?
              </p>
              <RadioGroup value={choice} onValueChange={(value) => setChoice(value as "keep" | "cancel")}>
                <Label className="flex items-start gap-2 rounded-md border p-3 font-normal">
                  <RadioGroupItem value="keep" className="mt-0.5" />
                  <span>
                    <span className="font-medium">Manter as reservas</span>
                    <span className="block text-xs text-muted-foreground">
                      O dia volta a ficar bloqueado só para reservas novas; as já feitas continuam valendo.
                    </span>
                  </span>
                </Label>
                <Label className="flex items-start gap-2 rounded-md border p-3 font-normal">
                  <RadioGroupItem value="cancel" className="mt-0.5" />
                  <span>
                    <span className="font-medium">Cancelar as reservas do dia</span>
                    <span className="block text-xs text-muted-foreground">
                      O dia sai das reservas. As que eram só deste dia são canceladas; as de vários dias continuam nos
                      outros dias.
                    </span>
                  </span>
                </Label>
              </RadioGroup>
            </>
          ) : (
            <p>Nenhuma reserva usa este dia. Ele volta a ficar bloqueado para reservas.</p>
          )}
        </div>

        <DialogFooter className="flex border-t bg-transparent">
          <DialogClose render={<Button type="button" variant="outline" />}>Voltar</DialogClose>
          <Button
            type="button"
            variant={hasReserves && choice === "cancel" ? "destructive" : "default"}
            disabled={pending || affected.isPending}
            onClick={() => onConfirm(!hasReserves || choice === "keep")}
          >
            {hasReserves && choice === "cancel" ? "Bloquear e cancelar" : "Bloquear dia"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
