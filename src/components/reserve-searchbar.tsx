import { useEffect, useState, useRef } from "react";
import { FiSearch, FiChevronDown, FiX } from "react-icons/fi";

type FieldWrapperProps = {
    label: string;
    className?: string;
    children: React.ReactNode;
};

function FieldWrapper({ label, className = "", children }: FieldWrapperProps) {
    return (
        <div className={`flex flex-col gap-1 text-sm font-medium text-neutral-700 ${className}`}>
            <label className="cursor-default">{label}</label>
            {children}
        </div>
    );
}

export const labResources = [
    "Telão",
    "Computadores",
    "Tubo de ensaio"
] as const;

export type LabResource = typeof labResources[number];

export type LabSearchFilters = {
    query: string;
    resources: LabResource[];
    minCapacity: number;
    maxResults: number;
};

const maxResultsOptions = [10, 20, 30, 40, 50];

type LabSearchbarProps = {
    onSearch?: (data: LabSearchFilters) => void;
};

export default function LabSearchbar({ onSearch }: LabSearchbarProps = {}) {
    const [searchQuery, setSearchQuery] = useState("");
    const [resourceQuery, setResourceQuery] = useState("");
    const [minCapacity, setMinCapacity] = useState(20);
    const [maxResults, setMaxResults] = useState(10);
    const [selectedResources, setSelectedResources] = useState<LabResource[]>([]);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(function() {
        function handleClickOutside(event: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsDropdownOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    function normalizeString(str: string) {
        return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase()
    }

    const filteredResources = labResources.filter(resource => 
        normalizeString(resource).includes(normalizeString(resourceQuery))
    );

    function toggleResource(resource: LabResource) {
         if (selectedResources.includes(resource)) {
             setSelectedResources(selectedResources.filter(r => r !== resource));
         } else {
             setSelectedResources([...selectedResources, resource]);
         }
    };

    function removeResource(resource: LabResource, e: React.MouseEvent) {
         e.stopPropagation();
         e.preventDefault();
         setSelectedResources(selectedResources.filter(r => r !== resource));
    };

    useEffect(function() {
        const timer = setTimeout(() => {
            const searchData: LabSearchFilters = {
                query: searchQuery,
                resources: selectedResources,
                minCapacity,
                maxResults
            };
            if (onSearch) {
                onSearch(searchData);
            }
        }, 400);

        return () => clearTimeout(timer);
    }, [searchQuery, selectedResources, minCapacity, maxResults, onSearch]);

    return (
        <>
            <section className="w-full flex items-center justify-center px-2 py-8">
                <div className="w-full max-w-5xl flex-col border px-8 py-8 rounded-lg bg-white border-black/15 shadow-md shadow-black/20">
                    <header className="mb-6 flex flex-col gap-1 md:mb-8">
                        <h2 className="text-xl font-semibold text-neutral-900 md:text-2xl">
                            Reserva de Laboratório
                        </h2>
                        <p className="text-sm text-neutral-500">
                            Pesquise e filtre os espaços disponíveis para reservar
                            para suas aulas ou atividades de laboratório.
                        </p>
                    </header>

                    <form className="flex flex-col gap-y-4" onSubmit={(e) => e.preventDefault()}>
                        <FieldWrapper label="Pesquisar">
                            <div className="relative">
                                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                                    <FiSearch className="h-4 w-4 text-neutral-400" />
                                </div>
                                <input
                                    type="text"
                                    placeholder="Buscar por laboratório ou sala..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="block w-full rounded-full border border-neutral-300 shadow-md bg-neutral-100 py-2.5 pl-10 pr-3 text-sm text-neutral-900 focus:border-indigo-600 focus:outline-none focus:ring-1 focus:ring-indigo-600"
                                />
                            </div>
                        </FieldWrapper>

                        <FieldWrapper label="Recursos" className="w-full">
                            <div className="relative w-full" ref={dropdownRef}>
                                <div 
                                    className="flex min-h-[44px] w-full flex-wrap items-center gap-2 rounded-xl border border-neutral-300 shadow-md bg-neutral-100 p-1.5 focus-within:border-indigo-600 focus-within:ring-1 focus-within:ring-indigo-600 cursor-text"
                                    onClick={() => setIsDropdownOpen(true)}
                                >
                                    <div className="flex items-center pl-2">
                                        <FiSearch className="h-4 w-4 text-neutral-400" />
                                    </div>
                                    {selectedResources.map((resource) => (
                                        <span key={resource} className="flex items-center gap-1 rounded-full bg-indigo-100 px-2.5 py-1 shrink-0 text-xs font-medium text-indigo-800">
                                            {resource}
                                            <button 
                                                type="button" 
                                                onClick={(e) => removeResource(resource, e)} 
                                                className="hover:text-indigo-900 rounded-full hover:bg-indigo-200 p-0.5"
                                            >
                                                <FiX className="h-3 w-3" />
                                            </button>
                                        </span>
                                    ))}
                                    <input
                                        type="text"
                                        placeholder={selectedResources.length === 0 ? "Filtrar laboratorio por recursos..." : ""}
                                        value={resourceQuery}
                                        onChange={(e) => {
                                            setResourceQuery(e.target.value);
                                            setIsDropdownOpen(true);
                                        }}
                                        className="flex-1 bg-transparent px-2 py-1 min-w-[120px] text-sm text-neutral-900 focus:outline-none placeholder:text-neutral-500"
                                    />
                                </div>

                                {/* Dropdown */}
                                {isDropdownOpen && (
                                    <div className="absolute z-10 mt-2 max-h-60 w-full overflow-auto rounded-lg border border-neutral-200 bg-white py-1 shadow-lg">
                                        {filteredResources.length > 0 ? (
                                            filteredResources.map(resource => (
                                                <label 
                                                    key={resource} 
                                                    className="flex cursor-pointer items-center gap-3 px-4 py-2 hover:bg-neutral-100"
                                                >
                                                    <input
                                                        type="checkbox"
                                                        className="h-4 w-4 rounded border-neutral-300 text-indigo-600 focus:ring-indigo-600"
                                                        checked={selectedResources.includes(resource)}
                                                        onChange={() => toggleResource(resource as LabResource)}
                                                    />
                                                    <span className="text-sm text-neutral-700">{resource}</span>
                                                </label>
                                            ))
                                        ) : (
                                            <div className="px-4 py-3 text-sm text-neutral-500 text-center">Nenhum recurso encontrado.</div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </FieldWrapper>

                        <div className="flex max-[420px]:flex-col gap-3 w-full">
                            <FieldWrapper label="Capacidade minima" className="max-[420px]:w-full min-[420px]:max-w-38 ">
                                <div className="relative">
                                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                                        <FiSearch className="h-4 w-4 text-neutral-400" />
                                    </div>
                                    <input
                                        type="number"
                                        min={20}
                                        value={minCapacity}
                                        onChange={(e) => setMinCapacity(Number(e.target.value))}
                                        className="block w-full rounded-lg border border-neutral-300 shadow-md bg-neutral-100 py-2.5 pl-10 pr-3 text-sm text-neutral-900 focus:border-indigo-600 focus:outline-none focus:ring-1 focus:ring-indigo-600"
                                    />
                                </div>
                            </FieldWrapper>

                            <FieldWrapper label="Máximo de resultados" className="max-[420px]:w-full">
                                <div className="relative w-full">
                                    <select
                                        className="block w-full appearance-none rounded-lg border border-neutral-300 shadow-md bg-neutral-100 py-2.5 pl-4 pr-10 text-sm text-neutral-900 focus:border-indigo-600 focus:outline-none focus:ring-1 focus:ring-indigo-600 cursor-pointer"
                                        value={maxResults}
                                        onChange={(e) => setMaxResults(Number(e.target.value))}
                                    >
                                        {maxResultsOptions.map((option) => (
                                            <option key={option} value={option}>
                                                {option} resultados
                                            </option>
                                        ))}
                                    </select>
                                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-4">
                                        <FiChevronDown className="h-4 w-4 text-neutral-400" />
                                    </div>
                                </div>
                            </FieldWrapper>
                        </div>

                    </form>
                </div>
            </section>
        </>
    )
}