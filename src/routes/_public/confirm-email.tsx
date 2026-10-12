import { api } from "#/lib/utils/restapi";
import { notifyError, notifySuccess } from "#/lib/utils/notify";
import { useQuery } from "@tanstack/react-query";
import { createFileRoute, redirect, useNavigate } from "@tanstack/react-router";
import { CheckCircle, XCircle } from "lucide-react";
import z from "zod";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Spinner } from "@/components/ui/spinner";

const emailConfirmationSearchSchema = z.object({
  userId: z.string().min(1, "User ID é obrigatório"),
  token: z.string().min(1, "Token é obrigatório"),
});

export const Route = createFileRoute("/_public/confirm-email")({
  validateSearch: emailConfirmationSearchSchema,
  onError: () => {
    throw redirect({ to: "/" });
  },
  component: RouteComponent,
});

function RouteComponent() {
  const { userId, token } = Route.useSearch();
  const navigate = useNavigate();

  const { isLoading, isError } = useQuery({
    queryKey: ["query-confirm-email", userId, token],
    queryFn: async () => {
      const { response, error } = await api.GET("/auth/confirm-email", {
        params: { query: { Token: token, UserId: userId } },
      });

      if (!response.ok && error) {
        notifyError(error);
        setTimeout(() => navigate({ to: "/", replace: true }), 3000);
        throw new Error("Falha ao confirmar email.");
      }

      notifySuccess("Email confirmado com sucesso!");
      setTimeout(() => navigate({ to: "/", replace: true }), 3000);
      return true;
    },
  });

  if (isLoading) {
    return (
      <div className="flex flex-col items-center gap-3 text-muted-foreground">
        <Spinner className="size-8" />
        <p className="font-semibold animate-pulse">Confirmando email...</p>
      </div>
    );
  }

  if (isError) {
    return (
      <Alert variant="destructive" className="max-w-sm">
        <XCircle className="size-4" />
        <AlertTitle>Falha ao confirmar email</AlertTitle>
        <AlertDescription>Redirecionando para a página de login...</AlertDescription>
      </Alert>
    );
  }

  return (
    <Alert className="max-w-sm border-green-500/40 bg-green-500/10 text-green-700 dark:text-green-400">
      <CheckCircle className="size-4 text-green-600 dark:text-green-400" />
      <AlertTitle>Email confirmado!</AlertTitle>
      <AlertDescription>Redirecionando para a página de login...</AlertDescription>
    </Alert>
  );
}
