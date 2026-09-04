import { createFileRoute } from "@tanstack/react-router";
import { SpaceCard } from "#/components/home/SpaceCard";
import { SpaceSearchBar } from "#/components/home/SpaceSearchBar";

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
				<div className="w-full grid grid-cols-[repeat(auto-fit,minmax(264px,1fr))] justify-center gap-6">
					<SpaceCard />
					<SpaceCard />
					<SpaceCard />
				</div>
			</section>
		</>
	);
}
