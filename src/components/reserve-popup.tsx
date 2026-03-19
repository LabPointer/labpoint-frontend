import { useEffect, useState } from "react";
import { FiX, FiCalendar, FiClock } from "react-icons/fi";
import { GrResources } from "react-icons/gr";
import { FaUserFriends } from "react-icons/fa";
import { useQuery } from "@tanstack/react-query";
import type { CreateReserveBody, Reserves } from "@/@types";

export type ReservePopupProps = {
    isOpen: boolean;
    onClose: () => void;
    spaceId: string;
    spaceName: string;
    capacity: number;
    resources: string[];
};

async function getReserves(spaceId: string, date?: string, startFrom?: string, endUntil?: string) {
    const queryParams = new URLSearchParams();
    if (date) queryParams.append("date", date);
    if (startFrom) queryParams.append("startFrom", startFrom);
    if (endUntil) queryParams.append("endUntil", endUntil);
    //const response = await fetch(`${import.meta.env.VITE_API_URL}/reserves/${spaceId}?${queryParams.toString()}`, {
    const response = await fetch(`/api/reserves/${spaceId}`, {
        method: "GET",
    });

    if (response.ok) {
        if (response.headers.get("content-type") == "application/json") {
            console.log("Resposta")
            return (await response.json()) as Reserves[];
        }
        console.log("Resposta1")
        //return [] as Reserves[];
        return (await response.json()) as Reserves[];
    }
    console.log("Resposta2")
    throw new Error(await response.text());
}

async function postReserves(spaceId: string, date?: string, startFrom?: string, endUntil?: string) {
    if (!date || !startFrom || !endUntil) return;

    const bodyData: CreateReserveBody = {
        startFrom: new Date(`${date}T${startFrom}`).toISOString(),
        endUntil: new Date(`${date}T${endUntil}`).toISOString()
    }

    const response = await fetch(`/api/reserve/create/${spaceId}`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(bodyData),
    });

    return response;
}

