import { createFileRoute, useNavigate, useRouter } from "@tanstack/react-router";
import { SignInForm } from "@/components/SignInForm";
import { useApi } from "#/lib/utils/restapi";
import { toast } from "sonner";
import { useState } from "react";

export const Route = createFileRoute("/_public/")({ component: Home });

function Home() {
  const api = useApi();
  const navigate = useNavigate();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isRedirectting, setIsRedirectting] = useState(false);
  
  async function handleFormSubmit(registration: string, password: string, rememberMe: boolean) {
    setIsSubmitting(true);
    const res = await api.POST("/auth/sign-in", {
      body: {
        registration: registration,
        password: password,
        rememberMe: rememberMe,
      },
    });
    
    setIsSubmitting(false);
    
    const { response, error } = res;
    const { ok, status } = response;

    if (!ok && error) {
      toast.error(`Erro ${status}: ${error.title}`, {
        duration: 2000,
        onAutoClose: () => {
          navigate({ to: "/" });
        },
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

    await router.invalidate();

    toast.success("Bem vindo ao Labpoint! Você será redirecionado em alguns segundos.", {
      duration: 3000,
      position: "bottom-center",
      style: {
        color: "white",
        backgroundColor: "green",
        borderColor: "green",
      },
    });
  }
  return <SignInForm onFormSubmit={handleFormSubmit} isLoading={isSubmitting} isRedirecting={isRedirectting} />;
}
