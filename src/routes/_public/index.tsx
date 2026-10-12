import { createFileRoute, useRouter } from "@tanstack/react-router";
import { SignInForm } from "@/components/SignInForm";
import { api } from "#/lib/utils/restapi";
import { notifyError, notifySuccess } from "#/lib/utils/notify";
import { useState } from "react";

export const Route = createFileRoute("/_public/")({ component: Home });

function Home() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isRedirecting, setIsRedirecting] = useState(false);

  async function handleFormSubmit(registration: string, password: string, rememberMe: boolean) {
    setIsSubmitting(true);
    const { response, error } = await api.POST("/auth/sign-in", {
      body: { registration, password, rememberMe },
    });
    setIsSubmitting(false);

    if (!response.ok && error) {
      notifyError(error);
      return;
    }

    setIsRedirecting(true);
    await router.invalidate();
    notifySuccess("Bem vindo ao Labpoint!");
  }

  return (
    <SignInForm
      onFormSubmit={handleFormSubmit}
      isLoading={isSubmitting}
      isRedirecting={isRedirecting}
    />
  );
}
