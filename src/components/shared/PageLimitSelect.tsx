import { PAGE_LIMIT_OPTIONS } from "#/lib/utils/pagination";
import { Field, FieldLabel } from "@/components/ui/field";
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select";
import { cn } from "@/lib/utils";

type PageLimitSelectProps = {
  id: string;
  value: number;
  onValueChange: (value: number) => void;
  label?: string;
  className?: string;
  labelClassName?: string;
  selectClassName?: string;
};

/** Quantidade de itens por página (10 a 50, de 10 em 10). Select nativo: só aceita valores válidos. */
export function PageLimitSelect({
  id,
  value,
  onValueChange,
  label = "Itens por página",
  className,
  labelClassName,
  selectClassName,
}: PageLimitSelectProps) {
  return (
    <Field className={className}>
      <FieldLabel htmlFor={id} className={cn("font-bold", labelClassName)}>
        {label}
      </FieldLabel>
      <NativeSelect
        id={id}
        className={cn("w-full", selectClassName)}
        value={value}
        onChange={(event) => onValueChange(Number(event.target.value))}
      >
        {PAGE_LIMIT_OPTIONS.map((option) => (
          <NativeSelectOption key={option} value={option}>
            {option}
          </NativeSelectOption>
        ))}
      </NativeSelect>
    </Field>
  );
}
