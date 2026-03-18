import { useState, useEffect, useRef } from 'react';

export function useThrottle<T>(value: T, delay: number = 500): T {
  const [throttledValue, setThrottledValue] = useState<T>(value);
  const lastExecuted = useRef<number>(Date.now());

  useEffect(() => {
    const elapsed = Date.now() - lastExecuted.current;

    if (elapsed >= delay) {
      // Se já passou tempo suficiente desde a última execução, atualiza agora
      setThrottledValue(value);
      lastExecuted.current = Date.now();
    } else {
      // Se não, agenda uma atualização para o tempo restante
      const timer = setTimeout(() => {
        setThrottledValue(value);
        lastExecuted.current = Date.now();
      }, delay - elapsed);

      return () => clearTimeout(timer);
    }
  }, [value, delay]);

  return throttledValue;
}
