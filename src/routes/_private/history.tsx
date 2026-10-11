import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useFormDialog } from "#/hooks/use-form-dialog";
import {
  type Reserve,
  type ReserveTab,
  reserveTab,
  toApiDate,
  useCancelReserve,
  useEditReserve,
  useMonthReserves,
} from "#/lib/queries/reserves";
import { succeeded } from "#/lib/utils/api-result";
import { currentMonthYear, type MonthYear } from "#/lib/utils/month-year";
import { CancelReserveDialog } from "@/components/history/CancelReserveDialog";
import { HistoryCard } from "@/components/history/HistoryCard";
import { type HistoryEditFormData, HistoryEditModal } from "@/components/history/HistoryEditModal";
import { MonthYearPicker } from "@/components/history/MonthYearPicker";
import { QueryBoundary } from "@/components/shared/QueryBoundary";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export const Route = createFileRoute("/_private/history")({
  component: RouteComponent,
});

const tabs: { value: ReserveTab; label: string }[] = [
  { value: "next", label: "Próximas" },
  { value: "concluded", label: "Concluídas" },
  { value: "canceled", label: "Canceladas" },
];

function RouteComponent() {
  const [monthYear, setMonthYear] = useState<MonthYear>(currentMonthYear);
  const reserves = useMonthReserves(monthYear);
  const editReserve = useEditReserve();
  const cancelReserve = useCancelReserve();
  const editDialog = useFormDialog<Reserve>();
  const cancelDialog = useFormDialog<Reserve>();

  // uma única passada separa as reservas nas três abas (mais recentes primeiro nas concluídas/canceladas)
  const grouped = useMemo(() => {
    const result: Record<ReserveTab, Reserve[]> = { next: [], concluded: [], canceled: [] };
    for (const reserve of reserves.data ?? []) result[reserveTab(reserve)].push(reserve);
    result.next.sort((a, b) => a.dateFrom.localeCompare(b.dateFrom));
    result.concluded.sort((a, b) => b.dateFrom.localeCompare(a.dateFrom));
    result.canceled.sort((a, b) => b.dateFrom.localeCompare(a.dateFrom));
    return result;
  }, [reserves.data]);

  async function handleEdit(data: HistoryEditFormData) {
    const reserve = editDialog.target;
    if (!reserve || !data.range.from) return;

    const ok = await succeeded(
      editReserve.mutateAsync({
        reserveId: Number(reserve.id),
        body: {
          startAt: toApiDate(data.range.from),
          endAt: toApiDate(data.range.to ?? data.range.from),
          scheduleIds: data.schedules.map((schedule) => schedule.id),
        },
      }),
    );
    if (ok) editDialog.close();
  }

  async function handleConfirmCancel() {
    const reserve = cancelDialog.target;
    if (!reserve) return;

    if (await succeeded(cancelReserve.mutateAsync(Number(reserve.id)))) cancelDialog.close();
  }

  return (
    <>
      {editDialog.target && (
        <HistoryEditModal
          key={editDialog.session}
          reserve={editDialog.target}
          open={editDialog.isOpen}
          onClose={editDialog.close}
          onSubmit={handleEdit}
        />
      )}
      {cancelDialog.target && (
        <CancelReserveDialog
          open={cancelDialog.isOpen}
          spaceName={cancelDialog.target.space.name}
          isPending={cancelReserve.isPending}
          onClose={cancelDialog.close}
          onConfirm={handleConfirmCancel}
        />
      )}

      <section className="container flex flex-col items-center gap-6">
        <MonthYearPicker value={monthYear} onChange={setMonthYear} />
        <Tabs defaultValue="next" className="w-full items-center gap-y-10">
          <TabsList className="border bg-white/10 shadow-md hover:shadow-lg dark:border-violet-400/20 dark:shadow-violet-300/20">
            {tabs.map((tab) => (
              <TabsTrigger key={tab.value} value={tab.value}>
                {tab.label}
              </TabsTrigger>
            ))}
          </TabsList>

          {tabs.map((tab) => (
            <TabsContent key={tab.value} value={tab.value} className="flex w-full">
              <div className="w-full">
                <QueryBoundary
                  isPending={reserves.isPending}
                  isFetching={reserves.isFetching}
                  isError={reserves.isError}
                  error={reserves.error}
                  isEmpty={grouped[tab.value].length === 0}
                  loadingText="Carregando..."
                  emptyText="Nenhum histórico encontrado."
                >
                  <div className="grid w-full grid-cols-[repeat(auto-fit,minmax(288px,1fr))] justify-center gap-6">
                    {grouped[tab.value].map((reserve) => (
                      <div key={reserve.id} className="flex w-full justify-center p-2">
                        <HistoryCard
                          reserve={reserve}
                          showCTA={tab.value === "next"}
                          onEdit={editDialog.open}
                          onCancel={cancelDialog.open}
                        />
                      </div>
                    ))}
                  </div>
                </QueryBoundary>
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </section>
    </>
  );
}
