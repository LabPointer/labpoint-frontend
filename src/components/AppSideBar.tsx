import { createLink, type LinkProps, useRouteContext, useRouter } from "@tanstack/react-router";
import {
  Book,
  Box,
  Building,
  Building2,
  Calendar,
  ChevronsUpDown,
  ClipboardCheck,
  ClipboardList,
  Clock,
  FileBarChart,
  FileText,
  FlaskConical,
  History,
  Home,
  LogOut,
  Package,
  PackageCheck,
  PackageSearch,
  UserRound,
  Users,
} from "lucide-react";
import { api } from "#/lib/utils/restapi";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
import { NotificationDot } from "@/components/shared/NotificationDot";
import { useCheckOutAlerts } from "@/components/usage/use-check-out-alerts";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Button } from "./ui/button";

const LinkButton = createLink(Button);

type PageRoute = {
  to: LinkProps["to"];
  label: string;
  icon: React.ReactNode;
};

const userRoutes: PageRoute[] = [
  {
    to: "/space-reserve",
    label: "Reservar sala",
    icon: <Home className="size-4" />,
  },
  {
    to: "/resource-reserve",
    label: "Reservar recurso",
    icon: <Package className="size-4" />,
  },
  {
    to: "/calendar",
    label: "Calendário",
    icon: <Calendar className="size-4" />,
  },
  {
    to: "/space-history",
    label: "Histórico de sala",
    icon: <History className="size-4" />,
  },
  {
    to: "/resource-history",
    label: "Histórico de recursos",
    icon: <PackageSearch className="size-4" />,
  },
  {
    to: "/check-out",
    label: "Check-out",
    icon: <ClipboardCheck className="size-4" />,
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
    to: "/admin/manage-space-reserves",
    label: "Gerenciar reserva de espaços",
    icon: <Building2 className="size-4" />,
  },
  {
    to: "/admin/manage-resource-reserves",
    label: "Gerenciar reserva de recursos",
    icon: <PackageCheck className="size-4" />,
  },
  {
    to: "/admin/manage-check-out",
    label: "Gerenciar check-out",
    icon: <ClipboardList className="size-4" />,
  },
];

const coordinatorRoutes: PageRoute[] = [
  {
    to: "/admin/space-report",
    label: "Relatório de salas",
    icon: <FileText className="size-4" />,
  },
  {
    to: "/admin/resource-report",
    label: "Relatório de recursos",
    icon: <FileBarChart className="size-4" />,
  },
];

/** Rotas com algo a fazer: mostram uma bolinha de notificação. */
type RouteAlerts = Partial<Record<string, boolean>>;

function NavLinks({ routes, alerts = {} }: { routes: PageRoute[]; alerts?: RouteAlerts }) {
  return (
    <SidebarMenu>
      <SidebarMenuItem className="flex flex-col gap-y-1">
        {routes.map((route) => (
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
                {alerts[route.to as string] && <NotificationDot label="Há ações disponíveis" className="ml-auto" />}
              </LinkButton>
            }
          />
        ))}
      </SidebarMenuItem>
    </SidebarMenu>
  );
}

function UserIdentity({ username, roles }: { username: string; roles: string }) {
  return (
    <div className="flex min-w-0 items-center gap-3">
      <Avatar size="lg">
        <AvatarImage src="https://github.com/shadcn.png" />
        <AvatarFallback>LP</AvatarFallback>
      </Avatar>
      <div className="flex min-w-0 flex-col justify-center text-left">
        <span className="truncate text-sm font-semibold text-foreground">{username}</span>
        <span className="truncate text-xs text-[color:var(--sea-ink-soft)]">{roles}</span>
      </div>
    </div>
  );
}

export function AppSidebar() {
  const { sessionInfo } = useRouteContext({ from: "__root__" });
  const router = useRouter();
  const username = sessionInfo?.username || "Não definido";
  const roles = sessionInfo?.roles.join(", ") || "Não definido";
  const isAdmin = !!sessionInfo && (sessionInfo.roles.includes("Admin") || sessionInfo.roles.includes("Owner"));
  const checkOutAlerts = useCheckOutAlerts({ isAdmin });

  async function handleLogout() {
    await api.POST("/auth/sign-out");
    await router.invalidate();
  }

  return (
    <Sidebar className="border-sidebar-border/70">
      <SidebarHeader className="flex justify-center border-b border-sidebar-border/70 px-5 h-16">
        <div className="flex items-center gap-3">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-linear-to-br from-violet-500 to-violet-700 text-white shadow-md shadow-violet-600/30 ring-1 ring-violet-700/20 ring-inset dark:from-violet-400 dark:to-violet-600 dark:shadow-violet-500/40 dark:ring-white/15">
            <FlaskConical aria-hidden="true" className="size-5" strokeWidth={2.2} />
          </div>
          <div className="min-w-0">
            <p className="truncate text-lg font-bold tracking-wide">
              Lab<span className="text-violet-600 dark:text-violet-400">point</span>
            </p>
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup className="px-3 py-5">
          <p className="mb-2 px-2 text-sm font-bold uppercase tracking-[0.18em]">Reservas</p>
          <SidebarGroupContent>
            <NavLinks routes={userRoutes} alerts={{ "/check-out": checkOutAlerts.mine }} />
          </SidebarGroupContent>
        </SidebarGroup>
        {sessionInfo && (sessionInfo.roles.includes("Admin") || sessionInfo.roles.includes("Owner")) && (
          <SidebarGroup className="px-3 py-5">
            <p className="mb-2 px-2 text-sm font-bold uppercase tracking-[0.18em]">Coordenação</p>
            <SidebarGroupContent>
              <NavLinks routes={adminRoutes} alerts={{ "/admin/manage-check-out": checkOutAlerts.admin }} />
            </SidebarGroupContent>
          </SidebarGroup>
        )}
        {sessionInfo && (sessionInfo.roles.includes("Admin") || sessionInfo.roles.includes("Owner")) && (
          <SidebarGroup className="px-3 py-5">
            <p className="mb-2 px-2 text-sm font-bold uppercase tracking-[0.18em]">Diretoria</p>
            <SidebarGroupContent>
              <NavLinks routes={coordinatorRoutes} />
            </SidebarGroupContent>
          </SidebarGroup>
        )}
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border/70 px-3 py-3">
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger
                render={
                  <SidebarMenuButton
                    size="lg"
                    aria-label="Menu do usuário"
                    className="h-14 gap-3 rounded-xl px-2 data-popup-open:bg-sidebar-accent"
                  />
                }
              >
                <UserIdentity username={username} roles={roles} />
                <ChevronsUpDown className="ml-auto size-4 shrink-0 opacity-60" />
              </DropdownMenuTrigger>

              <DropdownMenuContent side="top" align="end" sideOffset={8} className="min-w-56">
                <DropdownMenuGroup>
                  <DropdownMenuLabel className="p-0 font-normal">
                    <div className="px-1.5 py-1.5">
                      <UserIdentity username={username} roles={roles} />
                    </div>
                  </DropdownMenuLabel>
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => router.navigate({ to: "/profile" })}>
                  <UserRound />
                  Perfil
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem variant="destructive" onClick={handleLogout}>
                  <LogOut />
                  Sair
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
