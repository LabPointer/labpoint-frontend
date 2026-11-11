import { PAGE_LIMIT_OPTIONS } from "#/lib/utils/pagination";
import { Field, FieldLabel } from "@/components/ui/field";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";

type PageLimitSelectProps = {
  id: string;
  value: number;
  onValueChange: (value: number) => void;
  label?: string;
  className?: string;
  labelClassName?: string;
  /** Classes do botão do select. */
  selectClassName?: string;
};

const items = PAGE_LIMIT_OPTIONS.map((option) => ({ label: String(option), value: option }));

/** Quantidade de itens por página (10 a 50, de 10 em 10). Lista fechada: só aceita valores válidos. */
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
      <Select items={items} value={value} onValueChange={(next) => next !== null && onValueChange(Number(next))}>
        <SelectTrigger id={id} className={cn("w-full", selectClassName)}>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {items.map((item) => (
            <SelectItem key={item.value} value={item.value}>
              {item.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </Field>
  );
}
