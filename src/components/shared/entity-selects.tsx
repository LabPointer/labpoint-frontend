import { useMemo, useState } from "react";
import { useDebouncedValue } from "#/hooks/use-debounced-value";
import { useAccounts } from "#/lib/queries/accounts";
import { useResources } from "#/lib/queries/resources";
import { SCHEDULE_OPTIONS_LIMIT, scheduleLabel, sortSchedules, useSchedules } from "#/lib/queries/schedules";
import { useSpaces } from "#/lib/queries/spaces";
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

type ResourceKindMultiSelectProps = MultiSelectProps & {
  /** `false` = recursos fixos de sala (equipamentos); `true` = recursos reserváveis. */
  reservable: boolean;
};

/** Recursos buscados no servidor pelo nome; o tipo (fixo ou reservável) define quais aparecem. */
function ResourceKindMultiSelect({
  id,
  label = "Recursos",
  value,
  onValueChange,
  enabledOnly = false,
  className,
  reservable,
}: ResourceKindMultiSelectProps) {
  const { search, setText } = useRemoteSearch();
  const query = useResources({
    name: search,
    enabled: enabledOnly ? true : undefined,
    reservable,
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

/**
 * Recursos FIXOS de espaço (filtros de busca de sala e associação a um espaço).
 * Recursos reserváveis nunca aparecem aqui: eles não podem ser associados a um espaço.
 */
export function ResourceMultiSelect(props: MultiSelectProps) {
  return <ResourceKindMultiSelect {...props} reservable={false} />;
}

/** Recursos reserváveis (filtro do histórico de reservas de recurso). */
export function ReservableResourceMultiSelect(props: MultiSelectProps) {
  return <ResourceKindMultiSelect {...props} reservable />;
}

/** Máximo de salas sugeridas no combobox (a lista é refeita conforme o usuário digita). */
const SPACE_OPTIONS_LIMIT = 10;

/** Salas: busca no servidor por nome ou descrição (`/space?SearchQuery`), no máximo 10 opções. */
export function SpaceMultiSelect({
  id,
  label = "Salas",
  value,
  onValueChange,
  className,
}: Omit<MultiSelectProps, "enabledOnly">) {
  const { search, setText } = useRemoteSearch();
  const query = useSpaces({ search, limit: SPACE_OPTIONS_LIMIT });
  // o backend devolve Limit + 1 itens (indicador de próxima página): mostramos só os 10 primeiros
  const options = useMemo(() => (query.data ?? []).slice(0, SPACE_OPTIONS_LIMIT).map(toOption), [query.data]);

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
      placeholder="Nome ou descrição da sala"
      emptyText="Nenhuma sala encontrada."
    />
  );
}

type ScheduleMultiSelectProps = Pick<MultiSelectProps, "id" | "value" | "onValueChange" | "className"> & {
  label?: string;
  /** Lista apenas horários ativos. */
  enabledOnly?: boolean;
};

/** Horários: poucos itens, até 50 carregados de uma vez (`/schedule`) e filtrados localmente. */
export function ScheduleMultiSelect({
  id,
  label = "Horários",
  value,
  onValueChange,
  enabledOnly = false,
  className,
}: ScheduleMultiSelectProps) {
  const query = useSchedules({ enabled: enabledOnly ? true : undefined, limit: SCHEDULE_OPTIONS_LIMIT });
  const options = useMemo<RemoteOption[]>(
    () =>
      sortSchedules(query.data ?? []).map((schedule) => ({ id: Number(schedule.id), name: scheduleLabel(schedule) })),
    [query.data],
  );

  return (
    <RemoteMultiCombobox
      id={id}
      label={label}
      className={className}
      options={options}
      isLoading={query.isPending}
      isError={query.isError}
      value={value}
      onValueChange={onValueChange}
      placeholder="Qualquer horário"
      emptyText="Nenhum horário encontrado."
    />
  );
}

type AccountMultiSelectProps = {
  id: string;
  label?: string;
  value: RemoteOption<string>[];
  onValueChange: (value: RemoteOption<string>[]) => void;
  className?: string;
};

/** Usuários: busca no servidor por nome, matrícula ou e-mail (`/account/admin`), até 20 resultados. */
export function AccountMultiSelect({
  id,
  label = "Usuários",
  value,
  onValueChange,
  className,
}: AccountMultiSelectProps) {
  const { search, setText } = useRemoteSearch();
  const query = useAccounts({ search, limit: OPTIONS_LIMIT });
  const options = useMemo<RemoteOption<string>[]>(
    () =>
      (query.data ?? []).map((account) => ({ id: account.id, name: `${account.username} (${account.registration})` })),
    [query.data],
  );

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
      placeholder="Nome, matrícula ou e-mail"
      emptyText="Nenhum usuário encontrado."
    />
  );
}
