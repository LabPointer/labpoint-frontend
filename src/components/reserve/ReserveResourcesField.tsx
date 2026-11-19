import { Minus, Plus, X } from "lucide-react";
import { useMemo, useState } from "react";
import type { DateRange } from "react-day-picker";
import { useDebouncedValue } from "#/hooks/use-debounced-value";
import { toApiDate } from "#/lib/queries/reserves";
import { type ReserveExclusion, useResources } from "#/lib/queries/resources";
import { RemoteMultiCombobox, type RemoteOption } from "@/components/shared/RemoteCombobox";
import { Button } from "@/components/ui/button";
import { Field, FieldDescription, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";

/** Recurso reservável escolhido numa reserva. */
export type ReservedResource = { id: number; name: string; quantity: number };

type ReserveResourcesFieldProps = {
  id: string;
  label?: string;
  range: DateRange | undefined;
  /** Horários já escolhidos: só aparecem recursos com unidades livres em todos eles. */
  scheduleIds: number[];
  value: ReservedResource[];
  onChange: (value: ReservedResource[]) => void;
  /** Edição: as unidades da própria reserva não contam como ocupadas. */
  exclude?: ReserveExclusion;
  errors?: ({ message?: string } | undefined)[];
};

const OPTIONS_LIMIT = 20;

/**
 * Campo opcional "Recurso reservável": escolhe recursos e a quantidade de cada um.
 * As opções são só os reserváveis ativos com unidades livres no período (e nos horários, se já escolhidos);
 * um recurso que conflita com o horário já definido não aparece.
 */
export function ReserveResourcesField({
  id,
  label = "Recurso reservável (opcional)",
  range,
  scheduleIds,
  value,
  onChange,
  exclude,
  errors,
}: ReserveResourcesFieldProps) {
  const [text, setText] = useState("");
  const search = useDebouncedValue(text, 300);
  const from = range?.from;
  const hasRange = Boolean(from);

  const query = useResources(
    {
      search,
      reservable: true,
      enabled: true,
      limit: OPTIONS_LIMIT,
      startAt: from ? toApiDate(from) : undefined,
      endAt: from ? toApiDate(range?.to ?? from) : undefined,
      scheduleIds,
      minQuantity: 1,
      exclude,
    },
    { enabled: hasRange },
  );

  // unidades livres de cada recurso no período/horários (limite do input de quantidade)
  const available = useMemo(() => {
    const map = new Map<number, number>();
    for (const resource of query.data ?? []) {
      map.set(Number(resource.id), Number(resource.available ?? resource.quantity ?? 0));
    }
    return map;
  }, [query.data]);

  const options = useMemo<RemoteOption[]>(
    () =>
      (query.data ?? []).slice(0, OPTIONS_LIMIT).map((resource) => ({
        id: Number(resource.id),
        name: `${resource.name} (${resource.available ?? resource.quantity} livres)`,
      })),
    [query.data],
  );

  const selected = useMemo<RemoteOption[]>(() => value.map((item) => ({ id: item.id, name: item.name })), [value]);

  function handleSelect(next: RemoteOption[]) {
    const current = new Map(value.map((item) => [item.id, item]));
    onChange(
      next.map((option) => {
        const existing = current.get(option.id);
        // o rótulo da opção traz "(N livres)": guarda só o nome do recurso
        const name = existing?.name ?? option.name.replace(/\s\(\d+ livres\)$/, "");
        return existing ?? { id: option.id, name, quantity: 1 };
      }),
    );
  }

  function setQuantity(resourceId: number, quantity: number) {
    onChange(value.map((item) => (item.id === resourceId ? { ...item, quantity } : item)));
  }

  const hasErrors = Boolean(errors?.length);

  return (
    <Field data-invalid={hasErrors}>
      <FieldLabel htmlFor={id}>{label}</FieldLabel>
      <RemoteMultiCombobox
        id={id}
        label=""
        options={options}
        isLoading={query.isFetching}
        isError={query.isError}
        onSearchChange={setText}
        value={selected}
        onValueChange={handleSelect}
        disabled={!hasRange}
        placeholder={hasRange ? "Notebooks, projetor..." : "Selecione o período primeiro"}
        emptyText="Nenhum recurso livre neste período."
      />

      {value.length > 0 && (
        <ul className="flex flex-col gap-2">
          {value.map((item) => {
            const max = available.get(item.id);
            const overLimit = max !== undefined && item.quantity > max;
            return (
              <li
                key={item.id}
                className="flex items-center gap-2 rounded-md border px-2 py-1.5 dark:border-violet-400/20"
              >
                <span className="min-w-0 flex-1 truncate text-sm font-medium">{item.name}</span>
                <Button
                  type="button"
                  variant="outline"
                  size="icon-sm"
                  aria-label={`Diminuir quantidade de ${item.name}`}
                  disabled={item.quantity <= 1}
                  onClick={() => setQuantity(item.id, item.quantity - 1)}
                >
                  <Minus />
                </Button>
                <Input
                  aria-label={`Quantidade de ${item.name}`}
                  type="number"
                  inputMode="numeric"
                  min={1}
                  max={max}
                  value={item.quantity}
                  onChange={(event) => {
                    const next = event.target.valueAsNumber;
                    if (Number.isInteger(next) && next >= 1) setQuantity(item.id, next);
                  }}
                  aria-invalid={overLimit}
                  className="h-8 w-16 text-center tabular-nums"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="icon-sm"
                  aria-label={`Aumentar quantidade de ${item.name}`}
                  disabled={max !== undefined && item.quantity >= max}
                  onClick={() => setQuantity(item.id, item.quantity + 1)}
                >
                  <Plus />
                </Button>
                <span className="w-16 text-right text-xs text-muted-foreground tabular-nums">
                  {max !== undefined ? `de ${max}` : ""}
                </span>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  aria-label={`Remover ${item.name}`}
                  onClick={() => onChange(value.filter((other) => other.id !== item.id))}
                >
                  <X />
                </Button>
              </li>
            );
          })}
        </ul>
      )}

      {value.length > 0 && (
        <FieldDescription>
          Os recursos acompanham o período e os horários da sala. Horários sem unidades suficientes somem da lista.
        </FieldDescription>
      )}
      {hasErrors && <FieldError errors={errors} />}
    </Field>
  );
}

/** Mesmo conjunto de recursos (ids e quantidades), independente da ordem. */
export function sameResources(a: ReservedResource[], b: ReservedResource[]) {
  const key = (list: ReservedResource[]) =>
    list
      .map((item) => `${item.id}:${item.quantity}`)
      .sort()
      .join(",");
  return key(a) === key(b);
}
