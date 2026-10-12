import { createFileRoute, redirect, useNavigate } from "@tanstack/react-router";
import z from "zod";
import { ResetPasswordForm } from "#/components/ResetPasswordForm";
import { api } from "#/lib/utils/restapi";
import { notifyError, notifySuccess } from "#/lib/utils/notify";
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
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isRedirecting, setIsRedirecting] = useState(false);

  async function handleFormSubmit(newPassword: string) {
    setIsSubmitting(true);
    const { response, error } = await api.POST("/auth/reset-password", {
      body: { email, token, newPassword },
    });
    setIsSubmitting(false);

    if (!response.ok && error) {
      notifyError(error);
      return;
    }

    setIsRedirecting(true);
    notifySuccess("Senha redefinida com sucesso!");
    setTimeout(() => navigate({ to: "/" }), 3000);
  }

  return (
    <ResetPasswordForm
      onFormSubmitSuccess={handleFormSubmit}
      isSubmitting={isSubmitting}
      isRedirectting={isRedirecting}
    />
  );
}
