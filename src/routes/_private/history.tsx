import { createFileRoute } from "@tanstack/react-router";
import { HistoryCard } from "#/components/history/HistoryCard";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "#/components/ui/tabs";

export const Route = createFileRoute("/_private/history")({
	component: RouteComponent,
});

function RouteComponent() {
	return (
		<section className="container">
			<Tabs defaultValue="next" className="w-full items-center gap-y-10">
				<TabsList
					className={
						"bg-white/10 border dark:border-violet-400/20 shadow-md hover:shadow-lg dark:shadow-violet-300/20"
					}
				>
					<TabsTrigger value="next">Próximas</TabsTrigger>
					<TabsTrigger value="completed">Concluídas</TabsTrigger>
					<TabsTrigger value="cancelled">Canceladas</TabsTrigger>
				</TabsList>
				<TabsContent
					value="next"
					className="w-full grid grid-cols-[repeat(auto-fit,minmax(256px,1fr))] justify-center gap-6"
				>
					<HistoryCard />
					<HistoryCard />
					<HistoryCard />
				</TabsContent>
				<TabsContent
					value="completed"
					className="w-full grid grid-cols-[repeat(auto-fit,minmax(256px,1fr))] justify-center gap-6"
				>
					<HistoryCard />
					<HistoryCard />
					<HistoryCard />
				</TabsContent>
				<TabsContent
					value="cancelled"
					className="w-full grid grid-cols-[repeat(auto-fit,minmax(256px,1fr))] justify-center gap-6"
				>
					<HistoryCard />
					<HistoryCard />
					<HistoryCard />
				</TabsContent>
			</Tabs>
		</section>
	);
}
