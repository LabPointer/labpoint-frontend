import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
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
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "#/components/ui/table";
import { ApiError } from "#/lib/types/error-types";
import { useApi } from "#/lib/utils/restapi";
import { Badge } from "#/components/ui/badge";
import { Button } from "#/components/ui/button";
import { Pencil } from "lucide-react";

const api = useApi();

function resourceQuery(search: string, canReserve: boolean | undefined, enabled: boolean | undefined) {
  const query = useQuery({
    queryKey: ["resource-data", search, canReserve, enabled],
    queryFn: async () => {
      const res = await api.GET("/resource", {
        params: {
          query: {
            SearchQuery: search,
            CanReserve: canReserve,
            Enabled: enabled,
            limit: 30,
            offset: 0,
          },
        },
      });

      const { response, data, error } = res;

      if (!response.ok && error) {
        throw new ApiError(error.message, response.status, error.logout);
      }

      if (!data) {
        throw new ApiError("Nenhum recurso encontrado.", response.status, error?.logout ?? false);
      }

      return data;
    },
  });

  return query;
}

export const Route = createFileRoute("/_private/admin/manage-resources")({
  component: RouteComponent,
});

function RouteComponent() {
  const [isCreateResourceDialogOpen, setIsCreateResourceDialogOpen] = useState(false);
  const [isEditResourceDialogOpen, setIsEditResourceDialogOpen] = useState(false);
  const [editResourceProps, setEditResourceProps] = useState<ManageEditResourceDialogProps>({
    data: {
      id: 0,
      name: "",
      canBeReserved: false,
      enabled: false,
    },
    isOpen: isEditResourceDialogOpen,
    onSubmit: handleEdit,
    onClose: () => setIsEditResourceDialogOpen(false),
  });
  const [searchFilter, setSearchFilter] = useState<ResourceFilters>();
  const {
    data: resourceData,
    isLoading: isResourceLoading,
    isError: isResourceError,
    error: resourceError,
    isFetching,
    refetch,
  } = resourceQuery(searchFilter?.search || "", searchFilter?.canBeReserved, searchFilter?.status);

  function handleSearch(filters: ResourceFilters) {
    setSearchFilter(filters);
  }

  function handleCreateResource() {
    setIsCreateResourceDialogOpen(true);
  }

  function handleEditResource(data: ManageEditResourceData) {
    setEditResourceProps({
      data: {
        id: data.id,
        name: data.name,
        canBeReserved: data.canBeReserved,
        enabled: data.enabled,
      },
      isOpen: isEditResourceDialogOpen,
      onSubmit: handleEdit,
      onClose: () => setIsEditResourceDialogOpen(false),
    });
    setIsEditResourceDialogOpen(true);
  }

  async function handleSubmit(data: ManageCreateResourceData) {
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
    refetch();
  }

  async function handleEdit(data: ManageEditResourceData) {
    const res = await api.PATCH("/resource/admin/edit", {
      body: {
        id: data.id,
        name: data.name.length > 0 ? data.name : null,
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
    refetch();
  }

  return (
    <>
      <ManageCreateResourceDialog
        isOpen={isCreateResourceDialogOpen}
        onClose={() => setIsCreateResourceDialogOpen(false)}
        onSubmit={handleSubmit}
      />
      <ManageEditResourceDialog
        data={editResourceProps.data}
        isOpen={isEditResourceDialogOpen}
        onClose={() => setIsEditResourceDialogOpen(false)}
        onSubmit={handleEdit}
      />

      <section className="container mb-8">
        <ManageResourceSearchBar onSearch={handleSearch} onAddNewResource={handleCreateResource} />
      </section>

      <section className="container">
        <div className="w-full flex items-center justify-end mb-6"></div>
        <div className="flex flex-wrap justify-between items-center mb-6">
          <h2 className="text-xl font-bold">Recursos</h2>
          <span className="text-sm font-bold">Encontrados: {resourceData?.length || 0}</span>
        </div>
        {isResourceLoading || isFetching ? (
          <div className="flex justify-center items-center h-32">
            <p className="text-muted-foreground font-bold animate-pulse">Carregando recursos...</p>
          </div>
        ) : isResourceError ? (
          <div className="flex justify-center items-center h-32">
            <p className="text-destructive font-bold">
              Erro: {resourceError instanceof ApiError ? resourceError.message : "Erro desconhecido"}
            </p>
          </div>
        ) : (
          <Table className="w-full bg-white dark:bg-white/5 border dark:border-violet-500/10 shadow-md hover:shadow-lg p-4 dark:shadow-violet-300/15">
            <TableCaption>Lista de recursos</TableCaption>
            <TableHeader>
              <TableRow>
                <TableHead className="w-25">Nome</TableHead>
                <TableHead className="text-center">Reservavel</TableHead>
                <TableHead className="text-center">Status</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {resourceData?.map((resource) => (
                <TableRow>
                  <TableCell className="font-bold w-25">{resource.name}</TableCell>
                  <TableCell className="text-center">
                    {resource.canReserve ? (
                      <Badge
                        variant="outline"
                        className="border-emerald-500/30 bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-500/30 rounded-full px-2.5 py-0.5 text-xs font-normal"
                      >
                        Sim
                      </Badge>
                    ) : (
                      <Badge
                        variant="outline"
                        className="border-red-500/30 bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-300 dark:border-red-500/30 rounded-full px-2.5 py-0.5 text-xs font-normal"
                      >
                        Não
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-center">
                    {status ? (
                      <Badge
                        variant="outline"
                        className="border-emerald-500/30 bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-500/30 rounded-full px-2.5 py-0.5 text-xs font-normal"
                      >
                        Ativo
                      </Badge>
                    ) : (
                      <Badge
                        variant="outline"
                        className="border-red-500/30 bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-300 dark:border-red-500/30 rounded-full px-2.5 py-0.5 text-xs font-normal"
                      >
                        Inativo
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-x-2">
                      <Button
                        variant={"outline"}
                        size="icon"
                        onClick={() => handleEdit({ id: resource.id as number, name: resource.name, canBeReserved: resource.canReserve, enabled: resource.enabled })}
                      >
                        <Pencil className="size-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </section>
    </>
  );
}
