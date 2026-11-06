import { createFileRoute } from "@tanstack/react-router";
import { ClipboardCheck, ClipboardPen, LogIn } from "lucide-react";
import type { ReactNode } from "react";
import { useFormDialog } from "#/hooks/use-form-dialog";
import { useNow } from "#/hooks/use-now";
import {
  USAGE_STATUS,
  type UsageSession,
  useCheckIn,
  useCheckOut,
  useMyUsages,
  useSaveUsageEntries,
} from "#/lib/queries/usage";
import { succeeded } from "#/lib/utils/api-result";
import { QueryBoundary } from "@/components/shared/QueryBoundary";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { UsageFormDialog } from "@/components/usage/UsageFormDialog";
import type { UsageFormMode } from "@/components/usage/UsageReportForm";
import { UsageReportView } from "@/components/usage/UsageReportView";
import { UsageSessionSummary } from "@/components/usage/UsageSessionSummary";
import { checkInWindow, checkOutWindow } from "@/components/usage/usage-windows";

export const Route = createFileRoute("/_private/check-out")({
  component: RouteComponent,
});

/** Só as sessões que pedem alguma ação: hoje aguardando check-in, em uso e com check-out vencido. */
const OPEN_STATUSES = [USAGE_STATUS.SCHEDULED, USAGE_STATUS.CHECKED_IN, USAGE_STATUS.CHECKOUT_PENDING];

type DialogTarget = { session: UsageSession; mode: Extract<UsageFormMode, "check-in" | "entries" | "check-out"> };

const DIALOG_COPY: Record<DialogTarget["mode"], { title: string; description: string; submit: string }> = {
  "check-in": {
    title: "Check-in",
    description: "Confirme o uso e registre a turma e os notebooks e fontes retirados.",
    submit: "Confirmar check-in",
  },
  entries: {
    title: "Preencher relatório",
    description: "Preencha os horários restantes do turno (você pode voltar até o check-out).",
    submit: "Salvar relatório",
  },
  "check-out": {
    title: "Check-out",
    description: "Registre os notebooks e fontes devolvidos em todos os horários do turno.",
    submit: "Confirmar check-out",
  },
};

function RouteComponent() {
  const now = useNow();
  // Atualiza sozinho: o check-in some quando a janela fecha e o turno vira "em uso" / "pendente" pelo backend.
  const usages = useMyUsages({ statuses: [...OPEN_STATUSES], limit: 100 }, { refetchInterval: 60_000 });
  const dialog = useFormDialog<DialogTarget>();
  const checkIn = useCheckIn();
  const saveEntries = useSaveUsageEntries();
  const checkOut = useCheckOut();

  const sessions = usages.data ?? [];
  const byStatus = (status: number) => sessions.filter((session) => Number(session.status) === status);
  const inUse = byStatus(USAGE_STATUS.CHECKED_IN);
  const awaitingCheckIn = byStatus(USAGE_STATUS.SCHEDULED);
  const pending = byStatus(USAGE_STATUS.CHECKOUT_PENDING);

  const target = dialog.target;
  const targetWindow =
    target?.mode === "check-in"
      ? checkInWindow(target.session, now)
      : target?.mode === "check-out"
        ? checkOutWindow(target.session, now)
        : { open: true };

  async function handleSubmit(body: Parameters<typeof checkIn.mutateAsync>[0]["body"]) {
    if (!target) return;
    const usageId = Number(target.session.id);
    const mutation = target.mode === "check-in" ? checkIn : target.mode === "check-out" ? checkOut : saveEntries;
    if (await succeeded(mutation.mutateAsync({ usageId, body }))) dialog.close();
  }

  return (
    <>
      {target && (
        <UsageFormDialog
          key={dialog.session}
          session={target.session}
          mode={target.mode}
          title={DIALOG_COPY[target.mode].title}
          description={DIALOG_COPY[target.mode].description}
          submitLabel={DIALOG_COPY[target.mode].submit}
          open={dialog.isOpen}
          onClose={dialog.close}
          onSubmit={handleSubmit}
          disabled={!targetWindow.open}
          disabledReason={targetWindow.reason}
        />
      )}

      <section className="container flex flex-col gap-8">
        <QueryBoundary
          isPending={usages.isPending}
          isFetching={usages.isFetching}
          isError={usages.isError}
          error={usages.error}
          isEmpty={sessions.length === 0}
          loadingText="Carregando suas reservas em uso..."
          emptyText="Nenhuma reserva em uso ou aguardando check-in agora."
        >
          <div className="flex flex-col gap-8">
            <SessionSection
              title="Em uso"
              description="Preencha o relatório e faça o check-out ao terminar o turno."
              sessions={inUse}
              render={(session) => {
                const stepWindow = checkOutWindow(session, now);
                return (
                  <>
                    <Button variant="outline" onClick={() => dialog.open({ session, mode: "entries" })}>
                      <ClipboardPen className="size-4" />
                      Preencher relatório
                    </Button>
                    <Button
                      disabled={!stepWindow.open}
                      title={stepWindow.reason}
                      onClick={() => dialog.open({ session, mode: "check-out" })}
                    >
                      <ClipboardCheck className="size-4" />
                      Fazer check-out
                    </Button>
                    {!stepWindow.open && <p className="w-full text-xs text-muted-foreground">{stepWindow.reason}</p>}
                  </>
                );
              }}
            />

            <SessionSection
              title="Check-in de hoje"
              description="Alternativa ao link do e-mail: confirme o uso dentro do prazo ou o horário é liberado."
              sessions={awaitingCheckIn}
              render={(session) => {
                const stepWindow = checkInWindow(session, now);
                return (
                  <>
                    <Button
                      disabled={!stepWindow.open}
                      title={stepWindow.reason}
                      onClick={() => dialog.open({ session, mode: "check-in" })}
                    >
                      <LogIn className="size-4" />
                      Fazer check-in
                    </Button>
                    {!stepWindow.open && <p className="w-full text-xs text-muted-foreground">{stepWindow.reason}</p>}
                  </>
                );
              }}
            />

            <SessionSection
              title="Aguardando a coordenação"
              description="O prazo do check-out terminou. A coordenação vai encerrar o uso conferindo as devoluções."
              sessions={pending}
              showReport
            />
          </div>
        </QueryBoundary>
      </section>
    </>
  );
}

function SessionSection({
  title,
  description,
  sessions,
  render,
  showReport = false,
}: {
  title: string;
  description: string;
  sessions: UsageSession[];
  render?: (session: UsageSession) => ReactNode;
  showReport?: boolean;
}) {
  if (sessions.length === 0) return null;

  return (
    <div className="flex flex-col gap-3">
      <div>
        <h2 className="text-lg font-bold">
          {title} <span className="text-sm font-normal text-muted-foreground">({sessions.length})</span>
        </h2>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
      <div className="grid grid-cols-[repeat(auto-fill,minmax(320px,1fr))] gap-4">
        {sessions.map((session) => (
          <Card
            key={session.id}
            className="rounded-md border bg-white p-4 shadow-md dark:border-violet-500/10 dark:bg-white/5 dark:shadow-violet-300/15"
          >
            <CardContent className="flex flex-col gap-3 p-0">
              <UsageSessionSummary session={session} showWindows />
              {(showReport || session.entries.length > 0) && <UsageReportView session={session} />}
            </CardContent>
            {render && (
              <CardFooter className="flex flex-wrap gap-2 border-0 bg-transparent p-0 pt-2">
                {render(session)}
              </CardFooter>
            )}
          </Card>
        ))}
      </div>
    </div>
  );
}
