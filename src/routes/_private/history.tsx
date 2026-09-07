import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { HistoryCard } from "#/components/history/HistoryCard";
import { MonthYearPicker } from "#/components/history/MonthYearPicker";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "#/components/ui/tabs";
import { currentMonthYear, type MonthYear } from "#/lib/month-year";
import { useApi } from "#/lib/restapi";
import { Schedules } from "#/lib/service";

export const Route = createFileRoute("/_private/history")({
  component: RouteComponent,
});

function RouteComponent() {
  const [monthYear, setMonthYear] = useState<MonthYear>(currentMonthYear);
  const api = useApi();

  const {
    data: historyData,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["history", monthYear.year, monthYear.month],
    queryFn: async () => {
      const res = await api.GET("/reserve/hisotory", {
        params: {
          query: {
            yearMonth: `${monthYear.year}-${monthYear.month + 1}`,
          },
        },
      });

      const { response, data } = res;
      if (response.status === 404)
        return {
          next: [],
          completed: [],
          cancelled: [],
        };

      return data;
    },
  });

  {
    /* TODO: Adicionar calback/função apenas para quando o botao editar e cancelar for clicado */
  }

  return (
    <section className="container flex flex-col items-center gap-6">
      <MonthYearPicker value={monthYear} onChange={setMonthYear} />
      <Tabs defaultValue="next" className="w-full items-center gap-y-10">
        <TabsList
          className={"bg-white/10 border dark:border-violet-400/20 shadow-md hover:shadow-lg dark:shadow-violet-300/20"}
        >
          <TabsTrigger value="next">Próximas</TabsTrigger>
          <TabsTrigger value="completed">Concluídas</TabsTrigger>
          <TabsTrigger value="cancelled">Canceladas</TabsTrigger>
        </TabsList>
        <TabsContent value="next" className="w-full flex">
          {/** TODO: Add next reservations */}
          {isLoading ? (
            <div className="w-full flex justify-center items-center h-64">
              <span className="text-sm font-semibold text-neutral-500 dark:text-neutral-400">Carregando...</span>
            </div>
          ) : isError ? (
            <div className="w-full flex justify-center items-center h-64">
              <span className="text-sm font-semibold text-neutral-500 dark:text-neutral-400">
                Erro ao carregar historico.
              </span>
            </div>
          ) : historyData?.next?.length === 0 ? (
            <div className="w-full flex justify-center items-center h-64">
              <span className="text-sm font-semibold text-neutral-500 dark:text-neutral-400">
                Nenhum histórico encontrado.
              </span>
            </div>
          ) : (
            <div className="w-full grid grid-cols-[repeat(auto-fit,minmax(288px,1fr))] justify-center gap-6">
              {historyData?.next?.map((reservation) => (
                <HistoryCard
                  key={String(reservation.reserve.id)}
				  id={String(reservation.reserve.id)}
                  spaceName={reservation.reserve.spaceName}
                  capacity={String(reservation.reserve.capacity)}
                  status={reservation.reserve.status ?? "Status não informado"}
                  dateFrom={reservation.reserve.reservedDateFrom ?? "Data não informada"}
                  dateTo={reservation.reserve.reservedDateTo ?? "Data não informada"}
                  schedules={(reservation.schedules ?? [])
                    .map((schedule) => {
                      const key = schedule;
                      return key ? (Schedules.get(key) ?? key) : null;
                    })
                    .filter((schedule): schedule is string => schedule !== null)
                    .join(", ")}
				  purpose={reservation.reserve.purpose ?? "Propósito não informado"}
                />
              ))}
            </div>
          )}
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
