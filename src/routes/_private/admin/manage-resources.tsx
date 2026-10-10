import { QueryErrorResetBoundary, useQueryClient } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { Suspense, useState } from "react";
import { ErrorBoundary, getErrorMessage } from "react-error-boundary";
import { toast } from "sonner";
import {
  type ManageCreateResourceData,
  ManageCreateResourceDialog,
} from "#/components/manage-resources/ManageCreateResourceDialog";
import {
  type ManageEditResourceData,
  ManageEditResourceDialog,
  type ManageEditResourceDialogProps,
} from "#/components/manage-resources/ManageEditResourceDialog";
import { ManageResourceSearchBar, type ResourceFilters } from "#/components/manage-resources/ManageResourceSearchBar";
import { ManageResourceTableRow } from "#/components/manage-resources/ManageResourceTableRow";
import { useApi } from "#/lib/utils/restapi";

export const Route = createFileRoute("/_private/admin/manage-resources")({
  component: RouteComponent,
});

function RouteComponent() {
  const api = useApi();
  const queryClient = useQueryClient();
  const [isCreateResourceDialogOpen, setIsCreateResourceDialogOpen] = useState(false);
  const [isEditResourceDialogOpen, setIsEditResourceDialogOpen] = useState(false);
  const [editResourceProps, setEditResourceProps] = useState<ManageEditResourceDialogProps>({
    data: {
      id: 0,
      name: "",
      canReserve: false,
      enabled: false,
    },
    isOpen: isEditResourceDialogOpen,
    onSubmit: handleEditSubmit,
    onClose: () => setIsEditResourceDialogOpen(false),
  });
  const [searchFilter, setSearchFilter] = useState<ResourceFilters>({
    search: "",
    canReserve: undefined,
    enabled: undefined,
  });

  function handleFilters(filters: ResourceFilters) {
    setSearchFilter(filters);
  }

  function handleCreateResourceDialog() {
    setIsCreateResourceDialogOpen(true);
  }

  function handleEditResourceDialog(data: ManageEditResourceData) {
    setEditResourceProps({
      data: {
        id: data.id,
        name: data.name,
        canReserve: data.canReserve,
        enabled: data.enabled,
      },
      isOpen: isEditResourceDialogOpen,
      onSubmit: handleEditSubmit,
      onClose: () => setIsEditResourceDialogOpen(false),
    });
    setIsEditResourceDialogOpen(true);
  }

  async function handleCreateSubmit(data: ManageCreateResourceData) {
    const res = await api.POST("/resource/admin/create", {
      body: {
        name: data.name,
        canReserve: data.canBeReserved,
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

    toast.success("Recurso criado com sucesso!", {
      duration: 3000,
      position: "bottom-center",
      style: {
        color: "white",
        backgroundColor: "green",
        borderColor: "green",
      },
    });
    setIsCreateResourceDialogOpen(false);
    queryClient.invalidateQueries({ queryKey: ["resource-data"] });
  }

  async function handleEditSubmit(data: ManageEditResourceData) {
    const res = await api.PATCH("/resource/admin/edit", {
      body: {
        id: data.id,
        name: data.name.length > 0 ? data.name : null,
        canReserve: data.canReserve,
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

    toast.success("Recurso editado com sucesso!", {
      duration: 3000,
      position: "bottom-center",
      style: {
        color: "white",
        backgroundColor: "green",
        borderColor: "green",
      },
    });
    setIsEditResourceDialogOpen(false);
    
    queryClient.invalidateQueries({ queryKey: ["resource-data"] });
  }

  return (
    <>
      <ManageCreateResourceDialog
        isOpen={isCreateResourceDialogOpen}
        onClose={() => setIsCreateResourceDialogOpen(false)}
        onSubmit={handleCreateSubmit}
      />
      <ManageEditResourceDialog
        data={editResourceProps.data}
        isOpen={isEditResourceDialogOpen}
        onClose={() => setIsEditResourceDialogOpen(false)}
        onSubmit={handleEditSubmit}
      />

      <section className="container mb-8">
        <ManageResourceSearchBar onSearch={handleFilters} onAddNewResource={handleCreateResourceDialog} />
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
          <Suspense fallback={<div className="text-center font-bold animate-pulse">Carregando recursos...</div>}>
            <ManageResourceTableRow
              props={searchFilter}
              onEdit={(data) =>
                handleEditResourceDialog({
                  id: data.id,
                  name: data.name,
                  canReserve: data.canReserve,
                  enabled: data.enabled,
                })
              }
            />
          </Suspense>
        </ErrorBoundary>
      </section>
    </>
  );
}
