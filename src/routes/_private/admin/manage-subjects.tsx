import { useQueryClient } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { Suspense, useState } from "react";
import { toast } from "sonner";
import {
  type ManageCreateSubjectData,
  ManageCreateSubjectDialog,
} from "#/components/manage-subjects/ManageCreateSubjectDialog";
import {
  type ManageEditSubjectData,
  ManageEditSubjectDialog,
  type ManageEditSubjectDialogProps,
} from "#/components/manage-subjects/ManageEditSubjectDialog";
import { ManageSubjectSearchBar, type SubjectFilters } from "#/components/manage-subjects/ManageSubjectSearchBar";
import { useApi } from "#/lib/utils/restapi";
import { ErrorBoundary, getErrorMessage } from "react-error-boundary";
import { ManageSubjectTableRow } from "#/components/manage-subjects/ManageSubjectTableRow";

const api = useApi();

export const Route = createFileRoute("/_private/admin/manage-subjects")({
  component: RouteComponent,
});

function RouteComponent() {
  const queryClient = useQueryClient();
  const [isCreateSubjectDialogOpen, setIsCreateSubjectDialogOpen] = useState(false);
  const [isEditSubjectDialogOpen, setIsEditSubjectDialogOpen] = useState(false);
  const [editSubjectProps, setEditSubjectProps] = useState<ManageEditSubjectDialogProps>({
    data: {
      id: 0,
      name: "",
      enabled: false,
    },
    isOpen: isEditSubjectDialogOpen,
    onSubmit: handleEditSubmit,
    onClose: () => setIsEditSubjectDialogOpen(false),
  });
  const [searchFilter, setSearchFilter] = useState<SubjectFilters>({
    search: "",
    enabled: undefined,
  });

  async function handleCreateSubmit(data: ManageCreateSubjectData) {
    const res = await api.POST("/subject/admin/create", {
      body: {
        name: data.name,
        enabled: data.enabled,
      },
    });

    const { response, error } = res;

    if (!response.ok && error) {
      toast.error(`Error ${response.status}: ${error.message}`, {
        duration: 3000,
        position: "bottom-center",
        style: {
          color: "white",
          backgroundColor: "red",
          borderColor: "red",
        },
      });
      return;
    }

    toast.success("Matéria criada com sucesso!", {
      duration: 3000,
      position: "bottom-center",
      style: {
        color: "white",
        backgroundColor: "green",
        borderColor: "green",
      },
    });
    setIsCreateSubjectDialogOpen(false);
    queryClient.invalidateQueries({ queryKey: ["subject-data"] });
  }

  async function handleEditSubmit(data: ManageEditSubjectData) {
    const res = await api.PATCH("/subject/admin/edit", {
      body: {
        id: data.id,
        name: data.name.length > 0 ? data.name : null,
        enabled: data.enabled,
      },
    });

    const { response, error } = res;

    if (!response.ok && error) {
      toast.error(`Error ${response.status}: ${error.message}`, {
        duration: 3000,
        position: "bottom-center",
        style: {
          color: "white",
          backgroundColor: "red",
          borderColor: "red",
        },
      });
      return;
    }

    toast.success("Matéria editada com sucesso!", {
      duration: 3000,
      position: "bottom-center",
      style: {
        color: "white",
        backgroundColor: "green",
        borderColor: "green",
      },
    });
    setIsEditSubjectDialogOpen(false);
    queryClient.invalidateQueries({ queryKey: ["subject-data"] });
  }

  return (
    <>
      <ManageCreateSubjectDialog
        isOpen={isCreateSubjectDialogOpen}
        onClose={() => setIsCreateSubjectDialogOpen(false)}
        onSubmit={handleCreateSubmit}
      />
      <ManageEditSubjectDialog
        data={editSubjectProps.data}
        isOpen={isEditSubjectDialogOpen}
        onClose={() => setIsEditSubjectDialogOpen(false)}
        onSubmit={(data) => handleEditSubmit(data)}
      />

      <section className="container mb-8">
        <ManageSubjectSearchBar
          onSearch={(filters) => {
            setSearchFilter(filters);
            queryClient.invalidateQueries({ queryKey: ["subject-data"] });
          }}
          onAddNewSubject={() => setIsCreateSubjectDialogOpen(true)}
        />
      </section>

      <section className="container">
        <ErrorBoundary
          resetKeys={[searchFilter]}
          fallbackRender={({ error }) => (
            <div className="flex flex-col items-center justify-center gap-2">
              <p className="text-center font-bold text-red-600 dark:text-red-400">Erro: {getErrorMessage(error)}</p>
            </div>
          )}
        >
          <Suspense fallback={<div className="text-center font-bold animate-pulse">Carregando matérias...</div>}>
            <ManageSubjectTableRow
              props={searchFilter}
              onEdit={(data) => {
                setEditSubjectProps({
                  data,
                  isOpen: false,
                  onSubmit: handleEditSubmit,
                  onClose: () => setIsEditSubjectDialogOpen(false),
                });

                setIsEditSubjectDialogOpen(true);
              }}
            />
          </Suspense>
        </ErrorBoundary>
      </section>
    </>
  );
}
