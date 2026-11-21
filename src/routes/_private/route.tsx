import { createFileRoute, type LinkProps, Outlet, redirect, useLocation } from "@tanstack/react-router";
import { type CSSProperties, useState } from "react";
import { useMediaQuery } from "#/hooks/use-media-query";
import { AppSidebar } from "@/components/AppSideBar";
import { NotificationDot } from "@/components/shared/NotificationDot";
import { ThemeToggle } from "@/components/ThemeToggle";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { useCheckOutAlerts } from "@/components/usage/use-check-out-alerts";

export const Route = createFileRoute("/_private")({
  beforeLoad: async ({ context }) => {
    const { sessionInfo } = context;
    if (!sessionInfo) {
      throw redirect({ to: "/" });
    }
  },
  component: RouteComponent,
});

const routeTitles: Map<LinkProps["to"], string> = new Map([
  ["/space-reserve", "Reservar sala"],
  ["/resource-reserve", "Reservar recurso"],
  ["/calendar", "Calendário"],
  ["/space-history", "Histórico de sala"],
  ["/resource-history", "Histórico de recursos"],
  ["/check-out", "Check-out"],
  ["/profile", "Perfil"],
  ["/admin/manage-spaces", "Gerenciar espaços"],
  ["/admin/manage-space-reserves", "Gerenciar reservas de espaço"],
  ["/admin/manage-resource-reserves", "Gerenciar reservas de recurso"],
  ["/admin/manage-check-out", "Gerenciar check-out"],
  ["/admin/manage-calendar", "Gerenciar calendário"],
  ["/admin/manage-users", "Gerenciar usuários"],
  ["/admin/manage-resources", "Gerenciar recursos"],
  ["/admin/manage-subjects", "Gerenciar matérias"],
  ["/admin/manage-schedules", "Gerenciar horários"],
  ["/admin/space-report", "Relatório de salas"],
  ["/admin/resource-report", "Relatório de recursos"],
]);

function RouteComponent() {
  const { pathname } = useLocation();
  const routeTitle = routeTitles.get(pathname as LinkProps["to"]) ?? "Labpoint";
  const { sessionInfo } = Route.useRouteContext();
  const isAdmin = !!sessionInfo && (sessionInfo.roles.includes("Admin") || sessionInfo.roles.includes("Root"));
  // Mesmas queries da sidebar (o React Query compartilha o cache): avisa no botão do menu no mobile.
  const checkOutAlerts = useCheckOutAlerts({ isAdmin });
  const hasAlert = checkOutAlerts.mine || checkOutAlerts.admin;

  // Entre 768 e 1023px a barra lateral começa recolhida (só ícones) para sobrar espaço ao conteúdo;
  // a partir de 1024px começa aberta. O botão do cabeçalho alterna nos dois casos.
  const isWide = useMediaQuery("(min-width: 1024px)", true);
  const [sidebarOpen, setSidebarOpen] = useState(isWide);
  const [prevWide, setPrevWide] = useState(isWide);
  if (prevWide !== isWide) {
    setPrevWide(isWide);
    setSidebarOpen(isWide);
  }

  return (
    <SidebarProvider
      open={sidebarOpen}
      onOpenChange={setSidebarOpen}
      style={{ "--sidebar-width-icon": "4rem" } as CSSProperties}
    >
      <AppSidebar />
      <main className="min-w-0 flex-1">
        <header className="flex h-16 items-center justify-between gap-2 border-b border-(--line) px-4 md:px-8">
          <div className="relative flex items-center lg:hidden">
            <SidebarTrigger />
            {hasAlert && (
              <NotificationDot
                label="Há ações disponíveis no menu"
                className="pointer-events-none absolute -top-0.5 -right-0.5 size-2"
              />
            )}
          </div>

          <div>
            <h1 className="mt-0.5 text-center text-base font-bold sm:text-lg">{routeTitle}</h1>
          </div>

          <div className="flex items-center">
            <ThemeToggle />
          </div>
        </header>
        <div className="p-4 md:p-8 min-h-[calc(100vh-4rem)]">
          <Outlet />
        </div>
      </main>
    </SidebarProvider>
  );
}
