import { useState } from "react";
import { FiX, FiCalendar, FiClock } from "react-icons/fi";
import { GrResources } from "react-icons/gr";
import { FaUserFriends } from "react-icons/fa";

export type ReservePopupProps = {
    isOpen: boolean;
    onClose: () => void;
    roomName: string;
    capacity: number;
    resources: string[];
};

export default function ReservePopup({
    isOpen,
    onClose,
    roomName,
    capacity,
    resources,
}: ReservePopupProps) {
    const [date, setDate] = useState("");
    const [startTime, setStartTime] = useState("");
    const [endTime, setEndTime] = useState("");

    if (!isOpen) return null;

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
                        Reservar {roomName}
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
                                        value={date}
                                        min={new Date().toISOString().split('T')[0]}
                                        onChange={(e) => setDate(e.target.value)}
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
                            {date ? (
                                <p className="italic">Buscando reservas para esta data...</p>
                            ) : (
                                <p>Selecione uma data para ver as reservas existentes.</p>
                            )}
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
                        className="rounded-lg bg-[#a594f9] px-4 py-2 text-sm font-medium text-white hover:bg-[#9784f1] focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-colors"
                    >
                        Confirmar Reserva
                    </button>
                </div>
            </div>
        </div>
    );
}
