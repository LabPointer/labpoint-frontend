import { formatPercent, pluralize, type ReportData } from "#/lib/utils/report";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { type ReportMode, ReportSkeleton, reportCardClass } from "./report-ui";

type ReportSummaryCardsProps = { report: ReportData; mode: ReportMode };

export function ReportSummaryCards({ report, mode }: ReportSummaryCardsProps) {
  const { summary } = report;
  const hasData = mode === "data";
  const disputed = summary.mostDisputedSpace;

  return (
    <div className="grid gap-4 md:grid-cols-3">
      <SummaryCard label="Taxa de ocupação média" mode={mode}>
        {hasData && summary.averageOccupancyRate !== null ? (
          <>
            <Value>{formatPercent(summary.averageOccupancyRate)}</Value>
            <Caption>Horários reservados sobre a capacidade dos espaços</Caption>
          </>
        ) : (
          <ValueSkeleton mode={mode} />
        )}
      </SummaryCard>

      <SummaryCard label="Taxa de ociosidade / no-show" mode={mode}>
        {hasData && summary.idleRate !== null ? (
          <>
            <Value className="text-destructive">{formatPercent(summary.idleRate)}</Value>
            <Caption>
              {pluralize(summary.absentReserves, "reserva ausente", "reservas ausentes")} de {summary.totalReserves}
            </Caption>
          </>
        ) : (
          <ValueSkeleton mode={mode} />
        )}
      </SummaryCard>

      <SummaryCard label="Laboratório mais disputado" mode={mode}>
        {hasData && disputed ? (
          <>
            <Value className="truncate text-violet-600 dark:text-violet-400" title={disputed.name}>
              {disputed.name}
            </Value>
            <Caption>{formatPercent(disputed.occupancyRate)} de ocupação</Caption>
          </>
        ) : hasData ? (
          <>
            <Value className="text-muted-foreground">—</Value>
            <Caption>Nenhum espaço com reservas no mês</Caption>
          </>
        ) : (
          <ValueSkeleton mode={mode} />
        )}
      </SummaryCard>
    </div>
  );
}

function SummaryCard({ label, mode, children }: { label: string; mode: ReportMode; children: React.ReactNode }) {
  return (
    <Card className={cn(reportCardClass(mode), "min-w-0 gap-1")}>
      <p className="text-sm text-muted-foreground">{label}</p>
      {children}
    </Card>
  );
}

function Value({ className, children, title }: { className?: string; children: React.ReactNode; title?: string }) {
  return (
    <p title={title} className={cn("text-3xl font-bold leading-tight text-foreground", className)}>
      {children}
    </p>
  );
}

const Caption = ({ children }: { children: React.ReactNode }) => (
  <p className="text-xs text-muted-foreground">{children}</p>
);

function ValueSkeleton({ mode }: { mode: ReportMode }) {
  return (
    <div className="flex flex-col gap-2 py-1" aria-hidden="true">
      <ReportSkeleton mode={mode} className="h-8 w-28" />
      <ReportSkeleton mode={mode} className="h-3 w-40" />
    </div>
  );
}
