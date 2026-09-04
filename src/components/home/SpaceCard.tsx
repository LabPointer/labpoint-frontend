import {
	Computer,
	MapPin,
	Projector,
	Tv,
	Users,
} from "lucide-react";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import {
	Card,
	CardAction,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "../ui/card";

export function SpaceCard() {
	return (
		<Card className="min-h-72 bg-white dark:bg-white/5 rounded-md border dark:border-violet-500/10 shadow-md hover:shadow-lg p-4 dark:shadow-violet-300/15">
			<CardHeader className="border-0 p-0 flex flex-row items-start justify-between">
				<div>
					<CardTitle className="text-lg font-bold text-neutral-900 dark:text-neutral-100">
						Lab 201
					</CardTitle>
					<CardDescription className="text-sm text-neutral-500 dark:text-neutral-400">
						Física
					</CardDescription>
				</div>
				<CardAction>
					<Badge
						variant="outline"
						className="border-emerald-500/30 bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-500/30 rounded-full px-2.5 py-0.5 text-xs font-normal"
					>
						Disponível
					</Badge>
				</CardAction>
			</CardHeader>

			<CardContent className="flex flex-col gap-y-2.5 p-0 mt-3">
				<div className="flex items-center gap-2.5 text-sm text-neutral-700 dark:text-neutral-300">
					<Users className="size-4 shrink-0 text-violet-600 dark:text-violet-400" />
					<span>
						Capacidade:{" "}
						<strong className="font-semibold text-neutral-900 dark:text-neutral-100">
							30 lugares
						</strong>
					</span>
				</div>
				<div className="flex items-center gap-2.5 text-sm text-neutral-700 dark:text-neutral-300">
					<Computer className="size-4 shrink-0 text-violet-600 dark:text-violet-400" />
					<span>Computadores</span>
				</div>
				<div className="flex items-center gap-2.5 text-sm text-neutral-700 dark:text-neutral-300">
					<Projector className="size-4 shrink-0 text-violet-600 dark:text-violet-400" />
					<span>Projetor</span>
				</div>
				<div className="flex items-center gap-2.5 text-sm text-neutral-700 dark:text-neutral-300">
					<Tv className="size-4 shrink-0 text-violet-600 dark:text-violet-400" />
					<span>Telão</span>
				</div>
				<div className="flex items-center gap-2.5 text-sm text-neutral-700 dark:text-neutral-300">
					<MapPin className="size-4 shrink-0 text-violet-600 dark:text-violet-400" />
					<span>Prédio principal</span>
				</div>
			</CardContent>

			<CardFooter className="bg-transparent border-0 mt-auto">
				<Button className="w-full h-10 rounded-xl bg-[#5925dc] hover:bg-[#4b1ec0] text-white font-medium shadow-sm transition-colors">
					Reservar
				</Button>
			</CardFooter>
		</Card>
	);
}
