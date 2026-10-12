import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useFormDialog } from "#/hooks/use-form-dialog";
import { usePagination } from "#/hooks/use-pagination";
import { type Space, useCreateSpace, useEditSpace, useSpaces } from "#/lib/queries/spaces";
import { succeeded } from "#/lib/utils/api-result";
import { DEFAULT_PAGE_LIMIT, toPaged } from "#/lib/utils/pagination";
import { ManageSpaceDialog, type SpaceFormData } from "@/components/manage-spaces/ManageSpaceDialog";
import { ManageSpaceSearchBar, type SpaceFilters } from "@/components/manage-spaces/ManageSpaceSearchBar";
import { ManageSpaceTable } from "@/components/manage-spaces/ManageSpaceTable";
import { PaginationControls } from "@/components/shared/PaginationControls";
import { QueryBoundary } from "@/components/shared/QueryBoundary";

export const Route = createFileRoute("/_private/admin/manage-spaces")({
  component: RouteComponent,
});

const initialFilters: SpaceFilters = {
  search: "",
  subjectIds: [],
  resourceIds: [],
  locked: undefined,
  limit: DEFAULT_PAGE_LIMIT,
};

const toOption = ({ id, name }: { id: number | string; name: string }) => ({ id: Number(id), name });

function RouteComponent() {
  const [filters, setFilters] = useState<SpaceFilters>(initialFilters);
  const pagination = usePagination(filters);
  // startAt, endAt e schedules ficam `undefined`: na administração listamos todos os espaços.
  const spaces = useSpaces({
    search: filters.search,
    subjects: filters.subjectIds,
    resources: filters.resourceIds,
    locked: filters.locked,
    ...pagination.request,
  });
  const { items, hasNext } = toPaged(spaces.data, pagination.limit);
  const createSpace = useCreateSpace();
  const editSpace = useEditSpace();
  const createDialog = useFormDialog();
  const editDialog = useFormDialog<Space>();

  // contagens da página exibida
  const inactive = items.filter((space) => space.locked).length;
  const summary = { total: items.length, inactive, active: items.length - inactive };

  async function handleCreate(data: SpaceFormData) {
    const ok = await succeeded(
      createSpace.mutateAsync({
        name: data.name,
        description: data.description.trim(),
        capacity: data.capacity,
        locked: !data.enabled,
        subjects: data.subjects.map((subject) => subject.id),
        resources: data.resources.map((resource) => resource.id),
      }),
    );
    if (ok) createDialog.close();
  }

  async function handleEdit(data: SpaceFormData) {
    const space = editDialog.target;
    if (!space) return;

    const ok = await succeeded(
      editSpace.mutateAsync({
        id: space.id,
        name: data.name,
        description: data.description.trim(),
        capacity: data.capacity,
        locked: !data.enabled,
        subjects: data.subjects.map((subject) => subject.id),
        resources: data.resources.map((resource) => resource.id),
      }),
    );
    if (ok) editDialog.close();
  }

  const editingSpace = editDialog.target;

  return (
    <>
      {createDialog.mounted && (
        <ManageSpaceDialog
          key={createDialog.session}
          mode="create"
          open={createDialog.isOpen}
          onClose={createDialog.close}
          onSubmit={handleCreate}
        />
      )}
      {editingSpace && (
        <ManageSpaceDialog
          key={editDialog.session}
          mode="edit"
          space={{
            name: editingSpace.name,
            description: editingSpace.description,
            capacity: Number(editingSpace.capacity),
            enabled: !editingSpace.locked,
            subjects: editingSpace.subjects.map(toOption),
            resources: editingSpace.resources.map(toOption),
          }}
          open={editDialog.isOpen}
          onClose={editDialog.close}
          onSubmit={handleEdit}
        />
      )}

      <section className="container mb-8">
        <ManageSpaceSearchBar onSearch={setFilters} onAddNewSpace={() => createDialog.open()} />
      </section>

      <section className="container flex flex-col gap-8">
        <h2 className="text-sm font-bold">
          {summary.total} espaço(s) exibido(s) · {summary.active} ativo(s) · {summary.inactive} inativo(s)
        </h2>
        <QueryBoundary
          isPending={spaces.isPending}
          isFetching={spaces.isFetching}
          isError={spaces.isError}
          error={spaces.error}
          isEmpty={items.length === 0}
          loadingText="Carregando espaços..."
          emptyText="Nenhum espaço encontrado."
        >
          <ManageSpaceTable spaces={items} onEdit={editDialog.open} />
        </QueryBoundary>
        <PaginationControls
          page={pagination.page}
          hasNext={hasNext}
          isFetching={spaces.isFetching}
          onPageChange={pagination.setPage}
        />
      </section>
    </>
  );
}
