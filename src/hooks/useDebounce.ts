import { useEffect, useState } from "react";

export default function useDebounce<T>(initialState: T, timeout: number = 500) {
    const [state, setState] = useState<T>(initialState);
    const [debouncedValue, setDebouncedValue] = useState<T>(initialState);

    useEffect(() => {
        const timeoutId = setTimeout(() => {
            setDebouncedValue(state);
        }, timeout);

        return () => {
            clearTimeout(timeoutId);
        };
    }, [state, timeout]);

    return [ state, setState, debouncedValue ] as const;
}
