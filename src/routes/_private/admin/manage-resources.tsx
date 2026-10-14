import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useFormDialog } from "#/hooks/use-form-dialog";
import { usePagination } from "#/hooks/use-pagination";
import { type Resource, useCreateResource, useEditResource, useResources } from "#/lib/queries/resources";
import { succeeded } from "#/lib/utils/api-result";
import { DEFAULT_PAGE_LIMIT, toPaged } from "#/lib/utils/pagination";
import { ManageResourceDialog, type ResourceFormData } from "@/components/manage-resources/ManageResourceDialog";
import { ManageResourceSearchBar, type ResourceFilters } from "@/components/manage-resources/ManageResourceSearchBar";
import { ManageResourceTable } from "@/components/manage-resources/ManageResourceTable";
import { PaginationControls } from "@/components/shared/PaginationControls";
import { QueryBoundary } from "@/components/shared/QueryBoundary";
import { ResultsHeader } from "@/components/shared/ResultsHeader";

export const Route = createFileRoute("/_private/admin/manage-resources")({
  component: RouteComponent,
});

const initialFilters: ResourceFilters = {
  search: "",
  enabled: undefined,
  limit: DEFAULT_PAGE_LIMIT,
};

function RouteComponent() {
  const [filters, setFilters] = useState<ResourceFilters>(initialFilters);
  const pagination = usePagination(filters);
  const resources = useResources({
    name: filters.search,
    enabled: filters.enabled,
    ...pagination.request,
  });
  const { items, hasNext } = toPaged(resources.data, pagination.limit);
  const createResource = useCreateResource();
  const editResource = useEditResource();
  const createDialog = useFormDialog();
  const editDialog = useFormDialog<Resource>();

  async function handleCreate(data: ResourceFormData) {
    if (await succeeded(createResource.mutateAsync(data))) createDialog.close();
  }

  async function handleEdit(data: ResourceFormData) {
    const resource = editDialog.target;
    if (!resource) return;

    const ok = await succeeded(
      editResource.mutateAsync({
        id: resource.id,
        name: data.name.length > 0 ? data.name : null,
        enabled: data.enabled,
      }),
    );
    if (ok) editDialog.close();
  }

  return (
    <>
      {createDialog.mounted && (
        <ManageResourceDialog
          key={createDialog.session}
          mode="create"
          open={createDialog.isOpen}
          onClose={createDialog.close}
          onSubmit={handleCreate}
        />
      )}
      {editDialog.target && (
        <ManageResourceDialog
          key={editDialog.session}
          mode="edit"
          resource={editDialog.target}
          open={editDialog.isOpen}
          onClose={editDialog.close}
          onSubmit={handleEdit}
        />
      )}

      <section className="container mb-8">
        <ManageResourceSearchBar onSearch={setFilters} onAddNewResource={() => createDialog.open()} />
      </section>

      <section className="container">
        <ResultsHeader title="Recursos" count={items.length} />
        <QueryBoundary
          isPending={resources.isPending}
          isFetching={resources.isFetching}
          isError={resources.isError}
          error={resources.error}
          isEmpty={items.length === 0}
          loadingText="Carregando recursos..."
          emptyText="Nenhum recurso encontrado."
        >
          <ManageResourceTable resources={items} onEdit={editDialog.open} />
        </QueryBoundary>
        <PaginationControls
          page={pagination.page}
          hasNext={hasNext}
          isFetching={resources.isFetching}
          onPageChange={pagination.setPage}
        />
      </section>
    </>
  );
}
