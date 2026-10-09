import { PlusIcon, SearchIcon } from "lucide-react";
import { useEffect, useState } from "react";
import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
  ComboboxValue,
} from "@/components/ui/combobox";
import { Field, FieldLabel } from "@/components/ui/field";
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/components/ui/input-group";
import { Button } from "../ui/button";
import { useDebounce } from "ahooks";

const statusRecord: Record<string, boolean | undefined> = {
  "Todos os status": undefined,
  "Ativo": true,
  "Inativo": false,
};

const canBeReservedRecord: Record<string, boolean | undefined> = {
  "Todos os status": undefined,
  "Sim": true,
  "Não": false,
};

export type ResourceFilters = {
  search: string;
  canBeReserved: boolean | undefined;
  status: boolean | undefined;
};

type ResourceSearchBarProps = {
  onSearch: (filters: ResourceFilters) => void;
  onAddNewResource: () => void;
};

export function ManageResourceSearchBar({ onSearch, onAddNewResource }: ResourceSearchBarProps) {
  const [search, setSearch] = useState("");
  const canBeReservedOptions = ["Todos os status", "Sim", "Não"];
  const [canBeReserved, setCanBeReserved] = useState(canBeReservedOptions[0]);
  const statuses = ["Todos os status", "Ativo", "Inativo"];
  const [status, setStatus] = useState(statuses[0]);

  const debouncedFilters = useDebounce(
    { search, status: statusRecord[status], canBeReserved: canBeReservedRecord[canBeReserved] } as ResourceFilters,
    { wait: 500 },
  );

  useEffect(() => {
    onSearch(debouncedFilters);
  }, [debouncedFilters]);

  return (
    <div className="flex flex-col gap-4 rounded-lg border bg-white p-4 shadow-md hover:shadow-lg dark:border-violet-500/10 dark:bg-white/5 dark:shadow-violet-300/15">
      <Field className="min-w-50 flex-1">
        <FieldLabel htmlFor="space-search" className="font-bold">
          Pesquisar
        </FieldLabel>
        <InputGroup>
          <InputGroupInput
            id="space-search"
            placeholder="Buscar por nome..."
            onInput={(e) => setSearch(e.currentTarget.value)}
          />
          <InputGroupAddon align="inline-start">
            <SearchIcon className="text-muted-foreground" />
          </InputGroupAddon>
        </InputGroup>
      </Field>

      <Field className="w-full">
        <FieldLabel htmlFor="space-status" className="font-bold">
          Pode reservar
        </FieldLabel>
        <Combobox
          items={canBeReservedOptions}
          value={canBeReserved}
          onValueChange={(value) => setCanBeReserved(value ?? canBeReservedOptions[0])}
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

      <Field className="w-full">
        <FieldLabel htmlFor="space-status" className="font-bold">
          Status
        </FieldLabel>
        <Combobox items={statuses} value={status} onValueChange={(value) => setStatus(value ?? statuses[0])}>
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

      <Button className="w-full shrink-0 lg:w-auto" type="button" onClick={onAddNewResource}>
        <PlusIcon />
        Adicionar recurso
      </Button>
    </div>
  );
}
