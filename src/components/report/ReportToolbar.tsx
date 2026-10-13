import { DownloadIcon, FileBarChartIcon, RefreshCwIcon } from "lucide-react";
import type { MonthYear } from "#/lib/utils/month-year";
import { formatReportDateTime } from "#/lib/utils/report";
import { MonthYearPicker } from "@/components/history/MonthYearPicker";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";
import { reportCardClass } from "./report-ui";

type ReportToolbarProps = {
  period: MonthYear;
  /** Último mês selecionável (o mês anterior ao atual). */
  maxMonth: MonthYear;
  onPeriodChange: (period: MonthYear) => void;
  generatedAt: string | null;
  canExport: boolean;
  isExporting: boolean;
  onExport: () => void;
  canRefresh: boolean;
  isRefreshing: boolean;
  onRefresh: () => void;
};

export function ReportToolbar({
  period,
  maxMonth,
  onPeriodChange,
  generatedAt,
  canExport,
  isExporting,
  onExport,
  canRefresh,
  isRefreshing,
  onRefresh,
}: ReportToolbarProps) {
  return (
    <Card className={reportCardClass("data")}>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-violet-600 text-white shadow-sm dark:bg-violet-400 dark:text-violet-950">
            <FileBarChartIcon aria-hidden="true" className="size-5" strokeWidth={2.2} />
          </div>
          <div className="min-w-0">
            <h2 className="text-xl font-bold leading-tight">Relatório de ocupação</h2>
            <p className="text-sm text-muted-foreground">
              Ocupação, no-show e eficiência dos espaços
              {generatedAt && <span> · dados de {formatReportDateTime(generatedAt)}</span>}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <MonthYearPicker value={period} onChange={onPeriodChange} maxMonth={maxMonth} id="report-month" />
          <Button
            type="button"
            variant="outline"
            size="icon-lg"
            className="size-10"
            disabled={!canRefresh || isRefreshing}
            onClick={onRefresh}
            aria-label="Recalcular relatório do mês"
            title="Recalcular relatório do mês"
          >
            <RefreshCwIcon className={isRefreshing ? "animate-spin" : undefined} />
          </Button>
          <Button type="button" className="h-10 gap-2 px-4" disabled={!canExport || isExporting} onClick={onExport}>
            {isExporting ? <Spinner /> : <DownloadIcon />}
            {isExporting ? "Gerando PDF..." : "Exportar PDF"}
          </Button>
        </div>
      </div>
    </Card>
  );
}
