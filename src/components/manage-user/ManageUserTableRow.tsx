import { TableCell, TableRow } from "#/components/ui/table";
import { Calendar, Pencil, Trash, User } from "lucide-react";
import { Badge } from "#/components/ui/badge";
import { Button } from "#/components/ui/button";

export function ManageUserTableRow() {
	return (
		<TableRow>
			<TableCell className="font-bold w-50">João Silva</TableCell>
			<TableCell>20261234567</TableCell>
			<TableCell>joao.contato@gmailcom</TableCell>
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
					<Button variant={"outline"} size="icon"><Pencil className="size-4" /></Button>
				</div>
			</TableCell>
		</TableRow>
	);
}
