import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { SignUpForm } from "@/components/SignUpForm";
import { api } from "#/lib/utils/restapi";
import { notifyError, notifySuccess } from "#/lib/utils/notify";
import { useState } from "react";

export const Route = createFileRoute("/_public/sign-up")({
  component: RouteComponent,
});

function RouteComponent() {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isRedirecting, setIsRedirecting] = useState(false);

  async function handleFormSubmit(name: string, registration: string, email: string, password: string) {
    setIsSubmitting(true);
    const { response, error } = await api.POST("/auth/sign-up", {
      body: { username: name, registration, email, password },
    });
    setIsSubmitting(false);

    if (!response.ok && error) {
      notifyError(error);
      return;
    }

    setIsRedirecting(true);
    notifySuccess("Usuário criado com sucesso! Aguarde um administrador ativar sua conta.");
    setTimeout(() => navigate({ to: "/" }), 5000);
  }

  return (
    <SignUpForm
      onFormSubmit={handleFormSubmit}
      isLoading={isSubmitting}
      isRedirecting={isRedirecting}
    />
  );
}
