import type { LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

type IconCountButtonProps = {
  icon: LucideIcon;
  /** Texto para leitor de tela e dica ao passar o mouse (ex.: "Ver horários"). */
  label: string;
  /** Quantidade entre parênteses ao lado do ícone; omitida = só o ícone. */
  count?: number;
  disabled?: boolean;
  title?: string;
  onClick: () => void;
};

/** Botão compacto das tabelas da coordenação: ícone + "(n)", com o nome completo no aria-label/title. */
export function IconCountButton({ icon: Icon, label, count, disabled, title, onClick }: IconCountButtonProps) {
  const fullLabel = count === undefined ? label : `${label} (${count})`;
  return (
    <Button
      type="button"
      variant="outline"
      size={count === undefined ? "icon" : "sm"}
      aria-label={fullLabel}
      title={title ?? fullLabel}
      disabled={disabled}
      onClick={onClick}
    >
      <Icon className="size-4" />
      {count !== undefined && <span className="tabular-nums">({count})</span>}
    </Button>
  );
}
