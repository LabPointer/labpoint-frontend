import { createLink, useRouteContext, useRouter } from "@tanstack/react-router";
import {
    Building,
    ChartBar,
    Clipboard,
    FlaskConical,
    History,
    Home,
    LogOut,
    Users,
} from "lucide-react";
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
import { useApi } from "@/lib/restapi";
import { setIsAuthenticated, setSessionServerFn } from "@/lib/session";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Button } from "./ui/button";

export function AppSidebar() {
    const LinkButton = createLink(Button);
    const { sessionInfo } = useRouteContext({ from: "__root__" });
    const api = useApi();
    const router = useRouter();

    async function handleLogout() {
        const promises = [
            await api.POST("/auth/sign-out"),
            await setSessionServerFn({
                data: {
                    username: undefined,
                    role: "USER",
                    expire_in: "",
                },
            }),
            await setIsAuthenticated({ data: false }),
            await router.invalidate(),
        ];
        await Promise.all(promises);
    }

    return (
        <Sidebar className="border-sidebar-border/70">
            <SidebarHeader className="flex justify-center border-b border-sidebar-border/70 px-5 h-16">
                <div className="flex items-center gap-3">
                    <div className="flex size-10 shrink-0 items-center justify-center rounded-xl shadow-sm bg-violet-600 dark:bg-violet-400">
                        <FlaskConical
                            aria-hidden="true"
                            className="size-5"
                            strokeWidth={2.2}
                        />
                    </div>
                    <div className="min-w-0">
                        <p className="truncate text-lg font-bold tracking-wide">
                            Labpoint
                        </p>
                    </div>
                </div>
            </SidebarHeader>
            <SidebarContent>
                <SidebarGroup className="px-3 py-5">
                    <p className="mb-2 px-2 text-sm font-bold uppercase tracking-[0.18em]">
                        Reservas
                    </p>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            <SidebarMenuItem className="flex flex-col gap-y-1">
                                <SidebarMenuButton
                                    render={
                                        <LinkButton
                                            to="/home"
                                            variant="ghost"
                                            activeProps={{
                                                variant: "default",
                                                className:
                                                    "hover:bg-violet-600 hover:text-white",
                                            }}
                                            className="h-10 justify-start gap-3 rounded-xl px-3"
                                        >
                                            <Home
                                                aria-hidden="true"
                                                className="size-4"
                                            />
                                            <span>Início</span>
                                        </LinkButton>
                                    }
                                />
                                <SidebarMenuButton
                                    render={
                                        <LinkButton
                                            to="/history"
                                            variant="ghost"
                                            activeProps={{
                                                variant: "default",
                                                className:
                                                    "hover:bg-violet-600 hover:text-white",
                                            }}
                                            className="h-10 justify-start gap-3 rounded-xl px-3"
                                        >
                                            <History
                                                aria-hidden="true"
                                                className="size-4"
                                            />
                                            <span>Histórico</span>
                                        </LinkButton>
                                    }
                                />
                            </SidebarMenuItem>
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>
                <SidebarGroup className="px-3 py-5">
                    <p className="mb-2 px-2 text-sm font-bold uppercase tracking-[0.18em]">
                        Coordenação
                    </p>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            <SidebarMenuItem>
                                <SidebarMenuButton
                                    render={
                                        <LinkButton
                                            to="/admin/manage-spaces"
                                            variant="ghost"
                                            activeProps={{
                                                variant: "default",
                                                className:
                                                    "hover:bg-violet-600 hover:text-white",
                                            }}
                                            className="h-10 justify-start gap-3 rounded-xl px-3"
                                        >
                                            <Building
                                                aria-hidden="true"
                                                className="size-4"
                                            />
                                            <span>Gerenciar salas</span>
                                        </LinkButton>
                                    }
                                />
                                <SidebarMenuButton
                                    render={
                                        <LinkButton
                                            to="/admin/manage-reserves"
                                            variant="ghost"
                                            activeProps={{
                                                variant: "default",
                                                className:
                                                    "hover:bg-violet-600 hover:text-white",
                                            }}
                                            className="h-10 justify-start gap-3 rounded-xl px-3"
                                        >
                                            <Clipboard
                                                aria-hidden="true"
                                                className="size-4"
                                            />
                                            <span>Gerenciar reservas</span>
                                        </LinkButton>
                                    }
                                />
                                <SidebarMenuButton
                                    render={
                                        <LinkButton
                                            to="/admin/manage-users"
                                            variant="ghost"
                                            activeProps={{
                                                variant: "default",
                                                className:
                                                    "hover:bg-violet-600 hover:text-white",
                                            }}
                                            className="h-10 justify-start gap-3 rounded-xl px-3"
                                        >
                                            <Users
                                                aria-hidden="true"
                                                className="size-4"
                                            />
                                            <span>Gerenciar usuarios</span>
                                        </LinkButton>
                                    }
                                />
                            </SidebarMenuItem>
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>
                <SidebarGroup className="px-3 py-5">
                    <p className="mb-2 px-2 text-sm font-bold uppercase tracking-[0.18em]">
                        Diretoria
                    </p>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            <SidebarMenuItem>
                                <SidebarMenuButton
                                    render={
                                        <LinkButton
                                            to="/admin/report"
                                            variant="ghost"
                                            activeProps={{
                                                variant: "default",
                                                className:
                                                    "hover:bg-violet-600 hover:text-white",
                                            }}
                                            className="h-10 justify-start gap-3 rounded-xl px-3"
                                        >
                                            <ChartBar
                                                aria-hidden="true"
                                                className="size-4"
                                            />
                                            <span>Relatórios</span>
                                        </LinkButton>
                                    }
                                />
                            </SidebarMenuItem>
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>
            </SidebarContent>
            <SidebarFooter className="border-t border-sidebar-border/70 px-5 py-4">
                <div className="flex items-center gap-3">
                    <Avatar size="lg">
                        <AvatarImage src="https://github.com/shadcn.png" />
                        <AvatarFallback>LP</AvatarFallback>
                    </Avatar>

                    <div className="flex flex-col justify-center min-w-0">
                        <span className="truncate text-sm font-semibold">
                            {sessionInfo.username}
                        </span>
                        <span className="truncate text-xs text-[color:var(--sea-ink-soft)]">
                            {sessionInfo.role}
                        </span>
                    </div>

                    <Button
                        onClick={handleLogout}
                        variant={"destructive"}
                        size={"icon-lg"}
                        className="ml-auto"
                    >
                        <LogOut className="size-4" />
                    </Button>
                </div>
            </SidebarFooter>
        </Sidebar>
    );
}
