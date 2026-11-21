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
/** Relatório de recursos: + Quantidade e Sala. */
const resourcePreviewWidths = ["w-24", "w-10", "w-24", "w-32", "w-20", "w-20", "w-16"];

const statusLabels: Record<ReportReserveStatus, string> = { CONFIRMED: "Confirmada", ABSENT: "Ausente" };
const statusClasses: Record<ReportReserveStatus, string> = {
  CONFIRMED: "border-emerald-500/30 bg-emerald-500/20 text-emerald-600 dark:text-emerald-400",
  ABSENT: "border-rose-500/30 bg-rose-500/20 text-rose-600 dark:text-rose-400",
};

type ReportReservesTableProps = { report: ReportData; mode: ReportMode };

export function ReportReservesTable({ report, mode }: ReportReservesTableProps) {
  // A paginação só existe na tela (o PDF leva todas as linhas). Volta à página 1 a cada período novo.
  const { from, to } = report.period;
  const filters = useMemo(
    () => ({ limit: PAGE_SIZE, fromMonth: from.month, fromYear: from.year, toMonth: to.month, toYear: to.year }),
    [from.month, from.year, to.month, to.year],
  );
  const pagination = usePagination(filters);
  const { items, hasNext } = paginateLocal(report.reserves, pagination);
  const hasData = mode === "data";
  const isResources = report.kind === "resources";
  const widths = isResources ? resourcePreviewWidths : previewWidths;
  const lastColumn = widths.length - 1;
  // colunas centralizadas: datas e status (e a quantidade, no relatório de recursos)
  const centered = (column: number) => column >= lastColumn - 2 || (isResources && column === 1);

  return (
    <Card className={cn(reportCardClass(mode), "@container/report gap-4 px-0")}>
      <div className="flex flex-wrap items-center justify-between gap-3 px-4">
        <div className="flex items-center gap-3">
          <SectionIcon>
            <TableIcon className="size-5" />
          </SectionIcon>
          <div>
            <h2 className="text-lg font-bold leading-tight">Reservas do período</h2>
            <p className="text-sm text-muted-foreground">Confirmadas e ausentes, sem canceladas nem bloqueios.</p>
          </div>
        </div>
        {hasData && (
          <span className="text-sm font-bold">{pluralize(report.reserves.length, "reserva", "reservas")}</span>
        )}
      </div>

      {/* Espaço estreito (celular, tablet com a barra lateral aberta): uma reserva por cartão, sem rolar para os lados. */}
      <ul aria-label="Reservas do período" className="flex flex-col gap-3 px-4 @2xl/report:hidden">
        {hasData
          ? items.map((reserve) => (
              <li
                key={reserve.id}
                className="flex flex-col gap-2 rounded-md border p-3 text-sm dark:border-violet-500/10"
              >
                <div className="flex items-start justify-between gap-2">
                  <span className="min-w-0 font-bold wrap-break-word">{reserve.spaceName}</span>
                  <Badge
                    variant="outline"
                    className={cn(
                      "shrink-0 rounded-full px-3 py-0.5 text-xs font-medium",
                      statusClasses[reserve.status],
                    )}
                  >
                    {statusLabels[reserve.status]}
                  </Badge>
                </div>
                <dl className="flex flex-col gap-1">
                  {isResources && (
                    <CardDetail label="Qtd. / sala">
                      {reserve.quantity} · {reserve.linkedSpaceName ?? "Avulsa"}
                    </CardDetail>
                  )}
                  <CardDetail label="Usuário">{reserve.userName}</CardDetail>
                  <CardDetail label="Período">
                    {formatReportDate(reserve.dateFrom)} a {formatReportDate(reserve.dateTo)}
                  </CardDetail>
                </dl>
              </li>
            ))
          : Array.from({ length: 3 }, (_, row) => (
              <li key={row} aria-hidden="true" className="flex flex-col gap-2 rounded-md border p-3">
                <ReportSkeleton mode={mode} className="h-4 w-32" />
                <ReportSkeleton mode={mode} className="h-3 w-40" />
                <ReportSkeleton mode={mode} className="h-3 w-24" />
              </li>
            ))}
      </ul>

      <div className="hidden @2xl/report:block">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="pl-4">{report.copy.entityColumn}</TableHead>
              {isResources && <TableHead className="text-center">Qtd.</TableHead>}
              {isResources && <TableHead>Sala</TableHead>}
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
                    {isResources && <TableCell className="text-center tabular-nums">{reserve.quantity}</TableCell>}
                    {isResources && (
                      <TableCell className={reserve.linkedSpaceName ? undefined : "text-muted-foreground"}>
                        {reserve.linkedSpaceName ?? "Avulsa"}
                      </TableCell>
                    )}
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
                    {widths.map((width, column) => (
                      <TableCell
                        key={column}
                        className={cn(
                          column === 0 && "pl-4",
                          column === lastColumn && "pr-4",
                          centered(column) && "text-center",
                        )}
                      >
                        <ReportSkeleton
                          mode={mode}
                          className={cn(
                            "h-4",
                            width,
                            centered(column) && "mx-auto",
                            column === lastColumn && "h-5 rounded-full",
                          )}
                        />
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
          </TableBody>
        </Table>
      </div>

      {hasData && (
        <div className="px-4">
          <PaginationControls page={pagination.page} hasNext={hasNext} onPageChange={pagination.setPage} />
        </div>
      )}
    </Card>
  );
}

function CardDetail({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex min-w-0 justify-between gap-3">
      <dt className="shrink-0 text-muted-foreground">{label}</dt>
      <dd className="min-w-0 text-right wrap-break-word">{children}</dd>
    </div>
  );
}
