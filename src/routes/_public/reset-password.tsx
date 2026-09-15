import { createFileRoute, redirect } from "@tanstack/react-router";
import { toast } from "sonner";
import z from "zod";
import { ResetPasswordForm } from "#/components/ResetPasswordForm";

const tokenSearchSchema = z.object({
  token: z.string(),
});

export const Route = createFileRoute("/_public/reset-password")({
  validateSearch: (search) => {
    const { success, data } = tokenSearchSchema.safeParse(search);
    if (!success) {
      toast.error("Token de redefinição de senha ausente. Redirecionando para a página inicial.", {
        duration: 3000,
        position: "bottom-center",
        style: {
          color: "white",
          backgroundColor: "red",
          borderColor: "red",
        },
      });
      
      throw redirect({
        to: "/",
      });
    }

    return data;
  },
  component: RouteComponent,
});

function RouteComponent() {
  const { token } = Route.useSearch();

  return <ResetPasswordForm token={token} />;
}
