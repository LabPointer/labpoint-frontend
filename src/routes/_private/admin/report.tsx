import { createFileRoute } from "@tanstack/react-router";
import { EyeIcon } from "lucide-react";
import { useMemo, useState } from "react";
import { useRefreshReport, useReport } from "#/lib/queries/report";
import { formatMonthYear, type MonthYear, previousMonthYear } from "#/lib/utils/month-year";
import { notifyError, notifySuccess } from "#/lib/utils/notify";
import { ApiError } from "#/lib/types/error-types";
import { emptyReportData } from "#/lib/utils/report";
import { ReportRankingCard } from "@/components/report/ReportRankingCard";
import { ReportReservesTable } from "@/components/report/ReportReservesTable";
import { ReportSummaryCards } from "@/components/report/ReportSummaryCards";
import { ReportToolbar } from "@/components/report/ReportToolbar";
import { ReportUserCards } from "@/components/report/ReportUserCards";
import { type ReportMode, reportCardClass } from "@/components/report/report-ui";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export const Route = createFileRoute("/_private/admin/report")({
  component: RouteComponent,
});

function RouteComponent() {
  // Só meses encerrados: o atual e os futuros ainda mudam (confirmações, cancelamentos, novas reservas).
  const maxMonth = useMemo(previousMonthYear, []);
  const [period, setPeriod] = useState<MonthYear>(maxMonth);
  const [isExporting, setIsExporting] = useState(false);

  const report = useReport(period);
  const refresh = useRefreshReport();

  const data = report.data ?? emptyReportData(period);
  const mode: ReportMode = report.isPending ? "loading" : data.isPreview ? "preview" : "data";
  const failed = report.isError && !report.data;

  async function handleExport() {
    if (!report.data) return;

    setIsExporting(true);
    try {
      // jsPDF só é baixado quando alguém exporta (fica fora do bundle da página).
      const { exportReportPdf } = await import("#/lib/utils/report-pdf");
      exportReportPdf(report.data);
      notifySuccess("Relatório exportado em PDF!");
    } catch (error) {
      notifyError(error instanceof ApiError ? error : undefined);
    } finally {
      setIsExporting(false);
    }
  }

  return (
    <section className="container flex flex-col gap-6" aria-busy={report.isFetching}>
      <ReportToolbar
        period={period}
        maxMonth={maxMonth}
        onPeriodChange={setPeriod}
        generatedAt={data.generatedAt}
        canExport={Boolean(report.data)}
        isExporting={isExporting}
        onExport={handleExport}
        canRefresh={Boolean(report.data)}
        isRefreshing={refresh.isPending}
        onRefresh={() => refresh.mutate(period)}
      />

      {failed ? (
        <Card className={reportCardClass("data")}>
          <div className="flex flex-col items-center gap-3 py-6 text-center">
            <p className="font-bold text-destructive">
              Erro: {report.error instanceof Error ? report.error.message : "Erro desconhecido."}
            </p>
            <Button type="button" variant="outline" onClick={() => report.refetch()}>
              Tentar novamente
            </Button>
          </div>
        </Card>
      ) : (
        <>
          {mode === "preview" && (
            <div
              role="status"
              className="flex items-start gap-3 rounded-md border border-dashed border-violet-300 bg-violet-50 p-4 text-sm text-violet-900 dark:border-violet-400/30 dark:bg-violet-400/10 dark:text-violet-200"
            >
              <EyeIcon className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
              <p>
                <strong>Prévia do relatório.</strong> Não há reservas contabilizadas em {formatMonthYear(period)}, então
                os indicadores aparecem como esqueleto. O PDF exportado mantém essa estrutura e leva a marca “PRÉVIA”.
              </p>
            </div>
          )}

          <ReportSummaryCards report={data} mode={mode} />
          <ReportRankingCard report={data} mode={mode} />
          <ReportUserCards report={data} mode={mode} />
          <ReportReservesTable report={data} mode={mode} />
        </>
      )}
    </section>
  );
}
