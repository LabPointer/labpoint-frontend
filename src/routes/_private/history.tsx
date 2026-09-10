import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { HistoryEditModal } from "#/components/history/HistoryEditModal";
import { currentMonthYear, type MonthYear } from "#/lib/utils/month-year";
import { useApi } from "#/lib/utils/restapi";
import { HistoryCard } from "@/components/history/HistoryCard";
import { MonthYearPicker } from "@/components/history/MonthYearPicker";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Schedules } from "@/lib/service";

export const Route = createFileRoute("/_private/history")({
  component: RouteComponent,
});

function RouteComponent() {
  const [monthYear, setMonthYear] = useState<MonthYear>(currentMonthYear);
  const [selectedReservation, setSelectedReservation] = useState<{
    id: number;
    name: string;
    description: string;
  } | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const api = useApi();

  const {
    data: historyData,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ["history", monthYear.year, monthYear.month],
    queryFn: async () => {
      const res = await api.GET("/reserve", {
        params: {
          query: {
            yearMonth: `${monthYear.year}-${monthYear.month + 1}`,
          },
        },
      });

      const { response, data, error } = res;
      if (!response.ok && error && response.status !== 404) {
        toast.error(`Error ${response.status}: ${error.message}`, {
          duration: 3000,
          position: "bottom-center",
          style: {
            color: "white",
            backgroundColor: "red",
            borderColor: "red",
          },
        });
        return;
      }
      if (response.status === 404) {
        return {
          next: [] as never[],
          concluded: [] as never[],
          canceled: [] as never[],
        };
      }

      return {
          next: data?.next,
          concluded: data?.concluded,
          canceled: data?.canceled,
        };
    },
  });

  async function handleCancelReservation(reserveId: string) {
    const res = await api.DELETE("/reserve/history/cancel/{id}", {
      params: {
        path: {
          id: Number(reserveId),
        },
      },
    });

    if (res.response.status !== 204) {
      toast.error(`${res.response.status} - ${res.response.statusText}`, {
        duration: 3000,
        position: "bottom-center",
        style: {
          color: "white",
          backgroundColor: "red",
          borderColor: "red",
        },
      });
      return;
    }

    toast.success("Reserva cancelada com sucesso!", {
      duration: 2000,
      position: "bottom-center",
      onAutoClose: () => {
        refetch();
      },
      style: {
        color: "white",
        backgroundColor: "green",
        borderColor: "green",
      },
    });
  }

  return (
    <>
      {selectedReservation && (
        <HistoryEditModal
          id={selectedReservation.id}
          name={selectedReservation.name}
          description={selectedReservation.description}
          open={isEditModalOpen}
          onOpenChange={(open) => {
            setIsEditModalOpen(open);
            if (!open) {
              setSelectedReservation(null);
              refetch();
            }
          }}
        />
      )}
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
                  <div key={reservation.reserve.id} className="w-full flex justify-center p-2">
                    <HistoryCard
                      key={String(reservation.reserve.id)}
                      id={String(reservation.reserve.id)}
                      spaceName={reservation.reserve.spaceName}
                      capacity={String(reservation.reserve.capacity)}
                      status={reservation.reserve.status ?? "Status não informado"}
                      dateFrom={reservation.reserve.reservedDateFrom ?? "Data não informada"}
                      dateTo={reservation.reserve.reservedDateTo ?? "Data não informada"}
                      schedules={
                        reservation.schedules as (
                          | "M_AULA_1"
                          | "M_AULA_2"
                          | "M_AULA_3"
                          | "M_AULA_4"
                          | "M_AULA_5"
                          | "V_AULA_1"
                          | "V_AULA_2"
                          | "V_AULA_3"
                          | "V_AULA_4"
                          | "V_AULA_5"
                          | "N_AULA_1"
                          | "N_AULA_2"
                          | "N_AULA_3"
                          | "N_AULA_4"
                        )[]
                      }
                      showCTA={true}
                      purpose={reservation.reserve.purpose ?? "Propósito não informado"}
                      onCancel={async () => await handleCancelReservation(String(reservation.reserve.id))}
                      onEdit={() => {
                        setSelectedReservation({
                          id: reservation.reserve.id,
                          name: reservation.reserve.spaceName,
                          description: reservation.reserve.purpose ?? "Propósito não informado",
                        });
                        setIsEditModalOpen(true);
                      }}
                    />
                  </div>
                ))}
              </div>
            )}
          </TabsContent>
        <TabsContent
          value="completed"
          className="w-full grid grid-cols-[repeat(auto-fit,minmax(256px,1fr))] justify-center gap-6"
        >
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
          ) : historyData?.concluded?.length === 0 ? (
            <div className="w-full flex justify-center items-center h-64">
              <span className="text-sm font-semibold text-neutral-500 dark:text-neutral-400">
                Nenhum histórico encontrado.
              </span>
            </div>
          ) : (
            <div className="w-full grid grid-cols-[repeat(auto-fit,minmax(288px,1fr))] justify-center gap-6">
              {historyData?.concluded?.map((reservation) => (
                <div key={reservation.reserve.id} className="w-full flex justify-center p-2">
                  <HistoryCard
                    key={String(reservation.reserve.id)}
                    id={String(reservation.reserve.id)}
                    spaceName={reservation.reserve.spaceName}
                    capacity={String(reservation.reserve.capacity)}
                    status={reservation.reserve.status ?? "Status não informado"}
                    dateFrom={reservation.reserve.reservedDateFrom ?? "Data não informada"}
                    dateTo={reservation.reserve.reservedDateTo ?? "Data não informada"}
                    schedules={
                      reservation.schedules as (
                        | "M_AULA_1"
                        | "M_AULA_2"
                        | "M_AULA_3"
                        | "M_AULA_4"
                        | "M_AULA_5"
                        | "V_AULA_1"
                        | "V_AULA_2"
                        | "V_AULA_3"
                        | "V_AULA_4"
                        | "V_AULA_5"
                        | "N_AULA_1"
                        | "N_AULA_2"
                        | "N_AULA_3"
                        | "N_AULA_4"
                      )[]
                    }
                    showCTA={false}
                    purpose={reservation.reserve.purpose ?? "Propósito não informado"}
                    onCancel={async () => await handleCancelReservation(String(reservation.reserve.id))}
                  />
                </div>
              ))}
            </div>
          )}
        </TabsContent>
        <TabsContent
          value="cancelled"
          className="w-full grid grid-cols-[repeat(auto-fit,minmax(256px,1fr))] justify-center gap-6"
        >
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
          ) : historyData?.canceled?.length === 0 ? (
            <div className="w-full flex justify-center items-center h-64">
              <span className="text-sm font-semibold text-neutral-500 dark:text-neutral-400">
                Nenhum histórico encontrado.
              </span>
            </div>
          ) : (
            <div className="w-full grid grid-cols-[repeat(auto-fit,minmax(288px,1fr))] justify-center gap-6">
              {historyData?.canceled?.map((reservation) => (
                <div key={reservation.reserve.id} className="w-full flex justify-center p-2">
                  <HistoryCard
                    key={String(reservation.reserve.id)}
                    id={String(reservation.reserve.id)}
                    spaceName={reservation.reserve.spaceName}
                    capacity={String(reservation.reserve.capacity)}
                    status={reservation.reserve.status ?? "Status não informado"}
                    dateFrom={reservation.reserve.reservedDateFrom ?? "Data não informada"}
                    dateTo={reservation.reserve.reservedDateTo ?? "Data não informada"}
                    schedules={
                      reservation.schedules as (
                        | "M_AULA_1"
                        | "M_AULA_2"
                        | "M_AULA_3"
                        | "M_AULA_4"
                        | "M_AULA_5"
                        | "V_AULA_1"
                        | "V_AULA_2"
                        | "V_AULA_3"
                        | "V_AULA_4"
                        | "V_AULA_5"
                        | "N_AULA_1"
                        | "N_AULA_2"
                        | "N_AULA_3"
                        | "N_AULA_4"
                      )[]
                    }
                    showCTA={false}
                    purpose={reservation.reserve.purpose ?? "Propósito não informado"}
                    onCancel={async () => await handleCancelReservation(String(reservation.reserve.id))}
                  />
                </div>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </section>
    </>
  );
}
