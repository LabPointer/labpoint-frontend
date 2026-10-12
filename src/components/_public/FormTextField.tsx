import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import type { AnyFieldApi } from "@tanstack/react-form";

interface FormTextFieldProps {
  field: AnyFieldApi;
  label: React.ReactNode;
  placeholder?: string;
  type?: React.HTMLInputTypeAttribute;
  autoComplete?: string;
  disabled?: boolean;
}

/**
 * Campo de texto reutilizável integrado ao TanStack Form.
 * Exibe label, input e mensagem de erro automaticamente.
 */
export function FormTextField({
  field,
  label,
  placeholder,
  type = "text",
  autoComplete = "off",
  disabled,
}: FormTextFieldProps) {
  const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;

  return (
    <Field data-invalid={isInvalid}>
      <FieldLabel className="font-semibold" htmlFor={field.name}>
        {label}
      </FieldLabel>
      <Input
        id={field.name}
        name={field.name}
        value={field.state.value}
        onBlur={field.handleBlur}
        onChange={(e) => field.handleChange(e.target.value)}
        aria-invalid={isInvalid}
        type={type}
        placeholder={placeholder}
        autoComplete={autoComplete}
        disabled={disabled}
      />
      {isInvalid && <FieldError errors={field.state.meta.errors} />}
    </Field>
  );
}
