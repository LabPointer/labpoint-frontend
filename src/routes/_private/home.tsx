import { createFileRoute } from "@tanstack/react-router";
import { SpaceCard } from "#/components/SpaceCard";
import { SpaceSearchBar } from "#/components/SpaceSearchBar";

export const Route = createFileRoute("/_private/home")({
	component: RouteComponent,
});

function RouteComponent() {
	return (
		<>
			<section className="container mb-8">
				<SpaceSearchBar />
			</section>
			<section className="container">
				<div className="flex flex-wrap justify-between items-center mb-6">
					<h2 className="text-xl font-bold">Laboratórios</h2>
					<span className="text-sm font-bold">Encontrados: 0</span>
				</div>
				<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
					<SpaceCard />
					<SpaceCard />
					<SpaceCard />
				</div>
			</section>
		</>
	);
}
