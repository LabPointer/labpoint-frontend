import { BarChart3Icon } from "lucide-react";
import { formatMonthYearPeriod } from "#/lib/utils/month-year";
import { formatPercent, pluralize, type ReportData, type ReportSpaceStat } from "#/lib/utils/report";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import {
  CollapsibleList,
  PercentBar,
  type ReportMode,
  ReportSkeleton,
  reportCardClass,
  SectionIcon,
} from "./report-ui";

type ReportRankingCardProps = { report: ReportData; mode: ReportMode };

type RowConfig = {
  key: string;
  tag: string;
  tagClass: string;
  barClass: string;
  /** Todos os espaços empatados nesse ranking (vazio = ninguém se enquadra). */
  stats: ReportSpaceStat[];
  /** valor da barra e do texto à direita */
  value: (stat: ReportSpaceStat) => number;
  valueText: (stat: ReportSpaceStat) => string;
  emptyText: string;
  /** largura do esqueleto, para a prévia parecer um ranking */
  previewWidth: number;
};

export function ReportRankingCard({ report, mode }: ReportRankingCardProps) {
  const { ranking } = report;

  const rows: RowConfig[] = [
    {
      key: "highest",
      tag: "Alta demanda",
      tagClass: "text-violet-600 dark:text-violet-400",
      barClass: "bg-violet-600 dark:bg-violet-500",
      stats: ranking.highestDemand,
      value: (stat) => stat.occupancyRate,
      valueText: (stat) => `${formatPercent(stat.occupancyRate)} de ocupação`,
      emptyText: "Nenhum espaço teve reservas no período",
      previewWidth: 78,
    },
    {
      key: "lowest",
      tag: "Menor demanda",
      tagClass: "text-amber-600 dark:text-amber-400",
      barClass: "bg-amber-500",
      stats: ranking.lowestDemand,
      value: (stat) => stat.occupancyRate,
      valueText: (stat) => `${formatPercent(stat.occupancyRate)} de ocupação`,
      emptyText: "É preciso ao menos dois espaços com demandas diferentes para comparar",
      previewWidth: 42,
    },
    {
      key: "idle",
      tag: "Mais ociosidade",
      tagClass: "text-rose-600 dark:text-rose-400",
      barClass: "bg-rose-500",
      stats: ranking.mostIdle,
      value: (stat) => stat.idleRate,
      valueText: (stat) =>
        `${formatPercent(stat.idleRate)} ausentes · ${pluralize(stat.absentReserves, "ausência", "ausências")} em ${stat.totalReserves}`,
      emptyText: "Nenhuma ausência registrada no período",
      previewWidth: 26,
    },
  ];

  return (
    <Card className={cn(reportCardClass(mode), "gap-5")}>
      <div className="flex items-center gap-3">
        <SectionIcon>
          <BarChart3Icon className="size-5" />
        </SectionIcon>
        <div>
          <h2 className="text-lg font-bold leading-tight">Ranking de utilização por sala</h2>
          <p className="text-sm text-muted-foreground">
            Percentual de ocupação em {formatMonthYearPeriod(report.period)}
          </p>
        </div>
      </div>

      <div className="flex flex-col gap-5">
        {rows.map((row) => (
          <RankingRow key={row.key} row={row} mode={mode} />
        ))}
      </div>
    </Card>
  );
}

/** Quantos espaços empatados aparecem antes do botão "Ver mais". */
const VISIBLE_TIES = 3;

function RankingRow({ row, mode }: { row: RowConfig; mode: ReportMode }) {
  if (mode !== "data") {
    return (
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between gap-4">
          <p className={cn("text-sm font-semibold", row.tagClass)}>{row.tag}</p>
          <ReportSkeleton mode={mode} className="h-3 w-32" />
        </div>
        <div className="h-2.5 w-full overflow-hidden rounded-full bg-muted">
          <ReportSkeleton
            mode={mode}
            className="h-full rounded-full bg-muted-foreground/25"
            style={{ width: `${row.previewWidth}%` }}
          />
        </div>
      </div>
    );
  }

  if (row.stats.length === 0) {
    return (
      <div className="flex flex-col gap-2">
        <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
          <p className="min-w-0 truncate text-sm font-semibold">
            <span className="text-muted-foreground">—</span>{" "}
            <span className={cn("text-xs font-medium", row.tagClass)}>({row.tag})</span>
          </p>
          <p className="text-sm text-muted-foreground">{row.emptyText}</p>
        </div>
        <PercentBar value={0} colorClass={row.barClass} label={`${row.tag}: sem dados`} />
      </div>
    );
  }

  // Empate: cada espaço ganha a própria linha e a própria barra (todas com o mesmo percentual).
  return (
    <div className="flex flex-col gap-4">
      <CollapsibleList
        items={row.stats}
        limit={VISIBLE_TIES}
        noun={row.stats.length - VISIBLE_TIES === 1 ? "espaço empatado" : "espaços empatados"}
        renderItem={(stat) => (
          <div key={stat.spaceId} className="flex flex-col gap-2">
            <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
              <p className="min-w-0 truncate text-sm font-semibold" title={stat.name}>
                {stat.name} <span className={cn("text-xs font-medium", row.tagClass)}>({row.tag})</span>
              </p>
              <p className="text-sm text-muted-foreground">{row.valueText(stat)}</p>
            </div>
            <PercentBar value={row.value(stat)} colorClass={row.barClass} label={`${row.tag}: ${stat.name}`} />
          </div>
        )}
      />
    </div>
  );
}
