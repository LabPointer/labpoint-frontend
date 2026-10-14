import { TableIcon } from "lucide-react";
import { useMemo } from "react";
import { usePagination } from "#/hooks/use-pagination";
import { paginateLocal } from "#/lib/utils/pagination";
import { formatReportDate, pluralize, type ReportData, type ReportReserveStatus } from "#/lib/utils/report";
import { PaginationControls } from "@/components/shared/PaginationControls";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { type ReportMode, ReportSkeleton, reportCardClass, SectionIcon } from "./report-ui";

const PAGE_SIZE = 10;
const PREVIEW_ROWS = 5;

/** Larguras diferentes por linha/coluna para o esqueleto parecer uma tabela de verdade. */
const previewWidths = ["w-24", "w-32", "w-20", "w-20", "w-16"];

const statusLabels: Record<ReportReserveStatus, string> = { CONFIRMED: "Confirmada", ABSENT: "Ausente" };
const statusClasses: Record<ReportReserveStatus, string> = {
  CONFIRMED: "border-emerald-500/30 bg-emerald-500/20 text-emerald-600 dark:text-emerald-400",
  ABSENT: "border-rose-500/30 bg-rose-500/20 text-rose-600 dark:text-rose-400",
};

type ReportReservesTableProps = { report: ReportData; mode: ReportMode };

export function ReportReservesTable({ report, mode }: ReportReservesTableProps) {
  // A paginação só existe na tela (o PDF leva todas as linhas). Volta à página 1 a cada mês novo.
  const { month, year } = report.period;
  const filters = useMemo(() => ({ limit: PAGE_SIZE, month, year }), [month, year]);
  const pagination = usePagination(filters);
  const { items, hasNext } = paginateLocal(report.reserves, pagination);
  const hasData = mode === "data";

  return (
    <Card className={cn(reportCardClass(mode), "gap-4 px-0")}>
      <div className="flex flex-wrap items-center justify-between gap-3 px-4">
        <div className="flex items-center gap-3">
          <SectionIcon>
            <TableIcon className="size-5" />
          </SectionIcon>
          <div>
            <h2 className="text-lg font-bold leading-tight">Reservas do mês</h2>
            <p className="text-sm text-muted-foreground">Confirmadas e ausentes, sem canceladas nem bloqueios.</p>
          </div>
        </div>
        {hasData && (
          <span className="text-sm font-bold">{pluralize(report.reserves.length, "reserva", "reservas")}</span>
        )}
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="pl-4">Sala</TableHead>
            <TableHead>Usuário</TableHead>
            <TableHead className="text-center">Início</TableHead>
            <TableHead className="text-center">Fim</TableHead>
            <TableHead className="pr-4 text-center">Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {hasData
            ? items.map((reserve) => (
                <TableRow key={reserve.id}>
                  <TableCell className="pl-4 font-medium">{reserve.spaceName}</TableCell>
                  <TableCell>{reserve.userName}</TableCell>
                  <TableCell className="text-center">{formatReportDate(reserve.dateFrom)}</TableCell>
                  <TableCell className="text-center">{formatReportDate(reserve.dateTo)}</TableCell>
                  <TableCell className="pr-4 text-center">
                    <Badge
                      variant="outline"
                      className={cn("rounded-full px-3 py-0.5 text-xs font-medium", statusClasses[reserve.status])}
                    >
                      {statusLabels[reserve.status]}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))
            : Array.from({ length: PREVIEW_ROWS }, (_, row) => (
                <TableRow key={row} aria-hidden="true">
                  {previewWidths.map((width, column) => (
                    <TableCell
                      key={column}
                      className={cn(column === 0 && "pl-4", column === 4 && "pr-4", column >= 2 && "text-center")}
                    >
                      <ReportSkeleton
                        mode={mode}
                        className={cn("h-4", width, column >= 2 && "mx-auto", column === 4 && "h-5 rounded-full")}
                      />
                    </TableCell>
                  ))}
                </TableRow>
              ))}
        </TableBody>
      </Table>

      {hasData && (
        <div className="px-4">
          <PaginationControls page={pagination.page} hasNext={hasNext} onPageChange={pagination.setPage} />
        </div>
      )}
    </Card>
  );
}
