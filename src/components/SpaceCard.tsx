import { Monitor, Users, Wrench } from "lucide-react";
import { Button } from "./ui/button";
import {
	Card,
	CardAction,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "./ui/card";

export function SpaceCard() {
	return (
		<Card className="min-h-72 bg-white dark:bg-white/5 rounded-md border dark:border-violet-500/10 shadow-md hover:shadow-lg p-4 dark:shadow-violet-300/15">
			<CardHeader className="border-0">
				<div className="flex items-center gap-2">
					<Monitor />
					<CardTitle className="font-bold">Informatica 8</CardTitle>
				</div>
				<CardDescription>ADS</CardDescription>
			</CardHeader>
			<CardContent className="flex flex-col gap-y-4">
				<div className="flex items-center gap-2">
					<Users className="size-4" />
					<span className="font-medium text-neutral-600 dark:text-neutral-400">
						Capacidade:{" "}
					</span>
					<span className="font-bold">20</span>
				</div>
				<div className="flex items-center gap-2">
					<Wrench className="size-4" />
					<span className="font-medium text-neutral-600 dark:text-neutral-400">
						Projetor
					</span>
				</div>
				<div className="flex items-center gap-2">
					<Wrench className="size-4" />
					<span className="font-medium text-neutral-600 dark:text-neutral-400">
						Computadores
					</span>
				</div>
				<div className="flex items-center gap-2">
					<Wrench className="size-4" />
					<span className="font-medium text-neutral-600 dark:text-neutral-400">
						Telao
					</span>
				</div>
			</CardContent>
			<CardFooter className="bg-transparent border-0 mt-auto">
				<Button className="w-full">Agendar</Button>
			</CardFooter>
		</Card>
	);
}
