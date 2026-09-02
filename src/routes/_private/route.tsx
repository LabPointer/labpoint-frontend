import { createFileRoute, Outlet, useLocation } from "@tanstack/react-router";
import { AppSidebar } from "#/components/AppSideBar";
import { ThemeToggle } from "#/components/ThemeToggle";
import { SidebarProvider, SidebarTrigger } from "#/components/ui/sidebar";

export const Route = createFileRoute("/_private")({
	component: RouteComponent,
});

const routeTitles: Record<string, string> = {
	"/home": "Início",
	"/history": "Histórico",
	"/manage-spaces": "Gerenciar salas",
	"/manage-reservations": "Gerenciar reservas",
	"/manage-users": "Gerenciar usuários",
};

function RouteComponent() {
	const { pathname } = useLocation();
	const routeTitle = routeTitles[pathname] ?? "Labpoint";

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
                            <h1 className="text-lg font-bold  mt-0.5">{routeTitle}</h1>
                        </div>
						
						<div className="flex items-center">
                            <ThemeToggle />
                        </div>
                        
					</header>
					<div className="p-4 md:p-8">
						<Outlet />
					</div>
				</main>
			</SidebarProvider>
		</>
	);
}
