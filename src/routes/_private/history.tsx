import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { HistoryCard } from "#/components/history/HistoryCard";
import { MonthYearPicker } from "#/components/history/MonthYearPicker";
import {
	currentMonthYear,
	type MonthYear,
} from "#/components/history/month-year";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "#/components/ui/tabs";
import { useApi } from "#/lib/restapi";
import { useQuery } from "@tanstack/react-query";

export const Route = createFileRoute("/_private/history")({
	component: RouteComponent,
});

function RouteComponent() {
	const [monthYear, setMonthYear] = useState<MonthYear>(currentMonthYear);
	const api = useApi();

	const { data: historyData, isLoading, isError, error } = useQuery({
		queryKey: ["history", monthYear],
		queryFn: async () => {
			const res = await api.GET("/reserve/hisotory", {
				params: {
					query: {
						yearMonth: `${monthYear.month}-${monthYear.year}`
					}
				}
			});

			const {response, data, error} = res;
			if (response.status === 404) return {
				next: [],
				completed: [],
				cancelled: [],
			}

			return data
		},
	});

	{/* TODO: Adicionar calback/função apenas para quando o botao editar e cancelar for clicado */}

	return (
		<section className="container flex flex-col items-center gap-6">
			<MonthYearPicker value={monthYear} onChange={setMonthYear} />
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
					{/** TODO: Add next reservations */}
					{isLoading ? (
						<p>Carregando...</p>
					) : isError ? (
						<p>Erro ao carregar histórico</p>
					) : historyData?.next && historyData.next.length > 0 ? (historyData.next.map((reservation) => (
						<HistoryCard 
							title={reservation.reserves.space?.name}
							location={reservation.tool.location}
							status={reservation.status}
							date={reservation.date}
						/>
					)) : <p>Nenhuma reserva encontrada</p>}
				</TabsContent>
				<TabsContent
					value="completed"
					className="w-full grid grid-cols-[repeat(auto-fit,minmax(256px,1fr))] justify-center gap-6"
				>
					{/** TODO: Add completed reservations */}
					<HistoryCard />
					<HistoryCard />
					<HistoryCard />
				</TabsContent>
				<TabsContent
					value="cancelled"
					className="w-full grid grid-cols-[repeat(auto-fit,minmax(256px,1fr))] justify-center gap-6"
				>
					{/** TODO: Add cancelled reservations */}
					<HistoryCard />
					<HistoryCard />
					<HistoryCard />
				</TabsContent>
			</Tabs>
		</section>
	);
}
