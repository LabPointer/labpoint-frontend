import { CalendarIcon, ChevronDownIcon, FilterIcon, SearchIcon } from "lucide-react";
import React, { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	Collapsible,
	CollapsibleContent,
	CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Field, FieldLabel } from "../ui/field";
import { Input } from "@/components/ui/input";
import {
	InputGroup,
	InputGroupAddon,
	InputGroupInput,
} from "@/components/ui/input-group";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";

export function SpaceSearchBar() {
	const periods = [
		"M_AULA_1",
		"M_AULA_2",
		"M_AULA_3",
		"M_AULA_4",
		"M_AULA_5",
		"V_AULA_1",
		"V_AULA_2",
		"V_AULA_3",
		"V_AULA_4",
		"V_AULA_5",
		"N_AULA_1",
		"N_AULA_2",
		"N_AULA_3",
		"N_AULA_4",
	] as const;

	const formatPeriodLabel = (p: string) => {
		const [shift, , num] = p.split("_");
		const shiftName =
			shift === "M" ? "Manhã" : shift === "V" ? "Tarde" : "Noite";
		return `${shiftName} - Aula ${num}`;
	};

	const [isAdvancedOpen, setIsAdvancedOpen] = useState(false);
	const [selectedPeriods, setSelectedPeriods] = useState<string[]>([]);
	const [startDate, setStartDate] = useState("");
	const [endDate, setEndDate] = useState("");

	const togglePeriod = (period: string) => {
		setSelectedPeriods((prev) =>
			prev.includes(period)
				? prev.filter((p) => p !== period)
				: [...prev, period]
		);
	};

	return (
		<div className="bg-white dark:bg-white/5 rounded-md border dark:border-violet-500/10 shadow-md hover:shadow-lg p-4 dark:shadow-violet-300/15">
			<div className="flex flex-col gap-4">
				{/* Campo de pesquisa principal */}
				<Field className="w-full">
					<FieldLabel className="text-sm font-semibold text-neutral-800 dark:text-neutral-200" htmlFor="search-spaces">
						Pesquisar
					</FieldLabel>
					<InputGroup className="h-10">
						<InputGroupInput
							id="search-spaces"
							placeholder="Buscar por nome ou departamento..."
							className="text-sm"
						/>
						<InputGroupAddon align="inline-start">
							<SearchIcon className="size-4 text-muted-foreground" />
						</InputGroupAddon>
					</InputGroup>
				</Field>

				{/* Filtros em linha (Capacidade e Equipamentos) */}
				<div className="grid grid-cols-1 gap-4 md:grid-cols-2">
					<Field className="w-full">
						<FieldLabel className="text-sm font-semibold text-neutral-800 dark:text-neutral-200" htmlFor="capacity-select">
							Capacidade
						</FieldLabel>
						<Select defaultValue="all">
							<SelectTrigger id="capacity-select" className="w-full h-10">
								<SelectValue placeholder="Qualquer capacidade" />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="all">Qualquer capacidade</SelectItem>
								<SelectItem value="20">Até 20 lugares</SelectItem>
								<SelectItem value="30">Até 30 lugares</SelectItem>
								<SelectItem value="50">Até 50 lugares</SelectItem>
								<SelectItem value="100">50+ lugares</SelectItem>
							</SelectContent>
						</Select>
					</Field>

					<Field className="w-full">
						<FieldLabel className="text-sm font-semibold text-neutral-800 dark:text-neutral-200" htmlFor="equipment-select">
							Equipamentos
						</FieldLabel>
						<Select defaultValue="all">
							<SelectTrigger id="equipment-select" className="w-full h-10">
								<SelectValue placeholder="Todos equipamentos" />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="all">Todos equipamentos</SelectItem>
								<SelectItem value="computers">Computadores</SelectItem>
								<SelectItem value="projector">Projetor</SelectItem>
								<SelectItem value="screen">Telão</SelectItem>
								<SelectItem value="notebooks">Notebooks</SelectItem>
								<SelectItem value="tubes">Tubos de ensaio</SelectItem>
							</SelectContent>
						</Select>
					</Field>
				</div>

				{/* Filtros avançados com Collapsible */}
				<Collapsible open={isAdvancedOpen} onOpenChange={setIsAdvancedOpen} className="w-full pt-1">
					<div className="flex items-center justify-between">
						<CollapsibleTrigger>
							<Button
								type="button"
								variant="ghost"
								size="sm"
								className="gap-2 px-2 text-xs font-semibold text-neutral-600 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-100"
							>
								<FilterIcon className="size-3.5" />
								<span>Filtros avançados</span>
								<ChevronDownIcon
									className={`size-3.5 transition-transform duration-200 ${
										isAdvancedOpen ? "rotate-180" : ""
									}`}
								/>
							</Button>
						</CollapsibleTrigger>

						{(selectedPeriods.length > 0 || startDate || endDate) && (
							<Button
								type="button"
								variant="ghost"
								size="sm"
								className="text-xs text-muted-foreground hover:text-foreground h-auto p-0"
								onClick={() => {
									setSelectedPeriods([]);
									setStartDate("");
									setEndDate("");
								}}
							>
								Limpar filtros
							</Button>
						)}
					</div>

					<CollapsibleContent className="mt-4 flex flex-col gap-4 border-t border-dashed pt-4 dark:border-neutral-800">
						{/* Datas de Início e Fim */}
						<div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
							<Field className="w-full">
								<FieldLabel htmlFor="start-date" className="text-xs font-medium text-muted-foreground">
									Data de início
								</FieldLabel>
								<InputGroup className="h-9">
									<InputGroupInput
										id="start-date"
										type="date"
										value={startDate}
										onChange={(e) => setStartDate(e.target.value)}
										className="text-xs"
									/>
									<InputGroupAddon align="inline-start">
										<CalendarIcon className="size-3.5 text-muted-foreground" />
									</InputGroupAddon>
								</InputGroup>
							</Field>

							<Field className="w-full">
								<FieldLabel htmlFor="end-date" className="text-xs font-medium text-muted-foreground">
									Data de fim
								</FieldLabel>
								<InputGroup className="h-9">
									<InputGroupInput
										id="end-date"
										type="date"
										value={endDate}
										onChange={(e) => setEndDate(e.target.value)}
										className="text-xs"
									/>
									<InputGroupAddon align="inline-start">
										<CalendarIcon className="size-3.5 text-muted-foreground" />
									</InputGroupAddon>
								</InputGroup>
							</Field>
						</div>

						{/* Períodos */}
						<Field className="w-full">
							<div className="flex items-center justify-between mb-1">
								<FieldLabel className="text-xs font-medium text-muted-foreground">
									Períodos das aulas
								</FieldLabel>
								{selectedPeriods.length > 0 && (
									<Badge variant="secondary" className="text-[10px] px-1.5 py-0 h-4">
										{selectedPeriods.length} selecionado(s)
									</Badge>
								)}
							</div>
							<div className="flex flex-wrap gap-1.5">
								{periods.map((period) => {
									const isSelected = selectedPeriods.includes(period);
									return (
										<button
											key={period}
											type="button"
											onClick={() => togglePeriod(period)}
											className={`inline-flex items-center rounded-md border px-2 py-1 text-xs font-medium transition-colors ${
												isSelected
													? "border-primary bg-primary text-primary-foreground shadow-xs"
													: "border-input bg-transparent text-neutral-700 hover:bg-muted dark:text-neutral-300"
											}`}
										>
											{formatPeriodLabel(period)}
										</button>
									);
								})}
							</div>
						</Field>
					</CollapsibleContent>
				</Collapsible>
			</div>
		</div>
	);
}
