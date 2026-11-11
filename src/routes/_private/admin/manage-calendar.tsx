import { createFileRoute } from "@tanstack/react-router";
import { endOfYear, startOfMonth, startOfYear } from "date-fns";
import { useState } from "react";
import { useCalendarDays, useReleaseDates, useRevokeDate } from "#/lib/queries/calendar";
import { toApiDate } from "#/lib/queries/reserves";
import { succeeded } from "#/lib/utils/api-result";
import { ExtraHolidaysCard } from "@/components/manage-calendar/ExtraHolidaysCard";
import { MonthReleaseCalendar } from "@/components/manage-calendar/MonthReleaseCalendar";
import { MonthRestrictedDaysList } from "@/components/manage-calendar/MonthRestrictedDaysList";
import { RevokeDateDialog } from "@/components/manage-calendar/RevokeDateDialog";
import { QueryBoundary } from "@/components/shared/QueryBoundary";
import { Card, CardContent } from "@/components/ui/card";

export const Route = createFileRoute("/_private/admin/manage-calendar")({
  component: RouteComponent,
});

const CARD_CLASS =
  "rounded-md border bg-white p-4 shadow-md dark:border-violet-500/10 dark:bg-white/5 dark:shadow-violet-300/15";

function RouteComponent() {
  const [month, setMonth] = useState(() => startOfMonth(new Date()));
  // O ano inteiro numa consulta: serve ao mês visível e à lista de feriados.
  const days = useCalendarDays({ startAt: startOfYear(month), endAt: endOfYear(month) });
  const release = useReleaseDates();
  const revoke = useRevokeDate();
  const [revokeTarget, setRevokeTarget] = useState<Date | null>(null);

  const allDays = days.data ?? [];
  const pending = release.isPending || revoke.isPending;
  const handleRelease = (dates: string[]) => succeeded(release.mutateAsync(dates));

  async function handleRevoke(keepReserves: boolean) {
    if (!revokeTarget) return;
    if (await succeeded(revoke.mutateAsync({ date: toApiDate(revokeTarget), keepReserves }))) setRevokeTarget(null);
  }

  return (
    <>
      {revokeTarget && (
        <RevokeDateDialog
          key={revokeTarget.getTime()}
          date={revokeTarget}
          open
          pending={revoke.isPending}
          onClose={() => setRevokeTarget(null)}
          onConfirm={handleRevoke}
        />
      )}

      <section className="container flex flex-col gap-6">
        <div>
          <h2 className="text-xl font-bold">Fins de semana e feriados</h2>
          <p className="text-sm text-muted-foreground">
            Por padrão esses dias não aceitam reservas. Libere os dias do mês em que haverá aula.
          </p>
        </div>

        <QueryBoundary
          isPending={days.isPending}
          isFetching={days.isFetching}
          isError={days.isError}
          error={days.error}
          isEmpty={false}
          loadingText="Carregando o calendário..."
          emptyText=""
        >
          <div className="flex flex-col gap-6">
            <div className="grid gap-6 lg:grid-cols-[minmax(0,26rem)_1fr]">
              <Card className={CARD_CLASS}>
                <CardContent className="p-0">
                  <MonthReleaseCalendar
                    month={month}
                    onMonthChange={setMonth}
                    days={allDays}
                    pending={pending}
                    onRelease={handleRelease}
                    onRevoke={setRevokeTarget}
                  />
                </CardContent>
              </Card>
              <Card className={CARD_CLASS}>
                <CardContent className="p-0">
                  <MonthRestrictedDaysList
                    month={month}
                    days={allDays}
                    pending={pending}
                    onRelease={handleRelease}
                    onRevoke={setRevokeTarget}
                  />
                </CardContent>
              </Card>
            </div>

            <Card className={CARD_CLASS}>
              <CardContent className="p-0">
                <ExtraHolidaysCard year={month.getFullYear()} days={allDays} />
              </CardContent>
            </Card>
          </div>
        </QueryBoundary>
      </section>
    </>
  );
}
