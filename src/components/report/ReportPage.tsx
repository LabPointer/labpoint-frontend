import type { UseMutationResult, UseQueryResult } from "@tanstack/react-query";
import { EyeIcon } from "lucide-react";
import { useMemo, useState } from "react";
import { ApiError } from "#/lib/types/error-types";
import {
  formatMonthYearPeriod,
  type MonthYearPeriod,
  previousMonthYear,
  singleMonthPeriod,
} from "#/lib/utils/month-year";
import { notifyError, notifySuccess } from "#/lib/utils/notify";
import { emptyReportData, type ReportData, type ReportKind } from "#/lib/utils/report";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ReportRankingCard } from "./ReportRankingCard";
import { ReportReservesTable } from "./ReportReservesTable";
import { ReportSummaryCards } from "./ReportSummaryCards";
import { ReportToolbar } from "./ReportToolbar";
import { ReportUserCards } from "./ReportUserCards";
import { type ReportMode, reportCardClass } from "./report-ui";

type ReportPageProps = {
  kind: ReportKind;
  /** Hook da consulta do relatório (`useReport` ou `useResourceReport`). Deve ser sempre o mesmo por rota. */
  useReportQuery: (period: MonthYearPeriod) => UseQueryResult<ReportData>;
  /** Hook que recalcula o período (`useRefreshReport` ou `useRefreshResourceReport`). */
  useRefresh: () => UseMutationResult<unknown, unknown, MonthYearPeriod>;
};

/** Tela de relatório (salas ou recursos): período, indicadores, rankings, usuários, reservas e PDF. */
export function ReportPage({ kind, useReportQuery, useRefresh }: ReportPageProps) {
  // Só meses encerrados: o atual e os futuros ainda mudam (confirmações, cancelamentos, novas reservas).
  const maxMonth = useMemo(previousMonthYear, []);
  const [period, setPeriod] = useState<MonthYearPeriod>(() => singleMonthPeriod(maxMonth));
  const [isExporting, setIsExporting] = useState(false);
  const report = useReportQuery(period);
  const refresh = useRefresh();

  const data = report.data ?? emptyReportData(period, kind);
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
        title={data.copy.title}
        subtitle={data.copy.subtitle}
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
                <strong>Prévia do relatório.</strong> Não há reservas contabilizadas em {formatMonthYearPeriod(period)},
                então os indicadores aparecem como esqueleto. O PDF exportado mantém essa estrutura e leva a marca
                “PRÉVIA”.
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
