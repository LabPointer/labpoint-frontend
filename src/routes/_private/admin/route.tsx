import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/_private/admin")({
  beforeLoad: async ({ context }) => {
    const { sessionInfo } = context;
    if (sessionInfo && !(sessionInfo.roles.includes("Admin") || sessionInfo.roles.includes("Owner"))) {
      throw redirect({ to: "/home" });
    }
  },
  component: RouteComponent,
});

function RouteComponent() {
  return <Outlet />;
}
