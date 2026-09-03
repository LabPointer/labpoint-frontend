import { HistoryCard } from "#/components/HistoryCard";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "#/components/ui/tabs";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_private/history")({
	component: RouteComponent,
});

function RouteComponent() {
	return (
		<section className="container">
			<Tabs defaultValue="next" className="w-full items-center">
				<TabsList className={"bg-white/10 border dark:border-violet-400/20 shadow-md hover:shadow-lg dark:shadow-violet-300/20"}>
					<TabsTrigger value="next">Próximas</TabsTrigger>
					<TabsTrigger value="completed">Concluídas</TabsTrigger>
					<TabsTrigger value="cancelled">Canceladas</TabsTrigger>
				</TabsList>
				<TabsContent value="next">
					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
						<HistoryCard />
            <HistoryCard />
            <HistoryCard />
					</div>
				</TabsContent>
				<TabsContent value="completed">
					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
						<HistoryCard />
            <HistoryCard />
            <HistoryCard />
					</div>
				</TabsContent>
				<TabsContent value="cancelled">
					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
						<HistoryCard />
            <HistoryCard />
            <HistoryCard />
					</div>
				</TabsContent>
			</Tabs>
		</section>
	);
}
