import { useApi } from "#/lib/utils/restapi";
import { useQuery } from "@tanstack/react-query";
import { createFileRoute, redirect, useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import z from "zod";

const emailConfirmationSearchSchema = z.object({
  userId: z.string().min(1, "User ID é obrigatório"),
  token: z.string().min(1, "Token é obrigatório"),
});

export const Route = createFileRoute("/_public/confirm-email")({
  validateSearch: emailConfirmationSearchSchema,
  onError: () => {
    throw redirect({ to: "/" });
  },
  component: RouteComponent,
});

function RouteComponent() {
  const api = useApi();
  const { userId, token } = Route.useSearch();
  const navigate = useNavigate();

  const _ = useQuery({
    queryKey: ["query-confirm-email"],
    queryFn: async () => {
      const res = await api.GET("/auth/confirm-email", {
        params: {
          query: {
            Token: token,
            UserId: userId,
          },
        },
      });
      const {response, data, error} = res;

      if (!response.ok && error) {
        toast.error(`Erro ${response.status}: ${error[0].description}`, {
          duration: 3000,
          position: "bottom-center",
          onAutoClose: () => {
            navigate({ to: "/", replace: true });
          },
          style: {
            color: "white",
            backgroundColor: "red",
            borderColor: "red",
          },
        });
        return;
      }

      toast.success(`Email confirmado com sucesso!`, {
          duration: 3000,
          position: "bottom-center",
          onAutoClose: () => {
            navigate({ to: "/", replace: true });
          },
          style: {
            color: "white",
            backgroundColor: "green",
            borderColor: "green",
          },
        });
    },
  });

  return <div className="font-bold text-center animate-pulse">Confirmando email!</div>;
}
