import { createFileRoute, redirect, useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import z from "zod";
import { ResetPasswordForm } from "#/components/ResetPasswordForm";
import { useApi } from "#/lib/utils/restapi";
import { useState } from "react";

const tokenSearchSchema = z.object({
  email: z.email("Email inválido"),
  token: z.string(),
});

export const Route = createFileRoute("/_public/reset-password")({
  validateSearch: tokenSearchSchema,
  onError: () => {
    throw redirect({ to: "/" });
  },
  component: RouteComponent,
});

function RouteComponent() {
  const { token, email } = Route.useSearch();
  const api = useApi();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isRedirectting, setIsRedirectting] = useState(false);

  async function handleFormSubmit(newPassword: string) {
    console.log(`Token: ${token}\nEmail: ${email}`)
    setIsSubmitting(true);
    const res = await api.POST("/auth/reset-password", {
      body: {
        email,
        token,
        newPassword,
      },
    });

    const { response, error } = res;

    setIsSubmitting(false);

    if (!response.ok && error) {
      toast.error(`Erro ao redefinir senha. ${error[0]?.description}` || `Erro ao redefinir senha. Token pode ser invalido ou ocorreu um erro interno no servidor.`, {
        duration: 3000,
        position: "bottom-center",
        style: {
          color: "white",
          backgroundColor: "red",
          borderColor: "red",
        },
      });
      return;
    }

    setIsRedirectting(true);
    toast.success("Senha redefinida com sucesso!", {
      duration: 3000,
      position: "bottom-center",
      onAutoClose: () => {
        navigate({ to: "/" });
      },
      style: {
        color: "white",
        backgroundColor: "green",
        borderColor: "green",
      },
    });
  }

  return (
    <ResetPasswordForm
      onFormSubmitSuccess={handleFormSubmit}
      isSubmitting={isSubmitting}
      isRedirectting={isRedirectting}
    />
  );
}
