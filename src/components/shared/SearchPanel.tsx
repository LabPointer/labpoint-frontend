import { ChevronDown, Filter, SearchIcon } from "lucide-react";
import { type ReactNode, useState } from "react";
import { useMediaQuery } from "#/hooks/use-media-query";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
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

/** Colunas de no mínimo 16rem: o período não quebra linha e os campos descem quando não cabem. */
const filtersGridClass = "grid grid-cols-[repeat(auto-fit,minmax(min(100%,16rem),1fr))] gap-4";

type SearchFiltersProps = {
  children: ReactNode;
  /** Quantos filtros estão diferentes do padrão; aparece no botão "Filtros (n)" no celular. */
  activeCount?: number;
};

/**
 * Filtros secundários de uma barra de pesquisa. A partir de 640px ficam sempre visíveis numa grade que se ajusta à
 * largura; abaixo disso ficam recolhidos num botão "Filtros", para a lista aparecer logo na primeira tela.
 */
export function SearchFilters({ children, activeCount = 0 }: SearchFiltersProps) {
  const isWide = useMediaQuery("(min-width: 640px)", true);
  const [open, setOpen] = useState(false);

  if (isWide) {
    return <div className={filtersGridClass}>{children}</div>;
  }

  return (
    <Collapsible open={open} onOpenChange={setOpen}>
      <CollapsibleTrigger render={<Button type="button" variant="outline" className="h-10 w-full justify-between" />}>
        <span className="flex items-center gap-2">
          <Filter className="size-4" />
          Filtros{activeCount > 0 && ` (${activeCount})`}
        </span>
        <ChevronDown className={cn("size-4 transition-transform", open && "rotate-180")} />
      </CollapsibleTrigger>
      <CollapsibleContent className={cn(filtersGridClass, "pt-4")}>{children}</CollapsibleContent>
    </Collapsible>
  );
}
