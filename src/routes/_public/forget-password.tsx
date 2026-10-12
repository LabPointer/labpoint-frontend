import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { ForgetPasswordForm } from "@/components/ForgetPasswordForm";
import { api } from "#/lib/utils/restapi";
import { notifyError, notifySuccess } from "#/lib/utils/notify";
import { useState } from "react";

export const Route = createFileRoute("/_public/forget-password")({
  component: RouteComponent,
});

function RouteComponent() {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isRedirecting, setIsRedirecting] = useState(false);

  async function handleOnSubmitForm(email: string) {
    setIsSubmitting(true);
    const { response, error } = await api.POST("/auth/forgot-password", {
      body: { email },
    });
    setIsSubmitting(false);

    if (!response.ok && error) {
      notifyError(error);
      return;
    }

    setIsRedirecting(true);
    notifySuccess("Email de recuperação enviado com sucesso!");
    setTimeout(() => navigate({ to: "/" }), 3000);
  }

  return (
    <ForgetPasswordForm
      onSubmitForm={handleOnSubmitForm}
      isSubmitting={isSubmitting}
      isRedirectting={isRedirecting}
    />
  );
}
