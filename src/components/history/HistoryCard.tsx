import { Calendar, Clock, MapPin, Pencil, Users, X } from "lucide-react";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import {
	Card,
	CardAction,
	CardContent,
	CardFooter,
	CardHeader,
	CardTitle,
} from "../ui/card";

export interface HistoryCardProps {
	title?: string;
	location?: string;
	status?: string;
	date?: string;
	time?: string;
	reservedBy?: string;
	purpose?: string;
	onEdit?: () => void;
	onCancel?: () => void;
}

export function HistoryCard({
	title = "Sala 101",
	location = "Prédio principal",
	status = "Confirmada",
	date = "12 de maio de 2026",
	time = "Matutino · 3h",
	reservedBy = "João Silva",
	purpose = "Workshop de Desenvolvimento Web",
	onEdit,
	onCancel,
}: HistoryCardProps) {
	return (
		<Card className="bg-white dark:bg-white/5 rounded-md border dark:border-violet-500/10 shadow-md hover:shadow-lg p-4 dark:shadow-violet-300/15">
			<CardHeader className="p-0 border-0 flex flex-row items-start justify-between">
				<div className="flex flex-col gap-1">
					<CardTitle className="text-lg font-bold text-foreground">
						{title}
					</CardTitle>
					<div className="flex items-center gap-1.5 text-muted-foreground text-xs">
						<MapPin className="size-3.5" />
						<span>{location}</span>
					</div>
				</div>

				<CardAction className="m-0">
					<Badge
						variant="outline"
						className="rounded-full border-emerald-300 bg-emerald-50 text-emerald-700 dark:border-emerald-800/70 dark:bg-emerald-950/40 dark:text-emerald-400 text-xs font-medium px-3 py-0.5"
					>
						{status}
					</Badge>
				</CardAction>
			</CardHeader>

			<CardContent className="p-0 flex flex-col gap-2.5 text-sm">
				<div className="flex items-center gap-2 text-foreground/90">
					<Calendar className="size-4 text-violet-500 dark:text-violet-400 shrink-0" />
					<span>{date}</span>
				</div>
				<div className="flex items-center gap-2 text-foreground/90">
					<Clock className="size-4 text-violet-500 dark:text-violet-400 shrink-0" />
					<span>{time}</span>
				</div>
				<div className="flex items-center gap-2 text-foreground/90">
					<Users className="size-4 text-violet-500 dark:text-violet-400 shrink-0" />
					<span>
						Reservado por <span className="font-medium">{reservedBy}</span>
					</span>
				</div>

				<div className="mt-1 text-sm">
					<span className="text-muted-foreground">Propósito: </span>
					<span className="font-semibold text-foreground">{purpose}</span>
				</div>
			</CardContent>

			<CardFooter className="bg-transparent border-0 grid grid-cols-2 gap-3 mt-auto">
				<Button
					variant="outline"
					size="lg"
					className="w-full gap-2 rounded-xl text-sm font-medium border-neutral-200 hover:bg-neutral-100 dark:border-neutral-700 dark:hover:bg-neutral-800"
					onClick={onEdit}
				>
					<Pencil className="size-4" />
					Alterar
				</Button>

				<Button
					variant="outline"
					size="lg"
					className="w-full gap-2 rounded-xl text-sm font-medium border-rose-300 text-rose-600 hover:bg-rose-50 hover:text-rose-700 hover:border-rose-400 dark:border-rose-900/70 dark:text-rose-400 dark:hover:bg-rose-950/40"
					onClick={onCancel}
				>
					<X className="size-4" />
					Cancelar
				</Button>
			</CardFooter>
		</Card>
	);
}
