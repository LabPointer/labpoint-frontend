import { createLink, useRouteContext, useRouter, type LinkProps } from "@tanstack/react-router";
import {
  Book,
  Box,
  Boxes,
  Building,
  Building2,
  Calendar,
  Clock,
  FileText,
  FlaskConical,
  History,
  Home,
  LogOut,
  Users,
} from "lucide-react";
import { useApi } from "#/lib/utils/restapi";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Button } from "./ui/button";

type PageRoute = {
  to: LinkProps["to"];
  label: string;
  icon: React.ReactNode;
};

export function AppSidebar() {
  const LinkButton = createLink(Button);
  const { sessionInfo } = useRouteContext({ from: "__root__" });
  const api = useApi();
  const router = useRouter();

  async function handleLogout() {
    await api.POST("/auth/sign-out");
    await router.invalidate();
  }

  const userRoutes: PageRoute[] = [
    {
      to: "/",
      label: "Início",
      icon: <Home className="size-4" />,
    },
    {
      to: "/calendar",
      label: "Calendario",
      icon: <Calendar className="size-4" />,
    },
    {
      to: "/history",
      label: "Histórico",
      icon: <History className="size-4" />,
    },
  ];

  const adminRoutes: PageRoute[] = [
    {
      to: "/admin/manage-resources",
      label: "Gerenciar recursos",
      icon: <Box className="size-4" />,
    },
    {
      to: "/admin/manage-subjects",
      label: "Gerenciar matérias",
      icon: <Book className="size-4" />,
    },
    {
      to: "/admin/manage-schedules",
      label: "Gerenciar horários",
      icon: <Clock className="size-4" />,
    },
    {
      to: "/admin/manage-users",
      label: "Gerenciar usuários",
      icon: <Users className="size-4" />,
    },
    {
      to: "/admin/manage-spaces",
      label: "Gerenciar espaços",
      icon: <Building className="size-4" />,
    },
    {
      to: "/admin/manage-space-reserve",
      label: "Gerenciar reserva de espaços",
      icon: <Building2 className="size-4" />,
    },
    {
      to: "/admin/manage-resource-reserve",
      label: "Gerenciar reserva de recursos",
      icon: <Boxes className="size-4" />,
    },
  ];

  const coordinatorRoutes: PageRoute[] = [
    {
      to: "/admin/reports",
      label: "Relatorios",
      icon: <FileText className="size-4" />,
    },
  ];

  return (
    <Sidebar className="border-sidebar-border/70">
      <SidebarHeader className="flex justify-center border-b border-sidebar-border/70 px-5 h-16">
        <div className="flex items-center gap-3">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-xl shadow-sm bg-violet-600 dark:bg-violet-400">
            <FlaskConical aria-hidden="true" className="size-5" strokeWidth={2.2} />
          </div>
          <div className="min-w-0">
            <p className="truncate text-lg font-bold tracking-wide">Labpoint</p>
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup className="px-3 py-5">
          <p className="mb-2 px-2 text-sm font-bold uppercase tracking-[0.18em]">Reservas</p>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem className="flex flex-col gap-y-1">
                {userRoutes.map((route) => (
                  <SidebarMenuButton
                    key={route.to}
                    render={
                      <LinkButton
                        to={route.to}
                        variant="ghost"
                        activeProps={{
                          variant: "default",
                          className: "hover:bg-violet-600 hover:text-white",
                        }}
                        className="h-10 justify-start gap-3 rounded-xl px-3"
                      >
                        {route.icon}
                        <span>{route.label}</span>
                      </LinkButton>
                    }
                  />
                ))}
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        {sessionInfo && (sessionInfo.roles.includes("Admin") || sessionInfo.roles.includes("Owner")) && (
          <SidebarGroup className="px-3 py-5">
            <p className="mb-2 px-2 text-sm font-bold uppercase tracking-[0.18em]">Coordenação</p>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  {adminRoutes.map((route) => (
                    <SidebarMenuButton
                      key={route.to}
                      render={
                        <LinkButton
                          to={route.to}
                          variant="ghost"
                          activeProps={{
                            variant: "default",
                            className: "hover:bg-violet-600 hover:text-white",
                          }}
                          className="h-10 justify-start gap-3 rounded-xl px-3"
                        >
                          {route.icon}
                          <span>{route.label}</span>
                        </LinkButton>
                      }
                    />
                  ))}
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}
        {sessionInfo && (sessionInfo.roles.includes("Admin") || sessionInfo.roles.includes("Owner")) && (
          <SidebarGroup className="px-3 py-5">
            <p className="mb-2 px-2 text-sm font-bold uppercase tracking-[0.18em]">Diretoria</p>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  {coordinatorRoutes.map((route) => (
                    <SidebarMenuButton
                      key={route.to}
                      render={
                        <LinkButton
                          to={route.to}
                          variant="ghost"
                          activeProps={{
                            variant: "default",
                            className: "hover:bg-violet-600 hover:text-white",
                          }}
                          className="h-10 justify-start gap-3 rounded-xl px-3"
                        >
                          {route.icon}
                          <span>{route.label}</span>
                        </LinkButton>
                      }
                    />
                  ))}
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border/70 px-5 py-4">
        <div className="flex items-center gap-3">
          <Avatar size="lg">
            <AvatarImage src="https://github.com/shadcn.png" />
            <AvatarFallback>LP</AvatarFallback>
          </Avatar>

          <div className="flex flex-col justify-center min-w-0">
            <span className="truncate text-sm font-semibold">{sessionInfo?.username || "Nao definido"}</span>
            <span className="truncate text-xs text-[color:var(--sea-ink-soft)]">
              {sessionInfo?.roles.join(", ") || "Nao definido"}
            </span>
          </div>

          <Button onClick={handleLogout} variant={"destructive"} size={"icon-lg"} className="ml-auto">
            <LogOut className="size-4" />
          </Button>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
