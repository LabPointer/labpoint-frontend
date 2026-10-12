import { useId } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Field, FieldDescription, FieldLabel } from "@/components/ui/field";

type BooleanFieldProps = {
  label: string;
  description?: string;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  trueLabel?: string;
  falseLabel?: string;
  disabled?: boolean;
  /** Explica por que o campo está desabilitado. */
  disabledReason?: string;
};

/** Checkbox com rótulo/descrição. Usa `useId`, então vários dialogs montados não colidem em `id`. */
export function BooleanField({
  label,
  description,
  checked,
  onCheckedChange,
  trueLabel = "Sim",
  falseLabel = "Não",
  disabled = false,
  disabledReason,
}: BooleanFieldProps) {
  const id = useId();

  return (
    <Field>
      <FieldLabel htmlFor={id}>{label}</FieldLabel>
      <Field orientation="horizontal">
        <Checkbox
          id={id}
          checked={checked}
          disabled={disabled}
          onCheckedChange={(value) => onCheckedChange(value === true)}
        />
        <FieldLabel htmlFor={id}>{checked ? trueLabel : falseLabel}</FieldLabel>
      </Field>
      {(disabled && disabledReason) || description ? (
        <FieldDescription>{disabled && disabledReason ? disabledReason : description}</FieldDescription>
      ) : null}
    </Field>
  );
}
