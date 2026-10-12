import { useCallback, useState } from "react";

/**
 * Estado de um dialog de formulário (criar/editar).
 *
 * - `session` muda a cada abertura: use como `key` para remontar o formulário com valores novos
 *   (o `useForm` só lê `defaultValues` uma vez, então sem isso o dialog mostraria dados da abertura anterior).
 * - `target` nunca volta a `null` ao fechar, para o dialog manter a animação de saída.
 * - `mounted` é falso até a primeira abertura (evita montar N formulários à toa).
 */
export function useFormDialog<T = undefined>() {
  const [target, setTarget] = useState<T | undefined>(undefined);
  const [session, setSession] = useState(0);
  const [isOpen, setIsOpen] = useState(false);

  const open = useCallback((nextTarget?: T) => {
    setTarget(nextTarget);
    setSession((current) => current + 1);
    setIsOpen(true);
  }, []);

  const close = useCallback(() => setIsOpen(false), []);

  return { target, session, isOpen, mounted: session > 0, open, close };
}
