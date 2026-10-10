import { createFileRoute } from "@tanstack/react-router";
import { ManageUserSearchBar, type UserSearchFilters } from "@/components/manage-user/ManageUserSearchBar";
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Pencil } from "lucide-react";
import { Button } from "#/components/ui/button";
import { Badge } from "#/components/ui/badge";
import { Suspense, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { ErrorBoundary, getErrorMessage } from "react-error-boundary";
import { ManageSubjectTableRow } from "#/components/manage-subjects/ManageSubjectTableRow";
import { ManageUserTableRow } from "#/components/manage-user/ManageUserTableRow";

export const Route = createFileRoute("/_private/admin/manage-users")({
  component: RouteComponent,
});

function RouteComponent() {
  const queryClient = useQueryClient();
  const [searchFilters, setSearchFilters] = useState<UserSearchFilters>();

  return (
    <>
      <section className="container mb-8">
        <ManageUserSearchBar
          onSearch={(filters) => {
            setSearchFilters(filters);
            queryClient.invalidateQueries({ queryKey: ["user-data"] });
          }}
        />
      </section>
      <section className="container">
        <ErrorBoundary
          resetKeys={[searchFilters]}
          fallbackRender={({ error }) => (
            <div className="flex flex-col items-center justify-center gap-2">
              <p className="text-center font-bold text-red-600 dark:text-red-400">Erro: {getErrorMessage(error)}</p>
            </div>
          )}
        >
          <Suspense fallback={<div className="text-center font-bold animate-pulse">Carregando usuarios...</div>}>
            <ManageUserTableRow
              props={searchFilters!}
              onEdit={(data) => {
                
              }}
            />
          </Suspense>
        </ErrorBoundary>
      </section>
    </>
  );
}
