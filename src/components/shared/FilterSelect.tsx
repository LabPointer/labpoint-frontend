import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from "@/components/ui/combobox";
import { Field, FieldLabel } from "@/components/ui/field";

export type FilterOption<T> = { label: string; value: T };

type FilterSelectProps<T> = {
  id: string;
  label: string;
  options: readonly FilterOption<T>[];
  value: T;
  onValueChange: (value: T) => void;
  className?: string;
};

/**
 * Select de opções estáticas e tipadas. O valor devolvido já é o valor de domínio
 * (ex.: `undefined` para "Todos", `true`/`false`, índice do cargo), sem mapas string → valor.
 * A primeira opção é tratada como padrão quando o combobox é limpo.
 */
export function FilterSelect<T>({ id, label, options, value, onValueChange, className }: FilterSelectProps<T>) {
  const selected = options.find((option) => Object.is(option.value, value)) ?? options[0];

  return (
    <Field className={className}>
      <FieldLabel htmlFor={id} className="font-bold">
        {label}
      </FieldLabel>
      <Combobox
        items={options}
        value={selected}
        onValueChange={(option) => onValueChange((option ?? options[0]).value)}
        itemToStringLabel={(option) => option.label}
        isItemEqualToValue={(a, b) => Object.is(a.value, b.value)}
      >
        <ComboboxInput id={id} aria-label={label} placeholder={options[0].label} className="w-full" showClear={false} />
        <ComboboxContent>
          <ComboboxEmpty>Nenhuma opção encontrada.</ComboboxEmpty>
          <ComboboxList>
            {(option: FilterOption<T>) => (
              <ComboboxItem key={String(option.value)} value={option}>
                {option.label}
              </ComboboxItem>
            )}
          </ComboboxList>
        </ComboboxContent>
      </Combobox>
    </Field>
  );
}
