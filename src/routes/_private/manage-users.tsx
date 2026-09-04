import { createFileRoute } from "@tanstack/react-router";
import { ManageReserveSearchBar } from "#/components/manage-reserve/ManageReserveSearchBar";
import {
	Table,
	TableBody,
	TableCaption,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { ManageUserTableRow } from "#/components/manage-user/ManageUserTableRow";

export const Route = createFileRoute('/_private/manage-users')({
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <>
			<section className="container mb-8">
				<ManageReserveSearchBar />
			</section>
			<section className="container">
				<Table className="w-full bg-white dark:bg-white/5 border dark:border-violet-500/10 shadow-md hover:shadow-lg p-4 dark:shadow-violet-300/15">
					<TableCaption>A list of your recent invoices.</TableCaption>
					<TableHeader>
						<TableRow>
							<TableHead className="w-[100px]">Nome</TableHead>
							<TableHead>Matricula</TableHead>
							<TableHead>E-mail</TableHead>
							<TableHead className="text-right">Cargo</TableHead>
              <TableHead className="text-right">Disciplina</TableHead>
              <TableHead className="text-right">Ações</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						<ManageUserTableRow />
            <ManageUserTableRow />
            <ManageUserTableRow />
            <ManageUserTableRow />
            <ManageUserTableRow />
					</TableBody>
				</Table>
			</section>
		</>
  );
}
