import { ResendEmailConfirmationForm } from '#/components/ResendEmailConfirmation';
import { useApi } from '#/lib/utils/restapi';
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useState } from 'react';
import { toast } from 'sonner';

export const Route = createFileRoute('/_public/resend-email-confirmation')({
  component: RouteComponent,
})

function RouteComponent() {
  const api = useApi();
  const navigate = useNavigate();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isRedirectting, setIsRedirectting] = useState(false);
  
  async function handleOnSubmitForm(email: string) {
    setIsSubmitting(true);
    
    const res = await api.POST("/auth/resend-confirmation", {
        body: {
          email: email,
        },
      });

      const { response, data, error } = res;

      setIsSubmitting(false);

      if (!response.ok && error) {
        toast.error(`Error ao tentar enviar email de confirmação!`, {
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
      toast.success("Email de recuperação enviado com sucesso!", {
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
  
  return <ResendEmailConfirmationForm onSubmitForm={handleOnSubmitForm} isSubmitting={isSubmitting} isRedirectting={isRedirectting} />
}
