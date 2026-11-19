import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useFormDialog } from "#/hooks/use-form-dialog";
import { usePagination } from "#/hooks/use-pagination";
import {
  type UsageEntriesBody,
  type UsageSession,
  useAdminCheckOut,
  useAdminSaveUsageEntries,
  useAdminUsages,
} from "#/lib/queries/usage";
import { succeeded } from "#/lib/utils/api-result";
import { toPaged } from "#/lib/utils/pagination";
import { InfoDialog } from "@/components/shared/InfoDialog";
import { PaginationControls } from "@/components/shared/PaginationControls";
import { QueryBoundary } from "@/components/shared/QueryBoundary";
import { ResultsHeader } from "@/components/shared/ResultsHeader";
import { type CheckOutFilters, ManageCheckOutSearchBar } from "@/components/usage/ManageCheckOutSearchBar";
import { ManageCheckOutTable } from "@/components/usage/ManageCheckOutTable";
import { UsageFormDialog } from "@/components/usage/UsageFormDialog";
import { UsageReportView } from "@/components/usage/UsageReportView";
import { UsageSessionSummary } from "@/components/usage/UsageSessionSummary";
import { sessionTitle } from "@/components/usage/usage-format";

export const Route = createFileRoute("/_private/admin/manage-check-out")({
  component: RouteComponent,
});

type FormTarget = { session: UsageSession; mode: "admin-edit" | "admin-check-out" };

function RouteComponent() {
  // A barra de pesquisa emite os filtros iniciais (hoje, em aberto) na montagem; a query só roda depois disso.
  const [filters, setFilters] = useState<CheckOutFilters | null>(null);
  const pagination = usePagination(filters);
  const usages = useAdminUsages(
    {
      startAt: filters?.startAt ?? "",
      endAt: filters?.endAt ?? "",
      statuses: filters?.statuses,
      spaceIds: filters?.spaceIds,
      accountIds: filters?.accountIds,
      ...pagination.request,
    },
    { enabled: filters !== null },
  );
  const { items, hasNext } = toPaged(usages.data, pagination.limit);

  const viewDialog = useFormDialog<UsageSession>();
  const formDialog = useFormDialog<FormTarget>();
  const saveEntries = useAdminSaveUsageEntries();
  const checkOut = useAdminCheckOut();

  async function handleSubmit(body: UsageEntriesBody) {
    const target = formDialog.target;
    if (!target) return;
    const mutation = target.mode === "admin-check-out" ? checkOut : saveEntries;
    if (await succeeded(mutation.mutateAsync({ usageId: Number(target.session.id), body }))) formDialog.close();
  }

  const formTarget = formDialog.target;

  return (
    <>
      {viewDialog.target && (
        <InfoDialog
          open={viewDialog.isOpen}
          onClose={viewDialog.close}
          title="Relatório de uso"
          description={sessionTitle(viewDialog.target)}
        >
          <div className="flex flex-col gap-3">
            <UsageSessionSummary session={viewDialog.target} showAccount />
            <UsageReportView session={viewDialog.target} />
          </div>
        </InfoDialog>
      )}

      {formTarget && (
        <UsageFormDialog
          key={formDialog.session}
          session={formTarget.session}
          mode={formTarget.mode}
          title={formTarget.mode === "admin-check-out" ? "Fechar check-out" : "Editar relatório"}
          description={
            formTarget.mode === "admin-check-out"
              ? "Confira e registre os notebooks e fontes devolvidos em todos os horários."
              : "Corrija as informações registradas pelo usuário."
          }
          submitLabel={formTarget.mode === "admin-check-out" ? "Encerrar check-out" : "Salvar relatório"}
          open={formDialog.isOpen}
          onClose={formDialog.close}
          onSubmit={handleSubmit}
          showAccount
        />
      )}

      <section className="container mb-8">
        <ManageCheckOutSearchBar onSearch={setFilters} />
      </section>

      <section className="container">
        <ResultsHeader title="Sessões de uso" count={items.length} />
        <QueryBoundary
          isPending={usages.isPending}
          isFetching={usages.isFetching}
          isError={usages.isError}
          error={usages.error}
          isEmpty={items.length === 0}
          loadingText="Carregando sessões..."
          emptyText="Nenhuma sessão de uso encontrada."
        >
          <ManageCheckOutTable
            sessions={items}
            onView={viewDialog.open}
            onEdit={(session) => formDialog.open({ session, mode: "admin-edit" })}
            onCheckOut={(session) => formDialog.open({ session, mode: "admin-check-out" })}
          />
        </QueryBoundary>
        <PaginationControls
          page={pagination.page}
          hasNext={hasNext}
          isFetching={usages.isFetching}
          onPageChange={pagination.setPage}
        />
      </section>
    </>
  );
}
