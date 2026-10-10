import { useMemo, useState } from "react";
import { useDebouncedValue } from "#/hooks/use-debounced-value";
import { useResources } from "#/lib/queries/resources";
import { useSubjects } from "#/lib/queries/subjects";
import { RemoteCombobox, RemoteMultiCombobox, type RemoteOption } from "./RemoteCombobox";

/** Máximo de itens retornados pelas buscas remotas dos comboboxes. */
const OPTIONS_LIMIT = 20;

const toOption = ({ id, name }: { id: number | string; name: string }): RemoteOption => ({ id: Number(id), name });

/** Texto digitado + versão com debounce (o servidor só é consultado quando o usuário pára de digitar). */
function useRemoteSearch() {
  const [text, setText] = useState("");
  const debounced = useDebouncedValue(text, 300);
  return { setText, search: debounced };
}

function useSubjectOptions(enabledOnly: boolean) {
  const { search, setText } = useRemoteSearch();
  const query = useSubjects({ name: search, enabled: enabledOnly ? true : undefined, limit: OPTIONS_LIMIT });
  const options = useMemo(() => (query.data ?? []).map(toOption), [query.data]);
  return { options, setText, isLoading: query.isFetching, isError: query.isError };
}

type SubjectSelectProps = {
  id: string;
  label?: string;
  value: RemoteOption | undefined;
  onValueChange: (value: RemoteOption | undefined) => void;
  /** Texto da opção que limpa o filtro (retorna `undefined`). Omitido = sem opção "qualquer". */
  anyLabel?: string;
  /** Lista apenas matérias ativas (use `true` nos formulários de edição). */
  enabledOnly?: boolean;
  className?: string;
};

export function SubjectSelect({
  id,
  label = "Matéria",
  value,
  onValueChange,
  anyLabel,
  enabledOnly = false,
  className,
}: SubjectSelectProps) {
  const { options, setText, isLoading, isError } = useSubjectOptions(enabledOnly);

  return (
    <RemoteCombobox
      id={id}
      label={label}
      className={className}
      options={options}
      isLoading={isLoading}
      isError={isError}
      onSearchChange={setText}
      value={value}
      onValueChange={onValueChange}
      anyLabel={anyLabel}
      placeholder="Selecione uma matéria..."
      emptyText="Nenhuma matéria encontrada."
    />
  );
}

type MultiSelectProps = {
  id: string;
  label?: string;
  value: RemoteOption[];
  onValueChange: (value: RemoteOption[]) => void;
  /** Lista apenas itens ativos (use `true` em telas de usuário final). */
  enabledOnly?: boolean;
  className?: string;
};

export function SubjectMultiSelect({
  id,
  label = "Matérias",
  value,
  onValueChange,
  enabledOnly = false,
  className,
}: MultiSelectProps) {
  const { options, setText, isLoading, isError } = useSubjectOptions(enabledOnly);

  return (
    <RemoteMultiCombobox
      id={id}
      label={label}
      className={className}
      options={options}
      isLoading={isLoading}
      isError={isError}
      onSearchChange={setText}
      value={value}
      onValueChange={onValueChange}
      placeholder="Qualquer matéria"
      emptyText="Nenhuma matéria encontrada."
    />
  );
}

export function ResourceMultiSelect({
  id,
  label = "Recursos",
  value,
  onValueChange,
  enabledOnly = false,
  canReserve,
  className,
}: MultiSelectProps & { canReserve?: boolean }) {
  const { search, setText } = useRemoteSearch();
  const query = useResources({
    name: search,
    enabled: enabledOnly ? true : undefined,
    canReserve,
    limit: OPTIONS_LIMIT,
  });
  const options = useMemo(() => (query.data ?? []).map(toOption), [query.data]);

  return (
    <RemoteMultiCombobox
      id={id}
      label={label}
      className={className}
      options={options}
      isLoading={query.isFetching}
      isError={query.isError}
      onSearchChange={setText}
      value={value}
      onValueChange={onValueChange}
      placeholder="Qualquer recurso"
      emptyText="Nenhum recurso encontrado."
    />
  );
}
