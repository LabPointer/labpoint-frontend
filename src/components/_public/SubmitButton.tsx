import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";

interface SubmitButtonProps {
  isLoading: boolean;
  disabled?: boolean;
  form?: string;
  children: React.ReactNode;
}

/**
 * Botão de submit que exibe um spinner enquanto a requisição está em andamento.
 * Fica desabilitado automaticamente durante o carregamento.
 */
export function SubmitButton({ isLoading, disabled, form, children }: SubmitButtonProps) {
  return (
    <Button type="submit" form={form} disabled={isLoading || disabled}>
      {isLoading ? (
        <>
          <Spinner className="mr-2" />
          Aguarde...
        </>
      ) : (
        children
      )}
    </Button>
  );
}
