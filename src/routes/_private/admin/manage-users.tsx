import { createFileRoute } from "@tanstack/react-router";
import { ManageReserveSearchBar } from "@/components/manage-reserve/ManageReserveSearchBar";
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Pencil } from "lucide-react";
import { Button } from "#/components/ui/button";
import { Badge } from "#/components/ui/badge";

export const Route = createFileRoute("/_private/admin/manage-users")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <>
      <section className="container mb-8">
        <ManageReserveSearchBar />
      </section>
      <section className="container">
        <Table className="w-full bg-white dark:bg-white/5 border dark:border-violet-500/10 shadow-md hover:shadow-lg p-4 dark:shadow-violet-300/15">
          <TableCaption>Lista de usuários.</TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead className="w-25">Nome</TableHead>
              <TableHead>Matricula</TableHead>
              <TableHead>E-mail</TableHead>
              <TableHead className="text-right">Cargo</TableHead>
              <TableHead className="text-right">Disciplina</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
              <TableCell className="font-bold w-50">Chuiza Moura</TableCell>
              <TableCell>20261234567</TableCell>
              <TableCell>chuiza@gmail.com</TableCell>
              <TableCell className="text-right">
                <Badge
                  variant="outline"
                  className="border-emerald-500/30 bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-500/30 rounded-full px-2.5 py-0.5 text-xs font-normal"
                >
                  Professor
                </Badge>
              </TableCell>
              <TableCell className="text-right">Arquitetura</TableCell>
              <TableCell className="text-right">
                <div className="flex items-center justify-end gap-x-2">
                  <Button variant={"outline"} size="icon">
                    <Pencil className="size-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </section>
    </>
  );
}
