import { createFileRoute } from "@tanstack/react-router";
import { useRefreshResourceReport, useResourceReport } from "#/lib/queries/report";
import { ReportPage } from "@/components/report/ReportPage";

export const Route = createFileRoute("/_private/admin/resource-report")({
  component: RouteComponent,
});

/** Relatório de recursos: utilização e ociosidade dos recursos reserváveis. */
function RouteComponent() {
  return <ReportPage kind="resources" useReportQuery={useResourceReport} useRefresh={useRefreshResourceReport} />;
}
