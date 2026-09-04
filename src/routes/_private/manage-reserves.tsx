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
import { ManageReserveTableRow } from "#/components/manage-reserve/ManageReserveTableRow";

export const Route = createFileRoute("/_private/manage-reserves")({
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
					<TableCaption>A list of your recent invoices.</TableCaption>
					<TableHeader>
						<TableRow>
							<TableHead className="w-[100px]">Espaço</TableHead>
							<TableHead>Usuario</TableHead>
							<TableHead>Data</TableHead>
							<TableHead className="text-right">Status</TableHead>
              <TableHead className="text-right">Ações</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						<ManageReserveTableRow />
            <ManageReserveTableRow />
            <ManageReserveTableRow />
            <ManageReserveTableRow />
            <ManageReserveTableRow />
					</TableBody>
				</Table>
			</section>
		</>
	);
}
