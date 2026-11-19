import { createLink } from "@tanstack/react-router";
import { ClipboardCheck, Pencil } from "lucide-react";
import { useState } from "react";
import {
  hasCheckIn,
  type ReserveKind,
  USAGE_STATUS,
  type UsageSession,
  useAdminCheckOut,
  useAdminSaveUsageEntries,
  useReserveUsage,
} from "#/lib/queries/usage";
import { succeeded } from "#/lib/utils/api-result";
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
import { Separator } from "@/components/ui/separator";
import { UsageReportForm } from "./UsageReportForm";
import { UsageReportView } from "./UsageReportView";
import { UsageSessionSummary } from "./UsageSessionSummary";

const LinkButton = createLink(Button);

type UsageSessionsDialogProps = {
  kind: ReserveKind;
  reserveId: number;
  title: string;
  description: string;
  open: boolean;
  onClose: () => void;
  /** Coordenação: permite editar o relatório e fechar check-outs. */
  editable?: boolean;
};

type Editing = { id: number; mode: "admin-edit" | "admin-check-out" } | null;

/** Relatório de uso de uma reserva: uma folha por dia e turno, com o que foi registrado no check-in/check-out. */
export function UsageSessionsDialog({
  kind,
  reserveId,
  title,
  description,
  open,
  onClose,
  editable = false,
}: UsageSessionsDialogProps) {
  const usage = useReserveUsage(kind, reserveId, { enabled: open });
  const [editing, setEditing] = useState<Editing>(null);
  const saveEntries = useAdminSaveUsageEntries();
  const checkOut = useAdminCheckOut();

  const sessions = usage.data ?? [];

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        if (!nextOpen) {
          setEditing(null);
          onClose();
        }
      }}
    >
      <DialogContent className="max-h-[90dvh] overflow-y-auto rounded-md border bg-white/70 p-4 shadow-md backdrop-blur-xl sm:max-w-2xl dark:border-violet-500/10 dark:bg-black/70 dark:shadow-violet-300/15">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        {usage.isPending ? (
          <p className="animate-pulse py-6 text-center font-bold text-muted-foreground">Carregando relatório...</p>
        ) : usage.isError ? (
          <p className="py-6 text-center font-bold text-destructive">
            {usage.error instanceof Error ? usage.error.message : "Erro ao carregar o relatório."}
          </p>
        ) : sessions.length === 0 ? (
          <p className="py-6 text-center text-muted-foreground">Ainda não há uso registrado para esta reserva.</p>
        ) : (
          <div className="flex flex-col gap-4">
            {sessions.map((session, index) => (
              <div key={session.id} className="flex flex-col gap-3">
                {index > 0 && <Separator />}
                <UsageSessionSummary session={session} showAccount={editable} />
                {editing?.id === Number(session.id) ? (
                  <UsageReportForm
                    session={session}
                    mode={editing.mode}
                    submitLabel={editing.mode === "admin-check-out" ? "Encerrar check-out" : "Salvar relatório"}
                    onCancel={() => setEditing(null)}
                    onSubmit={async (body) => {
                      const mutation = editing.mode === "admin-check-out" ? checkOut : saveEntries;
                      if (await succeeded(mutation.mutateAsync({ usageId: Number(session.id), body }))) {
                        setEditing(null);
                      }
                    }}
                  />
                ) : (
                  <SessionBody session={session} editable={editable} onEdit={setEditing} />
                )}
              </div>
            ))}
          </div>
        )}

        <DialogFooter className="flex border-t bg-transparent">
          <DialogClose render={<Button type="button" variant="outline" />}>Fechar</DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function SessionBody({
  session,
  editable,
  onEdit,
}: {
  session: UsageSession;
  editable: boolean;
  onEdit: (editing: Editing) => void;
}) {
  const status = Number(session.status);

  if (!hasCheckIn(status)) {
    return (
      <p className="text-sm text-muted-foreground">
        {status === USAGE_STATUS.ABSENT
          ? "Sem check-in no prazo: o turno foi marcado como ausente e o horário liberado."
          : "Aguardando o check-in."}
      </p>
    );
  }

  const open = status === USAGE_STATUS.CHECKED_IN || status === USAGE_STATUS.CHECKOUT_PENDING;

  return (
    <>
      <UsageReportView session={session} />
      {editable ? (
        <div className="flex flex-wrap justify-end gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => onEdit({ id: Number(session.id), mode: "admin-edit" })}
          >
            <Pencil className="size-4" />
            Editar relatório
          </Button>
          {open && (
            <Button type="button" size="sm" onClick={() => onEdit({ id: Number(session.id), mode: "admin-check-out" })}>
              <ClipboardCheck className="size-4" />
              Fechar check-out
            </Button>
          )}
        </div>
      ) : (
        status === USAGE_STATUS.CHECKED_IN && (
          <div className="flex justify-end">
            <LinkButton to="/check-out" size="sm" variant="outline">
              <ClipboardCheck className="size-4" />
              Ir para o check-out
            </LinkButton>
          </div>
        )
      )}
    </>
  );
}
