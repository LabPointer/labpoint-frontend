import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useFormDialog } from "#/hooks/use-form-dialog";
import { type Space, useCreateSpace, useEditSpace, useSpaces } from "#/lib/queries/spaces";
import { succeeded } from "#/lib/utils/api-result";
import { ManageSpaceDialog, type SpaceFormData } from "@/components/manage-spaces/ManageSpaceDialog";
import { ManageSpaceSearchBar, type SpaceFilters } from "@/components/manage-spaces/ManageSpaceSearchBar";
import { ManageSpaceTable } from "@/components/manage-spaces/ManageSpaceTable";
import { QueryBoundary } from "@/components/shared/QueryBoundary";

export const Route = createFileRoute("/_private/admin/manage-spaces")({
  component: RouteComponent,
});

const initialFilters: SpaceFilters = { search: "", subjectIds: [], resourceIds: [], locked: undefined };

const toOption = ({ id, name }: { id: number | string; name: string }) => ({ id: Number(id), name });

function RouteComponent() {
  const [filters, setFilters] = useState<SpaceFilters>(initialFilters);
  // startAt, endAt e schedules ficam `undefined`: na administração listamos todos os espaços.
  const spaces = useSpaces({
    search: filters.search,
    subjects: filters.subjectIds,
    resources: filters.resourceIds,
    locked: filters.locked,
  });
  const createSpace = useCreateSpace();
  const editSpace = useEditSpace();
  const createDialog = useFormDialog();
  const editDialog = useFormDialog<Space>();

  const summary = useMemo(() => {
    const list = spaces.data ?? [];
    const inactive = list.filter((space) => space.locked).length;
    return { total: list.length, inactive, active: list.length - inactive };
  }, [spaces.data]);

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
          {summary.total} espaço(s) encontrado(s) · {summary.active} ativo(s) · {summary.inactive} inativo(s)
        </h2>
        <QueryBoundary
          isPending={spaces.isPending}
          isFetching={spaces.isFetching}
          isError={spaces.isError}
          error={spaces.error}
          isEmpty={spaces.data?.length === 0}
          loadingText="Carregando espaços..."
          emptyText="Nenhum espaço encontrado."
        >
          <ManageSpaceTable spaces={spaces.data ?? []} onEdit={editDialog.open} />
        </QueryBoundary>
      </section>
    </>
  );
}
