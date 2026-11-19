import { createFileRoute, createLink, redirect } from "@tanstack/react-router";
import { CheckCircle, XCircle } from "lucide-react";
import { useState } from "react";
import z from "zod";
import { useNow } from "#/hooks/use-now";
import { USAGE_STEP, useTokenCheckIn, useTokenCheckOut, useUsageByToken } from "#/lib/queries/usage";
import { succeeded } from "#/lib/utils/api-result";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";
import { UsageReportForm } from "@/components/usage/UsageReportForm";
import { UsageSessionSummary } from "@/components/usage/UsageSessionSummary";
import { checkInWindow, checkOutWindow } from "@/components/usage/usage-windows";

const LinkButton = createLink(Button);

const usageSearchSchema = z.object({
  token: z.string().min(1, "Token é obrigatório"),
});

/**
 * Link do e-mail de check-in/check-out. Fica fora de `_public` (que manda quem está logado para outra página):
 * o token já identifica a sessão, com ou sem login.
 */
export const Route = createFileRoute("/usage")({
  validateSearch: usageSearchSchema,
  onError: () => {
    throw redirect({ to: "/" });
  },
  head: () => ({ meta: [{ title: "Check-in / Check-out · Labpoint" }] }),
  component: RouteComponent,
});

function RouteComponent() {
  const { token } = Route.useSearch();
  const { sessionInfo } = Route.useRouteContext();
  const usage = useUsageByToken(token);
  const checkIn = useTokenCheckIn(token);
  const checkOut = useTokenCheckOut(token);
  const now = useNow();
  const [done, setDone] = useState<"check-in" | "check-out" | null>(null);

  let content: React.ReactNode;

  if (done) {
    content = (
      <Alert className="border-green-500/40 bg-green-500/10 text-green-700 dark:text-green-400">
        <CheckCircle className="size-4 text-green-600 dark:text-green-400" />
        <AlertTitle>{done === "check-in" ? "Check-in confirmado!" : "Check-out confirmado!"}</AlertTitle>
        <AlertDescription>
          {done === "check-in"
            ? "Bom uso! No início do último horário do turno você recebe o link de check-out (ou use a página Check-out)."
            : "Obrigado! O relatório de uso foi registrado."}
        </AlertDescription>
      </Alert>
    );
  } else if (usage.isPending) {
    content = (
      <div className="flex flex-col items-center gap-3 py-8 text-muted-foreground">
        <Spinner className="size-8" />
        <p className="animate-pulse font-semibold">Carregando reserva...</p>
      </div>
    );
  } else if (usage.isError) {
    content = (
      <Alert variant="destructive">
        <XCircle className="size-4" />
        <AlertTitle>Não foi possível abrir o link</AlertTitle>
        <AlertDescription>
          {usage.error instanceof Error ? usage.error.message : "Link inválido ou expirado."}
        </AlertDescription>
      </Alert>
    );
  } else {
    const { session } = usage.data;
    const isCheckIn = Number(usage.data.step) === USAGE_STEP.CHECK_IN;
    const stepWindow = isCheckIn ? checkInWindow(session, now) : checkOutWindow(session, now);
    const mutation = isCheckIn ? checkIn : checkOut;

    content = (
      <div className="flex flex-col gap-5">
        <UsageSessionSummary session={session} showAccount showWindows />
        <UsageReportForm
          session={session}
          mode={isCheckIn ? "check-in" : "check-out"}
          submitLabel={isCheckIn ? "Confirmar check-in" : "Confirmar check-out"}
          disabled={!stepWindow.open}
          disabledReason={stepWindow.reason}
          onSubmit={async (body) => {
            if (await succeeded(mutation.mutateAsync(body))) setDone(isCheckIn ? "check-in" : "check-out");
          }}
        />
      </div>
    );
  }

  const step = usage.data ? Number(usage.data.step) : null;

  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-4 py-10">
      <Card className="w-full bg-white shadow-md sm:max-w-2xl dark:border-violet-500/10 dark:bg-white/5 dark:shadow-violet-300/15">
        <CardHeader className="border-b pb-5">
          <CardTitle className="font-bold">
            {step === USAGE_STEP.CHECK_OUT ? "Check-out da reserva" : "Check-in da reserva"}
          </CardTitle>
          <CardDescription>
            Controle de uso diário: turma, modalidade e quantidade de notebooks e fontes.
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-5">{content}</CardContent>
      </Card>

      <LinkButton to={sessionInfo ? "/check-out" : "/"} variant="link" className="mt-4">
        {sessionInfo ? "Ir para a página de check-out" : "Ir para o login"}
      </LinkButton>
    </main>
  );
}
