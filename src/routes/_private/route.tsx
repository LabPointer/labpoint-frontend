import { createFileRoute, Outlet, redirect, useLocation, type LinkProps } from "@tanstack/react-router";
import { AppSidebar } from "@/components/AppSideBar";
import { ThemeToggle } from "@/components/ThemeToggle";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";

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
    ["/home", "Início"],
    ["/calendar", "Calendário"],
    ["/history", "Histórico"],
    ["/admin/manage-spaces", "Gerenciar espaços"],
    ["/admin/manage-space-reserves", "Gerenciar reservas de espaço"],
    ["/admin/manage-users", "Gerenciar usuários"],
    ["/admin/manage-resources", "Gerenciar recursos"],
    ["/admin/manage-subjects", "Gerenciar matérias"],
    ["/admin/manage-schedules", "Gerenciar horários"],
    ["/admin/report", "Relatórios"],
]);

function RouteComponent() {
    const { pathname } = useLocation();
    const routeTitle = routeTitles.get(pathname as LinkProps["to"]) ?? "Labpoint";

    return (
        <>
            <SidebarProvider>
                <AppSidebar />
                <main className="min-w-0 flex-1">
                    <header className="flex h-16 items-center justify-between border-b border-[color:var(--line)] px-4 md:px-8">
                        <div className="flex items-center">
                            <SidebarTrigger className="md:hidden" />
                        </div>

                        <div>
                            <h1 className="text-lg font-bold  mt-0.5 text-center">
                                {routeTitle}
                            </h1>
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
        </>
    );
}
