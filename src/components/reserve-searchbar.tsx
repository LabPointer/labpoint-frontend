import { useEffect, useState } from "react"
import { Search, X, Filter, Users } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { ScrollArea } from "@/components/ui/scroll-area"

export const spaceResources = [
    "computadores",
    "telão",
    "tubos de ensaio"
] as const

export type SpaceResource = typeof spaceResources[number]

export type SpaceSearchFilters = {
    query: string
    resources: SpaceResource[]
    minCapacity: number
}

type SpaceSearchbarProps = {
    onSearch?: (query: SpaceSearchFilters) => void
}

function normalizeString(str: string) {
    return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase()
}

export default function SpaceSearchbar({ onSearch }: SpaceSearchbarProps = {}) {
    const [searchQuery, setSearchQuery] = useState("")
    const [resourceQuery, setResourceQuery] = useState("")
    const [minCapacity, setMinCapacity] = useState<number | "">("")
    const [selectedResources, setSelectedResources] = useState<SpaceResource[]>([])
    const [isDropdownOpen, setIsDropdownOpen] = useState(false)

    const filteredResources = spaceResources.filter(resource =>
        normalizeString(resource).includes(normalizeString(resourceQuery))
    )

    function toggleResource(resource: SpaceResource) {
        if (selectedResources.includes(resource)) {
            setSelectedResources(selectedResources.filter(r => r !== resource))
        } else {
            setSelectedResources([...selectedResources, resource])
        }
    }

    function removeResource(resource: SpaceResource, e: React.MouseEvent) {
        e.stopPropagation()
        e.preventDefault()
        setSelectedResources(selectedResources.filter(r => r !== resource))
    }

    useEffect(function () {
        const searchData: SpaceSearchFilters = {
            query: searchQuery,
            resources: selectedResources,
            minCapacity: minCapacity === "" ? 0 : minCapacity,
        }
        if (onSearch) {
            onSearch(searchData)
        }
    }, [searchQuery, selectedResources, minCapacity, onSearch])

    return (
        <section className="w-full flex justify-center px-4 py-6">
            <div className="w-full max-w-5xl bg-background border border-black/10 rounded-xl shadow-sm p-4 md:p-6 transition-all hover:shadow-md">
                <header className="mb-4">
                    <h2 className="text-xl font-bold text-foreground">
                        Reserva de Laboratório
                    </h2>
                    <p className="text-sm text-muted-foreground mt-0.5">
                        Pesquise e filtre os espaços disponíveis.
                    </p>
                </header>

                <div className="flex flex-col sm:flex-row gap-3">
                    {/* Barra de Pesquisa Principal */}
                    <div className="relative flex-1">
                        <div className="absolute inset-y-0 left-0 flex items-center pl-3 text-muted-foreground">
                            <Search className="w-4 h-4" />
                        </div>
                        <Input
                            type="text"
                            placeholder="Buscar por laboratório ou sala..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-9 w-full focus-visible:bg-transparent"
                        />
                    </div>

                    {/* Filtros em linha */}
                    <div className="flex flex-wrap sm:flex-nowrap gap-3 items-center">
                        {/* Dropdown de Recursos (Multiseleção) */}
                        <Popover open={isDropdownOpen} onOpenChange={setIsDropdownOpen}>
                            <PopoverTrigger
                                render={
                                    <Button
                                        variant="outline"
                                        className="w-full sm:w-[140px] justify-between bg-muted/30 hover:bg-muted/60 font-normal transition-colors"
                                    />
                                }
                            >
                                <div className="flex items-center gap-2 truncate">
                                    <Filter className="w-4 h-4 text-muted-foreground shrink-0" />
                                    {selectedResources.length > 0 ? (
                                        <span className="truncate">{selectedResources.length} recurso{selectedResources.length > 1 ? "s" : ""}</span>
                                    ) : (
                                        <span>Recursos</span>
                                    )}
                                </div>
                            </PopoverTrigger>
                            <PopoverContent className="w-64 p-2 shadow-lg rounded-xl" align="end">
                                <div className="space-y-2">
                                    <Input
                                        placeholder="Filtrar recursos..."
                                        value={resourceQuery}
                                        onChange={(e) => setResourceQuery(e.target.value)}
                                        className="h-8 text-xs bg-muted/40"
                                    />
                                    <ScrollArea className="h-40">
                                        {filteredResources.length > 0 ? (
                                            <div className="flex flex-col gap-1 pr-3">
                                                {filteredResources.map(resource => (
                                                    <label
                                                        key={resource}
                                                        className="flex items-center gap-2.5 p-2 hover:bg-muted/50 rounded-md cursor-pointer transition-colors"
                                                    >
                                                        <input
                                                            type="checkbox"
                                                            className="h-4 w-4 rounded border-black/20 text-primary accent-primary"
                                                            checked={selectedResources.includes(resource)}
                                                            onChange={() => toggleResource(resource as SpaceResource)}
                                                        />
                                                        <span className="text-sm font-medium text-foreground">{resource}</span>
                                                    </label>
                                                ))}
                                            </div>
                                        ) : (
                                            <div className="p-3 text-xs text-center text-muted-foreground">Nenhum recurso encontrado.</div>
                                        )}
                                    </ScrollArea>
                                </div>
                            </PopoverContent>
                        </Popover>

                        {/* Input de Capacidade */}
                        <div className="relative w-full sm:w-[140px]">
                            <div className="absolute inset-y-0 left-0 flex items-center pl-3 text-muted-foreground">
                                <Users className="w-4 h-4" />
                            </div>
                            <Input
                                type="number"
                                placeholder="Lugares..."
                                min={1}
                                value={minCapacity}
                                onChange={(e) => setMinCapacity(e.target.value ? Number(e.target.value) : "")}
                                className="pl-10 text-left w-full bg-muted/30 focus-visible:bg-transparent transition-colors"
                            />
                        </div>
                    </div>
                </div>

                {/* Badges de recursos selecionados visíveis dinamicamente */}
                {selectedResources.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-4 pt-3 border-t border-border/60">
                        {selectedResources.map(resource => (
                            <span key={resource} className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold bg-primary/10 text-primary rounded-full border border-primary/20">
                                {resource}
                                <button
                                    type="button"
                                    onClick={(e) => removeResource(resource, e)}
                                    className="hover:bg-primary/20 rounded-full cursor-pointer p-0.5 transition-colors"
                                >
                                    <X className="w-3 h-3" />
                                </button>
                            </span>
                        ))}
                        <button 
                            type="button" 
                            onClick={() => setSelectedResources([])}
                            className="text-xs font-semibold text-muted-foreground hover:text-foreground cursor-pointer px-2 transition-colors focus:outline-none"
                        >
                            Limpar Filtros
                        </button>
                    </div>
                )}
            </div>
        </section>
    )
}