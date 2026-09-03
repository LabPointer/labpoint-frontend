import { SearchIcon } from "lucide-react";
import { useState } from "react";
import {
	InputGroup,
	InputGroupAddon,
	InputGroupInput,
} from "@/components/ui/input-group";
import {
	Combobox,
	ComboboxChip,
	ComboboxChips,
	ComboboxChipsInput,
	ComboboxContent,
	ComboboxEmpty,
	ComboboxItem,
	ComboboxList,
	ComboboxValue,
	useComboboxAnchor,
} from "@/components/ui/combobox";
import { Field, FieldLabel } from "./ui/field";
import React from "react";

export function SpaceSearchBar() {
	const resources = [
		"Notebooks",
		"Computadores",
		"Projetor",
		"Telao",
		"Tubos de ensaio",
	] as const;

	const subjects = ["ADS", "Quimica analista"] as const;

	const anchor = useComboboxAnchor();

	return (
		<div className="bg-white dark:bg-white/5 rounded-md border dark:border-violet-500/10 shadow-md hover:shadow-lg p-4 dark:shadow-violet-300/15">
			<div className="flex flex-col gap-4">
				<Field className="w-full">
					<FieldLabel className="font-bold" htmlFor="inline-start-input">
						Pesquisar
					</FieldLabel>
					<InputGroup>
						<InputGroupInput
							id="inline-start-input"
							placeholder="Buscar por laboratório ou sala..."
						/>
						<InputGroupAddon align="inline-start">
							<SearchIcon className="text-muted-foreground" />
						</InputGroupAddon>
					</InputGroup>
				</Field>

				<Field className="w-full">
					<FieldLabel className="font-bold" htmlFor="capacity-input">
						Capacidade
					</FieldLabel>
					<InputGroup>
						<InputGroupInput
							id="capacity-input"
							type="number"
							placeholder="Digite a capacidade (20-150)..."
							min="20"
							max="150"
						/>
					</InputGroup>
				</Field>

				<Field className="w-full">
					<FieldLabel className="font-bold" htmlFor="resources-combobox">
						Recursos
					</FieldLabel>
					<Combobox
						multiple
						autoHighlight
						items={resources}
						defaultValue={[resources[0]]}
					>
						<ComboboxChips ref={anchor} className="w-full overflow-hidden">
							<ComboboxValue>
								{(values) => (
									<React.Fragment>
										{values.map((value: string) => (
											<ComboboxChip key={value}>{value}</ComboboxChip>
										))}
										<ComboboxChipsInput />
									</React.Fragment>
								)}
							</ComboboxValue>
						</ComboboxChips>
						<ComboboxContent anchor={anchor}>
							<ComboboxEmpty>No items found.</ComboboxEmpty>
							<ComboboxList>
								{(item) => (
									<ComboboxItem key={item} value={item}>
										{item}
									</ComboboxItem>
								)}
							</ComboboxList>
						</ComboboxContent>
					</Combobox>
				</Field>

				<Field className="w-full">
					<FieldLabel className="font-bold" htmlFor="resources-combobox">
						Disciplinas
					</FieldLabel>
					<Combobox
						multiple
						autoHighlight
						items={subjects}
						defaultValue={[subjects[0]]}
					>
						<ComboboxChips ref={anchor} className="w-full overflow-hidden">
							<ComboboxValue>
								{(values) => (
									<React.Fragment>
										{values.map((value: string) => (
											<ComboboxChip key={value}>{value}</ComboboxChip>
										))}
										<ComboboxChipsInput />
									</React.Fragment>
								)}
							</ComboboxValue>
						</ComboboxChips>
						<ComboboxContent anchor={anchor}>
							<ComboboxEmpty>No items found.</ComboboxEmpty>
							<ComboboxList>
								{(item) => (
									<ComboboxItem key={item} value={item}>
										{item}
									</ComboboxItem>
								)}
							</ComboboxList>
						</ComboboxContent>
					</Combobox>
				</Field>
			</div>
		</div>
	);
}
