import { createFileRoute, useNavigate, useRouter } from "@tanstack/react-router";
import { SignUpForm } from "@/components/SignUpForm";
import { useApi } from "#/lib/utils/restapi";
import { useState } from "react";
import { toast } from "sonner";

export const Route = createFileRoute("/_public/sign-up")({
  component: RouteComponent,
});

function RouteComponent() {
  const api = useApi();
  const navigate = useNavigate();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isRedirectting, setIsRedirectting] = useState(false);

  async function handleFormSubmit(name: string, registration: string, email: string, password: string) {
    setIsSubmitting(true);
    const res = await api.POST("/auth/sign-up", {
      body: {
        username: name,
        registration: registration,
        email: email,
        password: password
      },
    });

    setIsSubmitting(false);

    const { error } = res;
    const { ok, status, statusText } = res.response;

    if (!ok && error) {
      toast.error(`Erro ${status}: ${error[0].description}`, {
        duration: 2000,
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

    toast.success(`Usuario criado com sucesso! Aguarde para que um administrador ative sua conta.`, {
      duration: 5000,
      onAutoClose: () => {
        navigate({ to: "/" });
      },
      position: "bottom-center",
      style: {
        color: "white",
        backgroundColor: "green",
        borderColor: "green",
      },
    });
  }

  return <SignUpForm onFormSubmit={handleFormSubmit} isLoading={isSubmitting} isRedirecting={isRedirectting} />;
}
