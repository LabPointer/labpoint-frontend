import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useFormDialog } from "#/hooks/use-form-dialog";
import { usePagination } from "#/hooks/use-pagination";
import { type Subject, useCreateSubject, useDeleteSubject, useEditSubject, useSubjects } from "#/lib/queries/subjects";
import { succeeded } from "#/lib/utils/api-result";
import { DEFAULT_PAGE_LIMIT, toPaged } from "#/lib/utils/pagination";
import { ManageSubjectDialog, type SubjectFormData } from "@/components/manage-subjects/ManageSubjectDialog";
import { ManageSubjectSearchBar, type SubjectFilters } from "@/components/manage-subjects/ManageSubjectSearchBar";
import { ManageSubjectTable, subjectColumns } from "@/components/manage-subjects/ManageSubjectTable";
import { DeleteConfirmDialog } from "@/components/shared/DeleteConfirmDialog";
import { ColumnChooser } from "@/components/shared/data-table/ColumnChooser";
import { useColumnPreferences } from "@/components/shared/data-table/use-column-preferences";
import { PaginationControls } from "@/components/shared/PaginationControls";
import { QueryBoundary } from "@/components/shared/QueryBoundary";
import { ResultsHeader } from "@/components/shared/ResultsHeader";

export const Route = createFileRoute("/_private/admin/manage-subjects")({
  component: RouteComponent,
});

const initialFilters: SubjectFilters = { search: "", status: undefined, limit: DEFAULT_PAGE_LIMIT };

function RouteComponent() {
  const [filters, setFilters] = useState<SubjectFilters>(initialFilters);
  const pagination = usePagination(filters);
  const subjects = useSubjects({ name: filters.search, enabled: filters.status, ...pagination.request });
  const { items, hasNext } = toPaged(subjects.data, pagination.limit);
  const createSubject = useCreateSubject();
  const editSubject = useEditSubject();
  const createDialog = useFormDialog();
  const editDialog = useFormDialog<Subject>();
  const deleteSubject = useDeleteSubject();
  const deleteDialog = useFormDialog<Subject>();
  const columns = useColumnPreferences("manage-subjects", subjectColumns);

  async function handleDelete() {
    const subject = deleteDialog.target;
    if (!subject) return;
    const ok = await succeeded(deleteSubject.mutateAsync({ id: subject.id, confirmName: subject.name }));
    if (ok) deleteDialog.close();
  }

  async function handleCreate(data: SubjectFormData) {
    if (await succeeded(createSubject.mutateAsync(data))) createDialog.close();
  }

  async function handleEdit(data: SubjectFormData) {
    const subject = editDialog.target;
    if (!subject) return;

    const ok = await succeeded(
      editSubject.mutateAsync({
        id: subject.id,
        name: data.name.length > 0 ? data.name : null,
        enabled: data.enabled,
      }),
    );
    if (ok) editDialog.close();
  }

  return (
    <>
      {createDialog.mounted && (
        <ManageSubjectDialog
          key={createDialog.session}
          mode="create"
          open={createDialog.isOpen}
          onClose={createDialog.close}
          onSubmit={handleCreate}
        />
      )}
      {editDialog.target && (
        <ManageSubjectDialog
          key={editDialog.session}
          mode="edit"
          subject={editDialog.target}
          open={editDialog.isOpen}
          onClose={editDialog.close}
          onSubmit={handleEdit}
        />
      )}

      {deleteDialog.target && (
        <DeleteConfirmDialog
          key={deleteDialog.session}
          open={deleteDialog.isOpen}
          entityLabel="matéria"
          itemName={deleteDialog.target.name}
          consequences="Ela deixa de estar vinculada aos usuários e espaços que a usam; as contas e os espaços continuam."
          isPending={deleteSubject.isPending}
          onClose={deleteDialog.close}
          onConfirm={handleDelete}
        />
      )}

      <section className="container mb-8">
        <ManageSubjectSearchBar onSearch={setFilters} onAddNewSubject={() => createDialog.open()} />
      </section>

      <section className="container">
        <ResultsHeader
          title="Matérias"
          count={items.length}
          actions={<ColumnChooser columns={subjectColumns} state={columns} />}
        />
        <QueryBoundary
          isPending={subjects.isPending}
          isFetching={subjects.isFetching}
          isError={subjects.isError}
          error={subjects.error}
          isEmpty={items.length === 0}
          loadingText="Carregando matérias..."
          emptyText="Nenhuma matéria encontrada."
        >
          <ManageSubjectTable
            subjects={items}
            columns={columns.visibleColumns}
            onEdit={editDialog.open}
            onDelete={deleteDialog.open}
          />
        </QueryBoundary>
        <PaginationControls
          page={pagination.page}
          hasNext={hasNext}
          isFetching={subjects.isFetching}
          onPageChange={pagination.setPage}
        />
      </section>
    </>
  );
}
