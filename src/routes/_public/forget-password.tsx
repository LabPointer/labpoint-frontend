import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { ForgetPasswordForm } from '@/components/ForgetPasswordForm'
import { useApi } from '#/lib/utils/restapi';
import { toast } from 'sonner';
import { useState } from 'react';

export const Route = createFileRoute('/_public/forget-password')({
  component: RouteComponent,
})

function RouteComponent() {
  const api = useApi();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isRedirectting, setIsRedirectting] = useState(false);
  
  async function handleOnSubmitForm(email: string) {
    setIsSubmitting(true);
    const res = await api.POST("/auth/forgot-password", {
        body: {
          email: email,
        },
      });

      const { response, data, error } = res;
      
      setIsSubmitting(false);

      if (!response.ok && error) {
        toast.error(`Error ${response.status}: ${error.message}`, {
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

  return <ForgetPasswordForm onSubmitForm={handleOnSubmitForm} isSubmitting={isSubmitting} isRedirectting={isRedirectting} />
}
