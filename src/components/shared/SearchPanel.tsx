import { SearchIcon } from "lucide-react";
import type { ReactNode } from "react";
import { Field, FieldLabel } from "@/components/ui/field";
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/components/ui/input-group";
import { cn } from "@/lib/utils";

/** Container padrão (card) das barras de pesquisa das telas admin. */
export function SearchPanel({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div
      className={cn(
        "flex flex-col gap-4 rounded-lg border bg-white p-4 shadow-md hover:shadow-lg dark:border-violet-500/10 dark:bg-white/5 dark:shadow-violet-300/15",
        className,
      )}
    >
      {children}
    </div>
  );
}

type SearchTextFieldProps = {
  id: string;
  label?: string;
  placeholder: string;
  value: string;
  onValueChange: (value: string) => void;
};

export function SearchTextField({ id, label = "Pesquisar", placeholder, value, onValueChange }: SearchTextFieldProps) {
  return (
    <Field className="min-w-50 flex-1">
      <FieldLabel htmlFor={id} className="font-bold">
        {label}
      </FieldLabel>
      <InputGroup>
        <InputGroupInput
          id={id}
          value={value}
          placeholder={placeholder}
          onChange={(event) => onValueChange(event.target.value)}
          autoComplete="off"
        />
        <InputGroupAddon align="inline-start">
          <SearchIcon className="text-muted-foreground" />
        </InputGroupAddon>
      </InputGroup>
    </Field>
  );
}
