import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { ResendEmailConfirmationForm } from "#/components/ResendEmailConfirmation";
import { api } from "#/lib/utils/restapi";
import { notifyError, notifySuccess } from "#/lib/utils/notify";
import { useState } from "react";

export const Route = createFileRoute("/_public/resend-email-confirmation")({
  component: RouteComponent,
});

function RouteComponent() {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isRedirecting, setIsRedirecting] = useState(false);

  async function handleOnSubmitForm(email: string) {
    setIsSubmitting(true);
    const { response, error } = await api.POST("/auth/resend-confirmation", {
      body: { email },
    });
    setIsSubmitting(false);

    if (!response.ok && error) {
      notifyError(error);
      return;
    }

    setIsRedirecting(true);
    notifySuccess("Email de confirmação enviado com sucesso!");
    setTimeout(() => navigate({ to: "/" }), 3000);
  }

  return (
    <ResendEmailConfirmationForm
      onSubmitForm={handleOnSubmitForm}
      isSubmitting={isSubmitting}
      isRedirectting={isRedirecting}
    />
  );
}
