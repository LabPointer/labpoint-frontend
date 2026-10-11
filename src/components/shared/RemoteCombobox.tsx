import { Fragment, useMemo } from "react";
import {
  Combobox,
  ComboboxChip,
  ComboboxChips,
  ComboboxChipsInput,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
  ComboboxValue,
  useComboboxAnchor,
} from "@/components/ui/combobox";
import { Field, FieldLabel } from "@/components/ui/field";

export type RemoteOption<TId extends number | string = number> = { id: TId; name: string };

type CommonProps<TId extends number | string = number> = {
  id: string;
  label: string;
  options: readonly RemoteOption<TId>[];
  isLoading: boolean;
  isError: boolean;
  /** Chamado com o texto digitado (e "" ao fechar). O pai é quem refaz a query. */
  onSearchChange: (text: string) => void;
  placeholder?: string;
  emptyText?: string;
  className?: string;
};

function emptyMessage({ isLoading, isError, emptyText }: Pick<CommonProps, "isLoading" | "isError" | "emptyText">) {
  if (isError) return "Erro ao carregar opções.";
  if (isLoading) return "Carregando...";
  return emptyText ?? "Nenhum resultado encontrado.";
}

type SingleProps = CommonProps & {
  value: RemoteOption | undefined;
  onValueChange: (value: RemoteOption | undefined) => void;
  /** Quando informado, adiciona a opção "qualquer" que devolve `undefined`. */
  anyLabel?: string;
};

const ANY_ID = -1;

export function RemoteCombobox({
  id,
  label,
  options,
  isLoading,
  isError,
  onSearchChange,
  value,
  onValueChange,
  anyLabel,
  placeholder,
  emptyText,
  className,
}: SingleProps) {
  const anyOption = useMemo<RemoteOption | undefined>(
    () => (anyLabel ? { id: ANY_ID, name: anyLabel } : undefined),
    [anyLabel],
  );
  const items = useMemo(() => (anyOption ? [anyOption, ...options] : [...options]), [anyOption, options]);
  const selected = value ?? anyOption ?? null;

  return (
    <Field className={className}>
      {label && (
        <FieldLabel htmlFor={id} className="font-bold">
          {label}
        </FieldLabel>
      )}
      <Combobox
        items={items}
        value={selected}
        onValueChange={(option) => onValueChange(!option || option.id === ANY_ID ? undefined : option)}
        itemToStringLabel={(option) => option.name}
        isItemEqualToValue={(a, b) => a.id === b.id}
        // a busca é feita no servidor: desliga o filtro local do base-ui
        filter={null}
        onInputValueChange={(text, details) => {
          if (details.reason === "input-change") onSearchChange(text);
        }}
        onOpenChange={(open) => {
          if (!open) onSearchChange("");
        }}
      >
        <ComboboxInput id={id} placeholder={placeholder ?? anyLabel} className="w-full" showClear={false} />
        <ComboboxContent>
          <ComboboxEmpty>{emptyMessage({ isLoading, isError, emptyText })}</ComboboxEmpty>
          <ComboboxList>
            {(option: RemoteOption) => (
              <ComboboxItem key={option.id} value={option}>
                {option.name}
              </ComboboxItem>
            )}
          </ComboboxList>
        </ComboboxContent>
      </Combobox>
    </Field>
  );
}

type MultiProps<TId extends number | string> = Omit<CommonProps<TId>, "onSearchChange"> & {
  value: RemoteOption<TId>[];
  onValueChange: (value: RemoteOption<TId>[]) => void;
  /** Sem `onSearchChange` o filtro é feito localmente (listas pequenas e já carregadas). */
  onSearchChange?: (text: string) => void;
  disabled?: boolean;
};

export function RemoteMultiCombobox<TId extends number | string = number>({
  id,
  label,
  options,
  isLoading,
  isError,
  onSearchChange,
  value,
  onValueChange,
  placeholder,
  emptyText,
  disabled,
  className,
}: MultiProps<TId>) {
  const anchor = useComboboxAnchor();

  // mantém os já selecionados na lista mesmo que a busca atual não os retorne
  const items = useMemo(() => {
    const byId = new Map<TId, RemoteOption<TId>>();
    for (const option of [...value, ...options]) byId.set(option.id, option);
    return [...byId.values()];
  }, [value, options]);

  return (
    <Field className={className}>
      {label && (
        <FieldLabel htmlFor={id} className="font-bold">
          {label}
        </FieldLabel>
      )}
      <Combobox
        multiple
        autoHighlight
        disabled={disabled}
        items={items}
        value={value}
        onValueChange={onValueChange}
        itemToStringLabel={(option) => option.name}
        isItemEqualToValue={(a, b) => a.id === b.id}
        filter={onSearchChange ? null : undefined}
        onInputValueChange={(text, details) => {
          if (details.reason === "input-change") onSearchChange?.(text);
        }}
        onOpenChange={(open) => {
          if (!open) onSearchChange?.("");
        }}
      >
        <ComboboxChips ref={anchor} className="w-full">
          <ComboboxValue>
            {(selected: RemoteOption<TId>[]) => (
              <Fragment>
                {selected.map((option) => (
                  <ComboboxChip key={option.id}>{option.name}</ComboboxChip>
                ))}
                <ComboboxChipsInput id={id} placeholder={selected.length > 0 ? "" : placeholder} />
              </Fragment>
            )}
          </ComboboxValue>
        </ComboboxChips>
        <ComboboxContent anchor={anchor}>
          <ComboboxEmpty>{emptyMessage({ isLoading, isError, emptyText })}</ComboboxEmpty>
          <ComboboxList>
            {(option: RemoteOption<TId>) => (
              <ComboboxItem key={option.id} value={option}>
                {option.name}
              </ComboboxItem>
            )}
          </ComboboxList>
        </ComboboxContent>
      </Combobox>
    </Field>
  );
}
