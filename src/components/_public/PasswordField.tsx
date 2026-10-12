import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { InputGroup, InputGroupButton, InputGroupInput } from "@/components/ui/input-group";
import type { AnyFieldApi } from "@tanstack/react-form";

interface PasswordFieldProps {
  field: AnyFieldApi;
  label?: React.ReactNode;
  placeholder?: string;
  disabled?: boolean;
  /** Permite compartilhar visibilidade com outro campo (ex.: confirmação de senha). */
  isVisible?: boolean;
  onToggleVisibility?: () => void;
}

/**
 * Campo de senha reutilizável com botão para alternar a visibilidade.
 * Pode ser controlado externamente (isVisible + onToggleVisibility) ou
 * gerenciar seu próprio estado de visibilidade quando não controlado.
 */
export function PasswordField({
  field,
  label = "Senha",
  placeholder = "Senha",
  disabled,
  isVisible: isVisibleProp,
  onToggleVisibility,
}: PasswordFieldProps) {
  const [internalVisible, setInternalVisible] = useState(false);

  const isControlled = isVisibleProp !== undefined && onToggleVisibility !== undefined;
  const isPasswordVisible = isControlled ? isVisibleProp : internalVisible;
  const toggleVisibility = isControlled
    ? onToggleVisibility
    : () => setInternalVisible((v) => !v);

  const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;

  return (
    <Field data-invalid={isInvalid}>
      <FieldLabel className="font-semibold" htmlFor={field.name}>
        {label}
      </FieldLabel>
      <InputGroup>
        <InputGroupInput
          id={field.name}
          name={field.name}
          value={field.state.value}
          onBlur={field.handleBlur}
          onChange={(e) => field.handleChange(e.target.value)}
          aria-invalid={isInvalid}
          type={isPasswordVisible ? "text" : "password"}
          placeholder={placeholder}
          autoComplete="off"
          disabled={disabled}
        />
        <InputGroupButton
          aria-label={isPasswordVisible ? "Ocultar senha" : "Visualizar senha"}
          title={isPasswordVisible ? "Ocultar senha" : "Visualizar senha"}
          size="icon-sm"
          onClick={toggleVisibility}
          type="button"
        >
          {isPasswordVisible ? <EyeOff /> : <Eye />}
        </InputGroupButton>
      </InputGroup>
      {isInvalid && <FieldError errors={field.state.meta.errors} />}
    </Field>
  );
}