export default function ReservePopup({
    isOpen,
    onClose,
    spaceId,
    spaceName,
    capacity,
    resources,
}: ReservePopupProps) {
    if (!isOpen) return null;

    const [selectedDate, setSelectedDate] = useState("");
    const [startTime, setStartTime] = useState("");
    const [endTime, setEndTime] = useState("");

    const getReservesQuery = useQuery({
        queryKey: [selectedDate],
        queryFn: () => getReserves(spaceId, selectedDate, startTime, endTime),
        enabled: false
    });

    const postReserveQuery = useQuery({
        queryKey: [],
        queryFn: async () => {
            const result = await postReserves(spaceId, selectedDate, startTime, endTime)
            if (!result) {
                alert("Erro: Voce precisa selecionar data, hora de inicio e hora de termino para confimar a reserva!");
                return;
            }
            if (result.ok) {
                alert("Reserva registrada com sucesso!");
            } else {
                const errorData = await result.text();
                alert(errorData || "Erro ao criar reserva.");
            }
        },
        enabled: false
    });

    useEffect(() => {
        if (selectedDate) {
            getReservesQuery.refetch();
        }
    }, [selectedDate]);

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div
                className="absolute inset-0 bg-black/40 backdrop-blur-sm"
                onClick={onClose}
            ></div>

            <div className="relative w-full max-w-[500px] rounded-2xl bg-white p-6 shadow-xl flex flex-col">
                <button
                    onClick={onClose}
                    className="absolute right-4 top-4 rounded-full p-1 text-neutral-400 hover:bg-neutral-100 hover:text-neutral-600 transition-colors"
                >
                    <FiX className="h-5 w-5" />
                </button>

                <div className="mb-6 pr-6">
                    <h2 className="text-2xl font-semibold text-neutral-900 mb-1">
                        Reservar {spaceName}
                    </h2>
                    <div className="flex flex-wrap items-center gap-1.5 text-sm text-neutral-500">
                        <div className="flex items-center gap-1">
                            <GrResources className="h-3.5 w-3.5" />
                            <span>{resources.length > 0 ? resources.join(", ") : "Sem recursos"}</span>
                        </div>
                        <span className="text-neutral-300">•</span>
                        <div className="flex items-center gap-1">
                            <FaUserFriends className="h-3.5 w-3.5" />
                            <span>Capacidade: {capacity} pessoas</span>
                        </div>
                    </div>
                </div>

                <div className="flex flex-col gap-5">
                    <div>
                        <h3 className="text-base font-semibold text-neutral-900 mb-3">
                            Detalhes da Reserva
                        </h3>

                        <div className="flex flex-col gap-4">
                            <div className="flex flex-col gap-1">
                                <label className="text-sm font-medium text-neutral-900">Data</label>
                                <div className="relative">
                                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                                        <FiCalendar className="h-4 w-4 text-neutral-400" />
                                    </div>
                                    <input
                                        type="date"
                                        value={selectedDate}
                                        min={new Date().toISOString().split('T')[0]}
                                        onChange={(e) => setSelectedDate(e.target.value)}
                                        className="block w-full rounded-lg border-0 bg-neutral-100 py-2.5 pl-10 pr-3 text-sm text-neutral-900 focus:ring-2 focus:ring-indigo-500"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="flex flex-col gap-1">
                                    <label className="text-sm font-medium text-neutral-900">Horário de Início</label>
                                    <div className="relative">
                                        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                                            <FiClock className="h-4 w-4 text-neutral-400" />
                                        </div>
                                        <input
                                            type="time"
                                            value={startTime}
                                            onChange={(e) => setStartTime(e.target.value)}
                                            className="block w-full rounded-lg border-0 bg-neutral-100 py-2.5 pl-10 pr-3 text-sm text-neutral-900 focus:ring-2 focus:ring-indigo-500"
                                        />
                                    </div>
                                </div>

                                <div className="flex flex-col gap-1">
                                    <label className="text-sm font-medium text-neutral-900">Horário de Término</label>
                                    <div className="relative">
                                        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                                            <FiClock className="h-4 w-4 text-neutral-400" />
                                        </div>
                                        <input
                                            type="time"
                                            value={endTime}
                                            onChange={(e) => setEndTime(e.target.value)}
                                            className="block w-full rounded-lg border-0 bg-neutral-100 py-2.5 pl-10 pr-3 text-sm text-neutral-900 focus:ring-2 focus:ring-indigo-500"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <hr className="border-neutral-200" />

                    <div>
                        <h3 className="text-base font-semibold text-neutral-900 mb-3">
                            Reservas Existentes
                        </h3>
                        <div className="text-sm text-neutral-500">
                            {!selectedDate ? (
                                <p>Selecione uma data para buscar as reservas</p>
                            ) : getReservesQuery.isLoading ? (
                                <p>Buscando reservas...</p>
                            ) : getReservesQuery.error ? (
                                <p>
                                    Erro ao buscar reservas:{" "}
                                    {getReservesQuery.error instanceof Error ? getReservesQuery.error.message : String(getReservesQuery.error)}
                                </p>
                            ) : getReservesQuery.data && getReservesQuery.data.length > 0 ? (
                                <ul className="list-disc list-inside">
                                    {getReservesQuery.data.map((reserve: any) => (
                                        <li key={reserve.id}>
                                            {reserve.startFrom.toLocaleString()} - {reserve.endFrom.toLocaleString()}
                                        </li>
                                    ))}
                                </ul>
                            ) : <p>Nenhuma reserva anterior encontrada para a data selecionada</p>}
                        </div>
                    </div>
                </div>

                <div className="mt-8 flex justify-end gap-3">
                    <button
                        onClick={onClose}
                        className="rounded-lg border border-neutral-300 bg-white px-4 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-colors"
                    >
                        Cancelar
                    </button>
                    <button
                        onClick={() => {
                            if (!selectedDate || !startTime || !endTime) return;
                            postReserveQuery.refetch();
                        }}
                        className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                        disabled={(getReservesQuery.isLoading || postReserveQuery.isLoading) ? true : !startTime || !endTime || !selectedDate}
                    >
                        {postReserveQuery.isLoading ? "Processando..." : "Confirmar Reserva"}
                    </button>
                </div>
            </div>
        </div>
    );
}
