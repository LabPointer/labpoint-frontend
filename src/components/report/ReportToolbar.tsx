import { DownloadIcon, FileBarChartIcon, RefreshCwIcon } from "lucide-react";
import type { MonthYear, MonthYearPeriod } from "#/lib/utils/month-year";
import { formatReportDateTime } from "#/lib/utils/report";
import { MonthYearRangePicker } from "@/components/history/MonthYearRangePicker";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";
import { reportCardClass } from "./report-ui";

type ReportToolbarProps = {
  period: MonthYearPeriod;
  /** Último mês selecionável (o mês anterior ao atual). */
  maxMonth: MonthYear;
  onPeriodChange: (period: MonthYearPeriod) => void;
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
          <MonthYearRangePicker
            value={period}
            onChange={(range) => {
              if (range.from && range.to) onPeriodChange({ from: range.from, to: range.to });
            }}
            maxMonth={maxMonth}
            label={null}
            placeholder="Selecione o período"
            id="report-period"
          />
          <Button
            type="button"
            variant="outline"
            size="icon-lg"
            className="size-10"
            disabled={!canRefresh || isRefreshing}
            onClick={onRefresh}
            aria-label="Recalcular relatório do período"
            title="Recalcular relatório do período"
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
