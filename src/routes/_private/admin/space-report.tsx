import { createFileRoute } from "@tanstack/react-router";
import { useRefreshReport, useReport } from "#/lib/queries/report";
import { ReportPage } from "@/components/report/ReportPage";

export const Route = createFileRoute("/_private/admin/space-report")({
  component: RouteComponent,
});

/** Relatório de salas: ocupação e ociosidade dos espaços. */
function RouteComponent() {
  return <ReportPage kind="spaces" useReportQuery={useReport} useRefresh={useRefreshReport} />;
}
