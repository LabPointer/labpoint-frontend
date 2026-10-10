import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useFormDialog } from "#/hooks/use-form-dialog";
import { type Subject, useCreateSubject, useEditSubject, useSubjects } from "#/lib/queries/subjects";
import { succeeded } from "#/lib/utils/api-result";
import { ManageSubjectDialog, type SubjectFormData } from "@/components/manage-subjects/ManageSubjectDialog";
import { ManageSubjectSearchBar, type SubjectFilters } from "@/components/manage-subjects/ManageSubjectSearchBar";
import { ManageSubjectTable } from "@/components/manage-subjects/ManageSubjectTable";
import { QueryBoundary } from "@/components/shared/QueryBoundary";
import { ResultsHeader } from "@/components/shared/ResultsHeader";

export const Route = createFileRoute("/_private/admin/manage-subjects")({
  component: RouteComponent,
});

const initialFilters: SubjectFilters = { search: "", status: undefined };

function RouteComponent() {
  const [filters, setFilters] = useState<SubjectFilters>(initialFilters);
  const subjects = useSubjects({ name: filters.search, enabled: filters.status });
  const createSubject = useCreateSubject();
  const editSubject = useEditSubject();
  const createDialog = useFormDialog();
  const editDialog = useFormDialog<Subject>();

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

      <section className="container mb-8">
        <ManageSubjectSearchBar onSearch={setFilters} onAddNewSubject={() => createDialog.open()} />
      </section>

      <section className="container">
        <ResultsHeader title="Matérias" count={subjects.data?.length ?? 0} />
        <QueryBoundary
          isPending={subjects.isPending}
          isFetching={subjects.isFetching}
          isError={subjects.isError}
          error={subjects.error}
          isEmpty={subjects.data?.length === 0}
          loadingText="Carregando matérias..."
          emptyText="Nenhuma matéria encontrada."
        >
          <ManageSubjectTable subjects={subjects.data ?? []} onEdit={editDialog.open} />
        </QueryBoundary>
      </section>
    </>
  );
}
