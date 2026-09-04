import { PlusIcon, SearchIcon } from "lucide-react"
import { useState } from "react"
import { Button } from "#/components/ui/button"
import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
  ComboboxValue,
} from "#/components/ui/combobox"
import { Field, FieldLabel } from "#/components/ui/field"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "#/components/ui/input-group"

export function ManageSpaceSearchBar() {
	const statuses = ["Todos os status", "Ativo", "Inativo"]
	const [status, setStatus] = useState(statuses[0])

	return (
		<div className="flex flex-col gap-4 rounded-lg border bg-white p-4 shadow-md hover:shadow-lg dark:border-violet-500/10 dark:bg-white/5 dark:shadow-violet-300/15 lg:flex-row lg:items-end">
			<Field className="min-w-60 flex-1">
				<FieldLabel htmlFor="space-search">Pesquisar</FieldLabel>
				<InputGroup>
					<InputGroupInput
						id="space-search"
						placeholder="Buscar por laboratório ou sala..."
					/>
					<InputGroupAddon align="inline-start">
						<SearchIcon className="text-muted-foreground" />
					</InputGroupAddon>
				</InputGroup>
			</Field>

			<Field className="w-full min-w-40 lg:w-48">
				<FieldLabel htmlFor="space-status">Status</FieldLabel>
				<Combobox
					items={statuses}
					value={status}
					onValueChange={(value) => setStatus(value ?? statuses[0])}
				>
					<ComboboxInput
						id="space-status"
						aria-label="Filtrar por status"
						placeholder="Todos os status"
						className="w-full"
						showClear={false}
					/>
					<ComboboxContent>
						<ComboboxEmpty>Nenhum status encontrado.</ComboboxEmpty>
						<ComboboxList>
							{(item) => (
								<ComboboxItem key={item} value={item}>
									<ComboboxValue>{item}</ComboboxValue>
								</ComboboxItem>
							)}
						</ComboboxList>
					</ComboboxContent>
				</Combobox>
			</Field>

			<Button className="w-full shrink-0 lg:w-auto" type="button">
				<PlusIcon />
				Adicionar novo espaço
			</Button>
		</div>
	)
}
