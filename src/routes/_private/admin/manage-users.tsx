import { createFileRoute, useRouteContext } from "@tanstack/react-router";
import { useState } from "react";
import { useFormDialog } from "#/hooks/use-form-dialog";
import { usePagination } from "#/hooks/use-pagination";
import { type Account, highestRole, useAccountsPage, useEditAccount } from "#/lib/queries/accounts";
import { succeeded } from "#/lib/utils/api-result";
import { DEFAULT_PAGE_LIMIT } from "#/lib/utils/pagination";
import { type ManageEditUserData, ManageEditUserDialog } from "@/components/manage-users/ManageEditUserDialog";
import { ManageUserSearchBar, type UserFilters } from "@/components/manage-users/ManageUserSearchBar";
import { ManageUserTable } from "@/components/manage-users/ManageUserTable";
import { PaginationControls } from "@/components/shared/PaginationControls";
import { QueryBoundary } from "@/components/shared/QueryBoundary";
import { ResultsHeader } from "@/components/shared/ResultsHeader";

export const Route = createFileRoute("/_private/admin/manage-users")({
  component: RouteComponent,
});

const initialFilters: UserFilters = {
  search: "",
  role: undefined,
  subjectId: undefined,
  enabled: undefined,
  limit: DEFAULT_PAGE_LIMIT,
};

function RouteComponent() {
  const [filters, setFilters] = useState<UserFilters>(initialFilters);
  const pagination = usePagination(filters);
  const accounts = useAccountsPage(
    { search: filters.search, role: filters.role, subjectId: filters.subjectId, enabled: filters.enabled },
    pagination,
  );
  const editAccount = useEditAccount();
  const { sessionInfo } = useRouteContext({ from: "__root__" });
  const viewerRole = highestRole(sessionInfo?.roles);

  const editDialog = useFormDialog<Account>();

  async function handleEditSubmit(data: ManageEditUserData) {
    const editing = editDialog.target;
    if (!editing) return;

    // PATCH: campos `null` não são alterados pelo backend, então só enviamos o que mudou.
    const previousSubjectId = editing.subject ? Number(editing.subject.id) : undefined;
    const subjectChanged = data.subject !== undefined && data.subject.id !== previousSubjectId;

    const ok = await succeeded(
      editAccount.mutateAsync({
        id: data.id,
        username: data.username !== editing.username ? data.username : null,
        registration: data.registration !== editing.registration ? data.registration : null,
        role: data.role !== editing.role ? data.role : null,
        lockAccount: data.enabled !== editing.enabled ? !data.enabled : null,
        subjectId: subjectChanged ? (data.subject?.id ?? null) : null,
      }),
    );

    if (ok) editDialog.close();
  }

  return (
    <>
      {editDialog.target && (
        <ManageEditUserDialog
          key={editDialog.session}
          account={editDialog.target}
          viewerRole={viewerRole}
          open={editDialog.isOpen}
          onClose={editDialog.close}
          onSubmit={handleEditSubmit}
        />
      )}

      <section className="container mb-8">
        <ManageUserSearchBar onSearch={setFilters} />
      </section>

      <section className="container">
        <ResultsHeader title="Usuários" count={accounts.items.length} />
        <QueryBoundary
          isPending={accounts.isPending}
          isFetching={accounts.isFetching}
          isError={accounts.isError}
          error={accounts.error}
          isEmpty={accounts.items.length === 0}
          loadingText="Carregando usuários..."
          emptyText="Nenhum usuário encontrado."
        >
          <ManageUserTable accounts={accounts.items} onEdit={editDialog.open} />
        </QueryBoundary>
        <PaginationControls
          page={pagination.page}
          hasNext={accounts.hasNext}
          isFetching={accounts.isFetching}
          onPageChange={pagination.setPage}
        />
      </section>
    </>
  );
}
