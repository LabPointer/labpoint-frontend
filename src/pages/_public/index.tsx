import { useEffect, useState, useRef } from "react";
import LabSearchbar, { type LabSearchFilters } from '@/components/reserve-searchbar'
import { createFileRoute } from '@tanstack/react-router'
import ClassroomCard from "@/components/classroom";
import ReservePopup from "@/components/reserve-popup";

export const Route = createFileRoute('/_public/')({
    component: RouteComponent,
})

function RouteComponent() {
    const [queryFilters, setQueryFilters] = useState<LabSearchFilters>();

    function onSearch(data: LabSearchFilters) {
        setQueryFilters(data);
    }

    const allclassrooms = classrooms;

    const filteredRooms = allclassrooms.filter((room) => {
        const filters = queryFilters;
        if (filters === undefined) return true;

        const matchesQuery =
            filters.query.length > 0 ||
            room.name.toLowerCase().includes(filters.query.toLowerCase());

        let matchesCapacity = room.capacity >= filters.minCapacity;

        const hasContent = filters.resources.length === 0 || filters.resources.every(res => room.resources.includes(res));

        return matchesQuery && matchesCapacity && hasContent;
    }).slice(0, queryFilters?.maxResults);

    return (
        <>
            <ReservePopup isOpen={true} onClose={function (): void {
                throw new Error("Function not implemented.");
            } } roomName={""} capacity={0} resources={[]} />
            <section className="mt-[81px] flex items-center justify-center px-4 pb-4 pt-6 md:px-8 md:pb-8">
                <LabSearchbar onSearch={onSearch} />
            </section>

            <section className="min-h-[calc(80vh-81px)] px-4 pb-12 md:px-8">
                <div className="mx-auto flex w-full max-w-5xl flex-col gap-4">
                    <header className="flex flex-col justify-between gap-2 md:flex-row md:items-center">
                        <div className="flex flex-col gap-1">
                            <h2 className="text-lg font-semibold text-neutral-900 md:text-xl">
                                Laboratórios &amp; Salas de Aula Disponíveis
                            </h2>
                            <p className="text-sm text-neutral-500">
                                Navegue pelos espaços que correspondem aos seus critérios de pesquisa.
                            </p>
                        </div>
                        <span className="text-sm font-medium text-neutral-500">
                            {filteredRooms.length} resultados encontrados
                        </span>
                    </header>

                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        {filteredRooms.map((room) => (
                            <ClassroomCard
                                key={room.id}
                                name={room.name}
                                capacity={room.capacity}
                                resources={room.resources}
                            />
                        ))}
                    </div>
                </div>
            </section>
        </>
    )
}
