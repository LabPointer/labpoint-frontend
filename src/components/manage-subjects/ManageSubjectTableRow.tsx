import { Pencil } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { TableCell, TableRow } from "@/components/ui/table";

export type SubjectTableRowProps = {
  id: number;
  name: string;
  enabled: boolean;
};


type SubjectTableRowActionsProps = {
  onEdit: (props: SubjectTableRowProps) => void;
};

export function ManageSubjectTableRow({ id, name, enabled, onEdit }: SubjectTableRowProps & SubjectTableRowActionsProps) {
	return (
		<TableRow>
			<TableCell className="font-bold w-25">{name}</TableCell>
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
					<Button variant={"outline"} size="icon" onClick={() => onEdit({ id, name, enabled })}><Pencil className="size-4" /></Button>
				</div>
			</TableCell>
		</TableRow>
	);
}
