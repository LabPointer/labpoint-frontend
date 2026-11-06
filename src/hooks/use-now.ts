import { useEffect, useState } from "react";

/** Hora atual que se atualiza a cada `intervalMs` (para habilitar botões quando uma janela de horário abre). */
export function useNow(intervalMs = 30_000) {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), intervalMs);
    return () => clearInterval(id);
  }, [intervalMs]);

  return now;
}
