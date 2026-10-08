import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { type ManageCreateSubjectData, ManageCreateSubjectDialog } from "#/components/manage-subjects/ManageCreateSubjectDialog";
import { type ManageEditSubjectData, ManageEditSubjectDialog, type ManageEditSubjectDialogProps } from "#/components/manage-subjects/ManageEditSubjectDialog";
import { ManageSubjectSearchBar, type SubjectFilters } from "#/components/manage-subjects/ManageSubjectSearchBar";
import { ManageSubjectTableRow } from "#/components/manage-subjects/ManageSubjectTableRow";
import { Table, TableBody, TableCaption, TableHead, TableHeader, TableRow } from "#/components/ui/table";
import { ApiError } from "#/lib/types/error-types";
import { useApi } from "#/lib/utils/restapi";

const api = useApi();

function subjectQuery(search: string, enabled: boolean | undefined) {
  const query = useQuery({
    queryKey: ["subject-data", search, enabled],
    queryFn: async () => {
      const res = await api.GET("/subject", {
        params: {
          query: {
            Name: search,
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

export const Route = createFileRoute("/_private/admin/manage-subjects")({
  component: RouteComponent,
});

function RouteComponent() {
  const [isCreateSubjectDialogOpen, setIsCreateSubjectDialogOpen] = useState(false);
  const [isEditSubjectDialogOpen, setIsEditSubjectDialogOpen] = useState(false);
  const [editSubjectProps, setEditSubjectProps] = useState<ManageEditSubjectDialogProps>({
    data: {
      id: 0,
      name: "",
      enabled: false,
    },
    isOpen: isEditSubjectDialogOpen,
    onSubmit: handleEdit,
    onClose: () => setIsEditSubjectDialogOpen(false),
  });
  const [searchFilter, setSearchFilter] = useState<SubjectFilters>();
  const {
    data: subjectData,
    isLoading: isSubjectLoading,
    isError: isSubjectError,
    error: subjectError,
    isFetching,
    refetch
  } = subjectQuery(searchFilter?.search || "", searchFilter?.status);

  function handleSearch(filters: SubjectFilters) {
    setSearchFilter(filters);
  }

  function handleCreateSubject() {
    setIsCreateSubjectDialogOpen(true);
  }

  function handleEditSubject(data: ManageEditSubjectData) {
    setEditSubjectProps({
      data: {
        id: data.id,
        name: data.name,
        enabled: data.enabled,
      },
      isOpen: isEditSubjectDialogOpen,
      onSubmit: handleEdit,
      onClose: () => setIsEditSubjectDialogOpen(false),
    });
    setIsEditSubjectDialogOpen(true);
  }

  async function handleSubmit(data: ManageCreateSubjectData) {
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
    refetch();
  }

  async function handleEdit(data: ManageEditSubjectData) {
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
    refetch();
  }

  return (
    <>
      <ManageCreateSubjectDialog isOpen={isCreateSubjectDialogOpen} onClose={() => setIsCreateSubjectDialogOpen(false)} onSubmit={handleSubmit} />
      <ManageEditSubjectDialog data={editSubjectProps.data} isOpen={isEditSubjectDialogOpen} onClose={() => setIsEditSubjectDialogOpen(false)} onSubmit={data => handleEdit(data)} />

      <section className="container mb-8">
        <ManageSubjectSearchBar onSearch={handleSearch} onAddNewSubject={handleCreateSubject} />
      </section>

      <section className="container">
        <div className="w-full flex items-center justify-end mb-6">
          
        </div>
        <div className="flex flex-wrap justify-between items-center mb-6">
          <h2 className="text-xl font-bold">Matérias</h2>
          <span className="text-sm font-bold">Encontrados: {subjectData?.length || 0}</span>
        </div>
        {isSubjectLoading || isFetching ? (
          <div className="flex justify-center items-center h-32">
            <p className="text-muted-foreground font-bold animate-pulse">Carregando materias...</p>
          </div>
        ) : isSubjectError ? (
          <div className="flex justify-center items-center h-32">
            <p className="text-destructive font-bold">
              Erro: {subjectError instanceof ApiError ? subjectError.message : "Erro desconhecido"}
            </p>
          </div>
        ) : (
          <Table className="w-full bg-white dark:bg-white/5 border dark:border-violet-500/10 shadow-md hover:shadow-lg p-4 dark:shadow-violet-300/15">
            <TableCaption>A list of your recent invoices.</TableCaption>
            <TableHeader>
              <TableRow>
                <TableHead className="w-25">Nome</TableHead>
                <TableHead className="text-center">Status</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {subjectData?.map((subject) => (
                <ManageSubjectTableRow
                  key={subject.id}
                  id={subject.id as number}
                  name={subject.name}
                  enabled={subject.enabled}
                  onEdit={(props) => handleEditSubject(props)}
                />
              ))}
            </TableBody>
          </Table>
        )}
      </section>
    </>
  );
}
